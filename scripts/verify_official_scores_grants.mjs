// verify_official_scores_grants.mjs -- what the AUTHENTICATED role can actually
// do to the two official-score tables, asked of PostgREST with a real teacher
// JWT rather than read off a grant table.
//
//   node scripts/seed_export_fixture.mjs
//   node scripts/verify_official_scores_grants.mjs
//   node scripts/teardown_export_fixture.mjs
//
// WHY THIS EXISTS, AND WHY audit_anon_exposure.py DID NOT CATCH IT
// ----------------------------------------------------------------
// audit_anon_exposure.py probes the ANON key. That is the right instrument for
// the failure it was written after -- curriculum_topics readable by a key that
// ships in the browser bundle -- and it is structurally incapable of seeing the
// failure found on 2026-08-23, which was a SELECT grant to AUTHENTICATED on
// official_score_aggregate. Anon returned 42501 on that table the whole time.
// The table was described in its own migration as having "no grant and no
// policy at all" and had one, inherited from Supabase's ALTER DEFAULT
// PRIVILEGES rather than written by anyone.
//
// A signed-in teacher is not a stranger, and "not readable by strangers" is a
// weaker claim than the one section 5 of sql/official_scores.sql makes. This
// file asks the stronger question.
//
// NOTHING IS WRITTEN, AND THAT IS ARRANGED RATHER THAN HOPED FOR
// --------------------------------------------------------------
// Both write probes are built so that a HELD grant still touches no row:
//
//   UPDATE and DELETE go through a self-contradictory filter
//   (id is null AND id is not null). The statement is authorised, planned and
//   matches nothing, so the grant is revealed without a row moving. Borrowed
//   from audit_anon_exposure.py, which explains why an empty PATCH body cannot
//   be used: PostgREST answers those 204 without executing anything, which
//   reads as a grant on every table in the database.
//
//   INSERT carries a body the CHECK constraints must refuse -- 909, below the
//   scale, with affirmed_official_report false. The two outcomes are then
//   distinguishable and neither leaves a row:
//
//     42501 permission denied  -> no insert grant. This is the pass.
//     23514 check violation    -> THE INSERT GRANT EXISTS. The statement got
//                                 far enough for Postgres to evaluate the
//                                 constraint, which it only does for a caller
//                                 allowed to insert. Nothing was written, and
//                                 the finding is serious: a teacher could write
//                                 an official score with their own affirmation
//                                 flag, straight past the API and its plan
//                                 check.
//
// A 401 with any other code is reported verbatim rather than assumed benign.

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FIXTURE_DOMAIN = 'csv-export-fixture.example.com';

const db = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(URL, ANON);

let failures = 0;
function check(label, ok, detail = '') {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
}

/** A real signed-in teacher's access token. See the harness-session-minting note. */
async function teacherToken() {
  const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const teacher = (users?.users ?? []).find(
    (u) => u.email === `teacher-a@${FIXTURE_DOMAIN}`
  );
  if (!teacher) {
    console.error('No fixture teacher. Run: node scripts/seed_export_fixture.mjs');
    process.exit(1);
  }
  const { data: link, error: linkErr } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email: teacher.email,
  });
  if (linkErr) throw new Error(`generateLink failed: ${linkErr.message}`);
  const { data: verified, error: otpErr } = await anonClient.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link.properties.hashed_token,
  });
  if (otpErr) throw new Error(`verifyOtp failed: ${otpErr.message}`);

  // Read the role back rather than assuming the fixture is what it says it is.
  const { data: profile } = await db
    .from('profiles').select('role, plan').eq('id', teacher.id).maybeSingle();
  return { token: verified.session.access_token, id: teacher.id, profile };
}

async function rest(token, path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let code = null;
  try { code = JSON.parse(text).code ?? null; } catch { /* not json */ }
  return { status: res.status, code, text };
}

const DENIED = '42501';

/**
 * What a PostgREST answer actually means about privilege, as three named states
 * rather than a status code.
 *
 * The distinction this exists to make is 'refused' versus 'empty-array'. Both
 * hand a caller zero rows and both look identical to anyone reading the response
 * body, but they are one deleted policy apart:
 *
 *   refused      no privilege. Nothing to filter, so nothing a policy change
 *                could expose.
 *   empty-array  the grant is HELD and RLS is the only thing standing between
 *                the caller and the rows. Safe today, one mistake from not.
 *
 * Returned as a value so the same predicate serves both the assertion and the
 * control below, which is what stops the two drifting apart.
 */
function verdict(res) {
  if (res.code === DENIED) return 'refused';
  if (res.status === 200 && res.text.trim() === '[]') return 'empty-array';
  if (res.status === 200) return 'rows';
  return `other(${res.status} ${res.code ?? '?'})`;
}

