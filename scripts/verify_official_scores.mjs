// verify_official_scores.mjs -- the official score API, end to end.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/verify_official_scores.mjs
//   node scripts/teardown_export_fixture.mjs
//
// Exercises the write path a teacher actually uses: create, read back with the
// delta, correct, and be refused once the window has closed. Against
// `next build` and `next start`, never `next dev`.
//
// WHAT THIS SUITE IS FOR, as distinct from verify_official_scores_gate.mjs.
// That one proves WHO may reach the route. This one proves WHAT the route does
// once they are in, and every check here is one that would have passed
// vacuously if the row had never been written: the delta, the null levels for a
// passing student, the computed warning flag, and the correction window.
//
// THE CORRECTION WINDOW IS TESTED BY BACKDATING created_at THROUGH THE SERVICE
// ROLE, not by waiting 24 hours and not by mocking a clock. That is the only way
// to observe the real comparison the real route makes against the real row.
import { spawn, execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chromium } from 'playwright';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 3112;
const BASE = `http://localhost:${PORT}`;
const FIXTURE_DOMAIN = 'csv-export-fixture.example.com';
const ROUTE = `${BASE}/api/teacher/official-scores`;

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

async function main() {
  const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const fixture = (users?.users ?? []).filter((u) =>
    (u.email ?? '').endsWith(`@${FIXTURE_DOMAIN}`)
  );
  if (fixture.length === 0) {
    console.error('No fixture users. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const byEmail = new Map(fixture.map((u) => [u.email, u]));
  const teacher = byEmail.get(`teacher-a@${FIXTURE_DOMAIN}`);
  const ana = byEmail.get(`ana@${FIXTURE_DOMAIN}`);
  const jose = byEmail.get(`jose@${FIXTURE_DOMAIN}`);
  if (!teacher || !ana || !jose) {
    console.error('Fixture incomplete. Re-run the seeder.');
    process.exit(1);
  }

  const { data: classes } = await db
    .from('classes')
    .select('id, name, teacher_id')
    .like('name', 'ZZ CSV Export Fixture%');
  const a1 = (classes ?? []).find((c) => c.name.endsWith('A1'));
  if (!a1) {
    console.error('Fixture class A1 missing.');
    process.exit(1);
  }

  // What practice runs the fixture gave Ana, so the delta has a known answer
  // rather than whatever happens to come back.
  const { data: anaSessions } = await db
    .from('sessions')
    .select('final_score, created_at, completed_at')
    .eq('user_id', ana.id)
    .order('created_at', { ascending: false });
  const completed = (anaSessions ?? []).filter(
    (s) => s.completed_at !== null && s.final_score !== null
  );
  if (completed.length === 0) {
    console.error('Fixture gave Ana no completed sessions; the delta cannot be checked.');
    process.exit(1);
  }
  // The seeder dates its sessions in the past, so a test date of today makes the
  // newest completed run the expected match.
  const expectedPractice = completed[0];
  const today = new Date().toISOString().slice(0, 10);

  console.log('\nBuilding.');
  execSync('npx next build', { stdio: 'inherit' });

  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    console.error(`\nSomething is already listening on ${BASE}. That would test a stale build.`);
    process.exit(1);
  } catch { /* nothing listening, good */ }

  console.log('Starting on', BASE);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  const stop = () => {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { /* group gone */ }
    try { server.kill('SIGKILL'); } catch { /* child gone */ }
  };
  process.on('exit', stop);

  const deadline = Date.now() + 120000;
  for (;;) {
    if (Date.now() > deadline) { stop(); throw new Error('server did not answer within 120s'); }
    try { await fetch(BASE, { signal: AbortSignal.timeout(2000) }); break; }
    catch { await new Promise((r) => setTimeout(r, 500)); }
  }

  const browser = await chromium.launch();

  async function signIn(email) {
    const { data: link } = await db.auth.admin.generateLink({ type: 'magiclink', email });
    const { data: verified } = await anonClient.auth.verifyOtp({
      type: 'magiclink',
      token_hash: link.properties.hashed_token,
    });
    const jar = [];
    const ssr = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => [], setAll: (list) => jar.push(...list) } }
    );
    await ssr.auth.setSession({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
    });
    const ctx = await browser.newContext();
    await ctx.addCookies(jar.map((c) => ({
      name: c.name, value: c.value, domain: 'localhost', path: '/',
      httpOnly: false, secure: false, sameSite: 'Lax',
    })));
    return ctx;
  }

  // Aggregate cleanup state. Declared out here so the finally can reach it even
  // if section 9 throws halfway through.
  let aggregateExists = false;
  let aggregateIdsBefore = new Set();

  try {
    const ctx = await signIn(teacher.email);
    const api = ctx.request;

    // ─── The aggregate snapshot, taken BEFORE anything is created ────────────
    //
    // Every section of this suite that creates an official score also writes an
    // aggregate row, so the snapshot has to be taken here and not down in
    // section 9. Taken late, it captures this run's own rows as pre-existing and
    // the cleanup then leaves them behind in a shared programme table -- which
    // is exactly what happened the first time this was written.
    //
    // The probe doubles as the "has section 5 been run" check, reported in
    // section 9 where a reader is looking for it.
    const aggProbe = await db.from('official_score_aggregate').select('id');
    if (aggProbe.error && (aggProbe.error.code === '42P01' || aggProbe.error.code === 'PGRST205')) {
      aggregateExists = false;
    } else {
      aggregateExists = true;
      aggregateIdsBefore = new Set((aggProbe.data ?? []).map((r) => r.id));
    }

    // ─── 1. A failing result, with strand levels ─────────────────────────────
    console.log('\n1. Create: a student who did not meet the standard');
    const createRes = await api.post(ROUTE, {
      data: {
        student_id: ana.id,
        class_id: a1.id,
        official_crc_score: 942,
        test_date: today,
        level_qr: 'Proficient',
        level_ar: 'Basic',
        level_gr: 'Basic',
        level_pr: 'Advanced',
        affirmed_official_report: true,
      },
    });
    check('a failing result is accepted', createRes.status() === 201, `HTTP ${createRes.status()}`);
    const created = createRes.ok() ? (await createRes.json()).score : null;
    check(
      'the warning flag is FALSE for a failing score with levels',
      created?.entered_despite_warning === false,
      String(created?.entered_despite_warning)
    );

    // ─── 2. A passing result, with no levels ─────────────────────────────────
    console.log('\n2. Create: a student who met the standard');
    const passRes = await api.post(ROUTE, {
      data: {
        student_id: jose.id,
        class_id: a1.id,
        official_crc_score: 968,
        test_date: today,
        affirmed_official_report: true,
      },
    });
    check('a passing result with no levels is accepted', passRes.status() === 201, `HTTP ${passRes.status()}`);
    const passed = passRes.ok() ? (await passRes.json()).score : null;
    check(
      'all four levels stored as NULL, never Advanced',
      passed !== null &&
        passed.level_qr === null && passed.level_ar === null &&
        passed.level_gr === null && passed.level_pr === null,
      `${passed?.level_qr}/${passed?.level_ar}/${passed?.level_gr}/${passed?.level_pr}`
    );

    // ─── 3. The 950-plus anomaly: warn, record, never block ──────────────────
    console.log('\n3. Create: a passing score that carries a level anyway');
    const anomalyRes = await api.post(ROUTE, {
      data: {
        student_id: jose.id,
        class_id: a1.id,
        official_crc_score: 955,
        test_date: today,
        level_qr: 'Advanced',
        affirmed_official_report: true,
      },
    });
    check('the anomaly is ACCEPTED, not blocked', anomalyRes.status() === 201, `HTTP ${anomalyRes.status()}`);
    const anomaly = anomalyRes.ok() ? (await anomalyRes.json()).score : null;
    check(
      'and it is recorded as entered despite the warning',
      anomaly?.entered_despite_warning === true,
      String(anomaly?.entered_despite_warning)
    );

    // ─── 4. Refusals ─────────────────────────────────────────────────────────
    console.log('\n4. Refusals the database and Zod owe us');
    const unaffirmed = await api.post(ROUTE, {
      data: {
        student_id: ana.id, class_id: a1.id, official_crc_score: 940,
        test_date: today, affirmed_official_report: false,
      },
    });
    check('an unaffirmed row is refused', unaffirmed.status() === 400, `HTTP ${unaffirmed.status()}`);

    const outOfRange = await api.post(ROUTE, {
      data: {
        student_id: ana.id, class_id: a1.id, official_crc_score: 909,
        test_date: today, affirmed_official_report: true,
      },
    });
    check('909 is refused', outOfRange.status() === 400, `HTTP ${outOfRange.status()}`);

    const future = await api.post(ROUTE, {
      data: {
        student_id: ana.id, class_id: a1.id, official_crc_score: 940,
        test_date: '2099-01-01', affirmed_official_report: true,
      },
    });
    check('a future test date is refused', future.status() === 400, `HTTP ${future.status()}`);

    // ─── 5. Read back, with the delta ────────────────────────────────────────
    console.log('\n5. Read back');
    const listRes = await api.get(`${ROUTE}?student_id=${ana.id}&class_id=${a1.id}`);
    check('the history reads back', listRes.status() === 200, `HTTP ${listRes.status()}`);
    const list = listRes.ok() ? await listRes.json() : { scores: [] };
    const row = list.scores?.[0];
    check('one row for this student', list.scores?.length === 1, `${list.scores?.length} rows`);
    check(
      'the delta is official minus the latest completed practice run',
      row?.delta === 942 - expectedPractice.final_score,
      `delta=${row?.delta}, expected ${942 - expectedPractice.final_score} (practice ${expectedPractice.final_score})`
    );
    check(
      'the delta names the practice run, never the diagnostic',
      typeof list.delta_label === 'string' &&
        /practice/i.test(list.delta_label) && !/diagnostic/i.test(list.delta_label),
      list.delta_label
    );
    check('a fresh row is correctable', row?.correctable === true, String(row?.correctable));

    // ─── 6. Correct it ───────────────────────────────────────────────────────
    console.log('\n6. Correct, inside the window');
    const patchRes = await api.patch(ROUTE, {
      data: {
        id: row.id,
        official_crc_score: 944,
        test_date: today,
        level_qr: 'Proficient',
        level_ar: 'Basic',
        level_gr: 'Basic',
        level_pr: 'Advanced',
        affirmed_official_report: true,
      },
    });
    check('a correction inside the window succeeds', patchRes.status() === 200, `HTTP ${patchRes.status()}`);
    const corrected = patchRes.ok() ? (await patchRes.json()).score : null;
    check('the new value is stored', corrected?.official_crc_score === 944, String(corrected?.official_crc_score));
    check('and corrected_at is stamped', corrected?.corrected_at !== null, String(corrected?.corrected_at));

    // ─── 7. The window, backdated ────────────────────────────────────────────
    console.log('\n7. The correction window, past its end');
    const longAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    await db.from('official_scores').update({ created_at: longAgo }).eq('id', row.id);

    const staleList = await api.get(`${ROUTE}?student_id=${ana.id}&class_id=${a1.id}`);
    const staleRow = (await staleList.json()).scores?.[0];
    check('the row reports itself no longer correctable', staleRow?.correctable === false, String(staleRow?.correctable));

    const latePatch = await api.patch(ROUTE, {
      data: {
        id: row.id, official_crc_score: 950, test_date: today,
        affirmed_official_report: true,
      },
    });
    // 409, not 403: the teacher is entitled and owns the row, what expired is time.
    check('a late correction is refused with 409', latePatch.status() === 409, `HTTP ${latePatch.status()}`);

    const lateDelete = await api.delete(ROUTE, { data: { id: row.id } });
    check('a late delete is refused with 409', lateDelete.status() === 409, `HTTP ${lateDelete.status()}`);

    const { data: stillThere } = await db
      .from('official_scores').select('official_crc_score').eq('id', row.id).maybeSingle();
    check(
      'and the row is genuinely unchanged, not merely refused',
      stillThere?.official_crc_score === 944,
      String(stillThere?.official_crc_score)
    );

    // ─── 8. Delete inside the window ─────────────────────────────────────────
    console.log('\n8. Delete, inside the window');
    const freshRow = (await (await api.get(`${ROUTE}?student_id=${jose.id}&class_id=${a1.id}`)).json())
      .scores?.[0];
    const delRes = await api.delete(ROUTE, { data: { id: freshRow.id } });
    check('a delete inside the window succeeds', delRes.status() === 200, `HTTP ${delRes.status()}`);
    const { data: gone } = await db
      .from('official_scores').select('id').eq('id', freshRow.id).maybeSingle();
    check('and the row is actually gone', gone === null, gone ? 'still present' : 'removed');

    // ─── 9. The de-identified aggregate ──────────────────────────────────────
    //
    // Section 5 of sql/official_scores.sql makes a security ARGUMENT about this
    // table. This section checks the code actually behaves the way the argument
    // assumes, on a real database, rather than taking the comment's word for it.
    //
    // A SELF-CONTAINED CREATE/CORRECT/DELETE CYCLE, not assertions bolted onto
    // the sections above. The aggregate carries no identifier by construction,
    // so a row can only be found by its CONTENT, and content that collides with
    // another section's row would make every count here ambiguous. 913 and 917
    // are used because nothing else in this suite or the fixture writes them.
    console.log('\n9. The de-identified aggregate');

    if (!aggregateExists) {
      check(
        'official_score_aggregate exists (section 5 of sql/official_scores.sql)',
        false,
        'table missing -- section 5 has not been run on this database'
      );
    } else {
      const aggCreate = await api.post(ROUTE, {
        data: {
          student_id: ana.id,
          class_id: a1.id,
          official_crc_score: 913,
          test_date: today,
          level_qr: 'Basic',
          level_ar: 'Basic',
          level_gr: 'Basic',
          level_pr: 'Basic',
          affirmed_official_report: true,
        },
      });
      check('the cycle row was created', aggCreate.status() === 201, `HTTP ${aggCreate.status()}`);
      const cycleRow = aggCreate.ok() ? (await aggCreate.json()).score : null;

      const month = `${today.slice(0, 7)}-01`;
      const findAgg = async (score) => {
        const { data } = await db
          .from('official_score_aggregate')
          .select('*')
          .eq('official_crc_score', score);
        return data ?? [];
      };

      const made = await findAgg(913);
      check('creating an official score writes ONE aggregate row', made.length === 1, `${made.length} rows`);

      if (made.length === 1) {
        const agg = made[0];

        // THE UNJOINABILITY PROPERTY, checked against the real column set rather
        // than against the CREATE TABLE this file also wrote. A migration run by
        // hand can drift from the SQL in the repo.
        const keys = Object.keys(agg).sort();
        check(
          'the stored row carries no student, class or teacher identifier',
          !keys.some((k) => ['student_id', 'class_id', 'teacher_id', 'entered_by', 'official_score_id'].includes(k)),
          keys.join(', ')
        );

        check('dates are coarsened to the month', agg.test_month === month && agg.recorded_month === month,
          `${agg.test_month} / ${agg.recorded_month}`);

        // The band, never the number. ana's practice history decides which band;
        // what matters is that a BAND is what is stored and that it is one of
        // the four the CHECK accepts.
        check(
          'the practice estimate is stored as a band, not a score',
          ['college_ready', 'approaching', 'below_college_ready', 'no_estimate'].includes(agg.practice_estimate_band),
          String(agg.practice_estimate_band)
        );
        check('the levels came through', agg.level_qr === 'Basic' && agg.level_pr === 'Basic',
          `${agg.level_qr} / ${agg.level_pr}`);
      }

      // ── The correction swap ──────────────────────────────────────────────
      //
      // The hard case. There is no way to look up "that row's aggregate row",
      // so a correction removes one row matching the OLD content and inserts
      // one matching the new. What must hold afterwards is a multiset property:
      // the old value is gone, the new value is there, and the TOTAL has not
      // moved. A build that inserted without removing would pass the first two
      // and fail the third, which is why the total is asserted.
      if (cycleRow?.id) {
        const totalBefore = (await db.from('official_score_aggregate').select('id')).data?.length ?? 0;

        const fix = await api.patch(ROUTE, {
          data: {
            id: cycleRow.id,
            official_crc_score: 917,
            test_date: today,
            level_qr: 'Basic',
            level_ar: 'Basic',
            level_gr: 'Basic',
            level_pr: 'Basic',
            affirmed_official_report: true,
          },
        });
        check('the correction succeeded', fix.status() === 200, `HTTP ${fix.status()}`);

        check('the corrected value is in the aggregate', (await findAgg(917)).length === 1, '');
        check('and the uncorrected value is NOT', (await findAgg(913)).length === 0,
          `${(await findAgg(913)).length} stale rows`);

        const totalAfter = (await db.from('official_score_aggregate').select('id')).data?.length ?? 0;
        check('a correction does not inflate the sitting count', totalAfter === totalBefore,
          `${totalBefore} -> ${totalAfter}`);

        // ── The delete ────────────────────────────────────────────────────
        //
        // A mistaken entry, removed a minute later, must stop counting as a
        // sitting. Without this it counts forever.
        const wipe = await api.delete(ROUTE, { data: { id: cycleRow.id } });
        check('the cycle row was deleted', wipe.status() === 200, `HTTP ${wipe.status()}`);
        check('deleting an official score removes its aggregate row too',
          (await findAgg(917)).length === 0, `${(await findAgg(917)).length} orphans`);

        const totalEnd = (await db.from('official_score_aggregate').select('id')).data?.length ?? 0;
        // Against the count before the CYCLE, not against the pre-run snapshot:
        // sections 1 to 3 legitimately left rows behind, and the cleanup is what
        // removes those.
        check('and the count returns to where the cycle started',
          totalEnd === totalBefore - 1, `${totalEnd} vs ${totalBefore - 1}`);
      }
    }
  } finally {
    // Fixture rows only. The teardown deletes the users these hang off anyway;
    // this keeps a re-run of this suite from seeing the previous run's rows.
    await db.from('official_scores').delete().in('student_id', [ana.id, jose.id]);

    // ONLY rows this run added. The aggregate is programme-level and shared, and
    // it holds no identifier that could tell this run's rows from anyone else's
    // -- so the snapshot taken before section 9 is the only safe basis for a
    // delete. Deleting by content signature could take a real row.
    if (aggregateExists) {
      const { data: now } = await db.from('official_score_aggregate').select('id');
      const mine = (now ?? []).map((r) => r.id).filter((id) => !aggregateIdsBefore.has(id));
      if (mine.length > 0) await db.from('official_score_aggregate').delete().in('id', mine);
    }

    await browser.close();
    stop();
  }

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