async function main() {
  const { token, profile } = await teacherToken();

  console.log('\n0. The JWT is a real teacher, verified rather than assumed');
  check(
    'the probing account is role=teacher',
    profile?.role === 'teacher',
    `role=${profile?.role} plan=${profile?.plan}`
  );

  // ─── official_scores ───────────────────────────────────────────────────────
  //
  // SELECT is granted here ON PURPOSE, unlike the aggregate. The policy
  // official_scores_select_own_class is what confines it to the teacher's own
  // classes, and a grant with no policy would yield everything -- so the read
  // succeeding is the CONTROL that makes the three refusals below meaningful.
  console.log('\n1. official_scores -- SELECT granted, everything else refused');

  const read = await rest(token, 'official_scores?select=id&limit=1');
  check(
    'a signed-in teacher may SELECT',
    read.status === 200,
    `HTTP ${read.status} ${read.code ?? ''}`
  );

  // Refused by the CHECK constraints if the grant exists, by the grant if not.
  const insert = await rest(token, 'official_scores', {
    method: 'POST',
    body: JSON.stringify({
      student_id: '00000000-0000-0000-0000-000000000000',
      class_id: '00000000-0000-0000-0000-000000000000',
      entered_by: '00000000-0000-0000-0000-000000000000',
      official_crc_score: 909,
      test_date: '2026-01-01',
      affirmed_official_report: false,
    }),
  });
  check(
    'a signed-in teacher may NOT INSERT',
    insert.code === DENIED,
    insert.code === '23514'
      ? 'INSERT GRANT EXISTS -- refused by a CHECK, not by privilege'
      : `HTTP ${insert.status} ${insert.code ?? insert.text.slice(0, 80)}`
  );

  // Self-contradictory filter: authorised, planned, matches nothing.
  const update = await rest(
    token,
    'official_scores?id=is.null&id=not.is.null',
    { method: 'PATCH', body: JSON.stringify({ official_crc_score: 999 }) }
  );
  check(
    'a signed-in teacher may NOT UPDATE',
    update.code === DENIED,
    `HTTP ${update.status} ${update.code ?? 'no error code -- grant held'}`
  );

  const del = await rest(
    token,
    'official_scores?id=is.null&id=not.is.null',
    { method: 'DELETE' }
  );
  check(
    'a signed-in teacher may NOT DELETE',
    del.code === DENIED,
    `HTTP ${del.status} ${del.code ?? 'no error code -- grant held'}`
  );

  // ─── official_score_aggregate ──────────────────────────────────────────────
  //
  // THE REGRESSION CHECK FOR THE 2026-08-23 FINDING. A permission error is the
  // pass. An EMPTY ARRAY is a failure and not a smaller one: it would mean the
  // grant is back and only RLS-with-no-policy is filtering, which is one
  // mistakenly added policy away from exposure. That distinction is the entire
  // point of this section, so the two are reported differently.
  console.log('\n2. official_score_aggregate -- nothing at all, for anyone but service_role');

  const agg = await rest(token, 'official_score_aggregate?select=id&limit=1');
  const aggVerdict = verdict(agg);
  check(
    'a signed-in teacher is REFUSED, not merely filtered to zero rows',
    aggVerdict === 'refused',
    aggVerdict === 'empty-array'
      ? 'EMPTY ARRAY -- the grant is back, RLS is the only defence left'
      : `${aggVerdict} (HTTP ${agg.status} ${agg.code ?? agg.text.slice(0, 80)})`
  );

  const aggWrite = await rest(
    token,
    'official_score_aggregate?id=is.null&id=not.is.null',
    { method: 'DELETE' }
  );
  check(
    'and may not DELETE from it',
    aggWrite.code === DENIED,
    `HTTP ${aggWrite.status} ${aggWrite.code ?? 'no error code -- grant held'}`
  );

  // ─── anon, for completeness ────────────────────────────────────────────────
  //
  // Cheap, and it keeps the two roles' answers side by side. The whole reason
  // the finding survived review is that anon looked clean and was reported as
  // such while authenticated was never asked.
  console.log('\n3. anon -- the role audit_anon_exposure.py already covers');
  for (const table of ['official_scores', 'official_score_aggregate']) {
    const r = await rest(ANON, `${table}?select=id&limit=1`);
    check(`anon is refused ${table}`, r.code === DENIED, `HTTP ${r.status} ${r.code ?? ''}`);
  }

  // ─── The control ───────────────────────────────────────────────────────────
  //
  // A grant cannot be injected from here to watch section 2 go red: GRANT is
  // DDL and PostgREST does not execute it, which is the same reason this file
  // asks questions instead of reading pg_catalog. So the discrimination is
  // proved from the other end.
  //
  // official_scores is the empty-array case, genuinely and by design: it GRANTS
  // select to authenticated, official_scores_select_own_class filters, and this
  // teacher currently owns nothing in it. If verdict() could not tell that apart
  // from a refusal, section 2 would pass whether or not the grant came back,
  // and this whole file would be decoration.
  console.log('\n4. The control -- that the check above can tell the two apart');
  const control = verdict(await rest(token, 'official_scores?select=id&limit=1'));
  check(
    'a granted-but-filtered table reads as something OTHER than refused',
    control !== 'refused',
    `official_scores verdict: ${control}`
  );
  console.log(
    `        so an aggregate verdict of "${control}" would FAIL section 2, ` +
    'which is the regression this file exists to catch.'
  );

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(1); });
