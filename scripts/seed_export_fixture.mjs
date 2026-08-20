// seed_export_fixture.mjs -- throwaway data for verifying the teacher CSV exports.
//
//   node scripts/seed_export_fixture.mjs        create the fixture
//   node scripts/teardown_export_fixture.mjs    remove every trace of it
//
// WHY THIS EXISTS
//
// Production cannot verify this feature. It holds 7 classes across 6 teachers,
// 3 enrolments in total, and exactly one class with more than one student, of
// whom only one has ever taken a test. Row counts cross-checked against that
// prove nothing, and the authorisation cases cannot be demonstrated at all:
// showing that a teacher is refused ANOTHER teacher's class requires a second
// teacher who actually owns one, and showing that a non-teacher is refused
// requires a non-teacher account whose session we are allowed to mint.
//
// It also cannot verify the encoding. Zero of the 34 accounts in production
// carry a non-ASCII display name, so the UTF-8 BOM requirement has nothing real
// to act on. The students below are named accordingly.
//
// WHY THE ADMIN API RATHER THAN THE SQL EDITOR
//
// Everything except the auth users could be seeded from SQL. The auth users
// could not, sensibly: creating one by hand means writing auth.users and
// auth.identities together with an encrypted password and the right provider
// rows, which is fragile to write and worse to undo. admin.auth.admin.createUser
// is the supported path and admin.auth.admin.deleteUser reverses it exactly, so
// the teardown can be trusted. profiles rows arrive on their own, from the
// existing on-signup trigger, and are removed with the user by the FK cascade.
//
// NOTHING HERE TOUCHES REAL DATA. Every row created carries the fixture marker
// below, and the teardown deletes on that marker alone.
// Markers and the client factory live in a module with no top level to run.
// This file used to export them itself, which meant the teardown imported THIS
// file to get them and thereby executed the seeder. See the note at the head of
// export_fixture_common.mjs for what that did.
import { admin, isEntrypoint, EMAIL_DOMAIN, CLASS_PREFIX } from './export_fixture_common.mjs';

// ─── The cast ────────────────────────────────────────────────────────────────
//
// Names are chosen to exercise the writer against the shapes the audit said the
// CSV would have to survive, using the real pipeline rather than a unit test:
//
//   accents        -> the BOM requirement has something to prove itself on
//   a comma        -> the field must be quoted or the row gains a column
//   an apostrophe  -> must NOT be quoted, and must not be mistaken for an escape
//   a leading +    -> the formula-injection guard, fired by a real display name
//
// The last one is the point of doing this end to end. A student can type
// anything into their Google account, and "+Mateo, Jr." is a perfectly ordinary
// thing for a person to have typed.
const STUDENTS = [
  { slug: 'ana', name: 'Ana Peña', sessions: 3 },
  { slug: 'jose', name: 'José Martínez', sessions: 2 },
  { slug: 'sofia', name: 'Sofía Rodríguez', sessions: 1 },
  { slug: 'renee', name: "Renée O'Connor", sessions: 1 },
  { slug: 'mateo', name: '+Mateo, Jr.', sessions: 2 },
  // Enrolled but has never tested. Proves the empty-cell path for score, band
  // and strand accuracy rather than a row of zeroes.
  { slug: 'noel', name: 'Noel Sin-Examen', sessions: 0 },
];

const TEACHERS = [
  { slug: 'teacher-a', name: 'Fixture Teacher A' },
  { slug: 'teacher-b', name: 'Fixture Teacher B' },
];

const email = (slug) => `${slug}@${EMAIL_DOMAIN}`;

const STRANDS = [
  ['QR', 6], ['AR', 7], ['GR', 3], ['PR', 4],
];

/** Deterministic pseudo-random so re-running the seed gives the same numbers. */
function rng(seed) {
  let x = seed;
  return () => ((x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}

function makeBreakdown(rand) {
  const bd = {};
  let correct = 0;
  let total = 0;
  for (const [code, n] of STRANDS) {
    const c = Math.floor(rand() * (n + 1));
    bd[code] = { correct: c, total: n, pct: Math.round((c / n) * 100) };
    correct += c;
    total += n;
  }
  // Roughly the CAT's reporting range, so bands land across all three.
  const score = 910 + Math.round((correct / total) * 80);
  return { bd, score };
}

async function main() {
  const db = admin();
  console.log('Seeding CSV export fixture.\n');

  // ─── 1. Users ─────────────────────────────────────────────────────────────
  const ids = {};
  for (const p of [...TEACHERS, ...STUDENTS]) {
    const { data, error } = await db.auth.admin.createUser({
      email: email(p.slug),
      email_confirm: true,
      user_metadata: { full_name: p.name },
    });
    if (error) {
      console.error(`  FAILED to create ${email(p.slug)}: ${error.message}`);
      console.error('  Run scripts/teardown_export_fixture.mjs first if the fixture already exists.');
      process.exit(1);
    }
    ids[p.slug] = data.user.id;
    console.log(`  user   ${p.name.padEnd(22)} ${data.user.id}`);
  }

  // profiles rows arrive from the on-signup trigger with role='student'.
  // Promote the two teachers, so requireTeacher() passes for them and so the
  // student accounts stay genuinely non-teacher for the 403 case.
  for (const t of TEACHERS) {
    const { error } = await db
      .from('profiles')
      .update({ role: 'teacher', plan: 'teacher-pro', plan_status: 'active', subscription_status: 'active' })
      .eq('id', ids[t.slug]);
    if (error) {
      console.error(`  FAILED to promote ${t.slug}: ${error.message}`);
      process.exit(1);
    }
    console.log(`  role   ${t.name} -> teacher / teacher-pro / active`);
  }

  // ─── 2. Classes ───────────────────────────────────────────────────────────
  //
  // Two owned by Teacher A so the multi-select path is exercised with a real
  // array, and one owned by Teacher B so the cross-teacher refusal has a
  // genuine target rather than an invented uuid.
  //
  // The join codes use 0 and 1 on purpose. The real generator's alphabet is
  // "23456789ABCDEFGHJKMNPQRSTUVWXYZ", which drops 0/O and 1/I/L because codes
  // get read off a projector, so a fixture code containing them can never
  // collide with a generated one and is recognisable as fixture data on sight.
  const classSpec = [
    { key: 'a1', teacher: 'teacher-a', name: `${CLASS_PREFIX} A1`, code: 'ZZF001' },
    { key: 'a2', teacher: 'teacher-a', name: `${CLASS_PREFIX} A2, Period 3`, code: 'ZZF002' },
    { key: 'b1', teacher: 'teacher-b', name: `${CLASS_PREFIX} B1`, code: 'ZZF003' },
  ];
  const classIds = {};
  for (const c of classSpec) {
    const { data, error } = await db
      .from('classes')
      .insert({ teacher_id: ids[c.teacher], name: c.name, join_code: c.code })
      .select('id')
      .single();
    if (error) {
      console.error(`  FAILED to create class ${c.name}: ${error.message}`);
      process.exit(1);
    }
    classIds[c.key] = data.id;
    console.log(`  class  ${c.name.padEnd(34)} ${data.id}`);
  }

  // ─── 3. Enrolments ────────────────────────────────────────────────────────
  //
  // Ana is in BOTH of Teacher A's classes on purpose: the scores file is one
  // row per session per enrolment, so she must appear under both class names,
  // and an all-classes export must not silently deduplicate her away.
  const enrolments = [
    { student: 'ana', cls: 'a1', via: 'join_code' },
    { student: 'jose', cls: 'a1', via: 'join_code' },
    { student: 'sofia', cls: 'a1', via: 'teacher_invite' },
    { student: 'renee', cls: 'a1', via: 'teacher_invite' },
    { student: 'noel', cls: 'a1', via: 'join_code' },
    { student: 'ana', cls: 'a2', via: 'join_code' },
    { student: 'mateo', cls: 'a2', via: 'join_code' },
    { student: 'mateo', cls: 'b1', via: 'join_code' },
  ];
  const { error: enrErr } = await db.from('class_enrollments').insert(
    enrolments.map((e, i) => ({
      class_id: classIds[e.cls],
      student_id: ids[e.student],
      enrolled_via: e.via,
      status: 'active',
      enrolled_at: new Date(Date.UTC(2026, 7, 1 + i, 12)).toISOString(),
    }))
  );
  if (enrErr) {
    console.error(`  FAILED to enrol: ${enrErr.message}`);
    process.exit(1);
  }
  console.log(`  enrol  ${enrolments.length} rows`);

  // ─── 4. Sessions and responses ────────────────────────────────────────────
  const { data: items, error: itemErr } = await db
    .from('questions')
    .select('item_id, correct_answer')
    .order('item_id', { ascending: true })
    .limit(40);
  if (itemErr) {
    console.error(`  FAILED to read items: ${itemErr.message}`);
    process.exit(1);
  }

  const rand = rng(20260820);
  let sessionCount = 0;
  let responseCount = 0;
  let noResponseSessions = 0;

  for (const s of STUDENTS) {
    for (let n = 0; n < s.sessions; n++) {
      const { bd, score } = makeBreakdown(rand);
      const created = new Date(Date.UTC(2026, 7, 5 + n * 4, 14, 30));
      const { data: sess, error: sErr } = await db
        .from('sessions')
        .insert({
          user_id: ids[s.slug],
          // First run is the diagnostic, every later one is practice. Same rule
          // the sessions_session_type backfill applied to real rows.
          session_type: n === 0 ? 'diagnostic' : 'practice',
          final_score: score,
          max_items: 20,
          strand_breakdown: bd,
          created_at: created.toISOString(),
          completed_at: new Date(created.getTime() + 22 * 60000).toISOString(),
        })
        .select('id')
        .single();
      if (sErr) {
        console.error(`  FAILED to create session for ${s.slug}: ${sErr.message}`);
        process.exit(1);
      }
      sessionCount++;

      // Sofía's only session gets NO responses rows, so time_on_items_seconds
      // has a real empty cell to prove rather than a zero.
      if (s.slug === 'sofia') {
        noResponseSessions++;
        continue;
      }

      const rows = items.slice(0, 20).map((it, i) => ({
        session_id: sess.id,
        item_id: it.item_id,
        selected_answer: ['A', 'B', 'C', 'D'][Math.floor(rand() * 4)],
        is_correct: rand() > 0.45,
        elapsed_ms: 20000 + Math.floor(rand() * 60000),
        answered_at: new Date(created.getTime() + i * 45000).toISOString(),
      }));
      const { error: rErr } = await db.from('responses').insert(rows);
      if (rErr) {
        console.error(`  FAILED to insert responses: ${rErr.message}`);
        process.exit(1);
      }
      responseCount += rows.length;
    }
  }
  console.log(`  session ${sessionCount} rows (${noResponseSessions} deliberately without responses)`);
  console.log(`  respons ${responseCount} rows`);

  // ─── 5. Session minting self-check ────────────────────────────────────────
  //
  // The verification script needs to make requests AS these accounts, and this
  // project is Google OAuth only, so there is no password to sign in with. The
  // route out is an admin-generated magic link, exchanged for a real session by
  // verifyOtp. Proven here rather than discovered later.
  const { data: link, error: linkErr } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email: email('teacher-a'),
  });
  if (linkErr) {
    console.log(`\n  NOTE: generateLink failed (${linkErr.message}).`);
    console.log('  The 403 cases will need another route. Report before proceeding.');
  } else {
    console.log(`\n  session minting: OK (token_hash present: ${Boolean(link?.properties?.hashed_token)})`);
  }

  console.log('\nFixture ready.');
  console.log(`  Teacher A  ${ids['teacher-a']}  owns A1 + A2`);
  console.log(`  Teacher B  ${ids['teacher-b']}  owns B1  <- Teacher A must be refused this`);
  console.log(`  Class A1   ${classIds.a1}`);
  console.log(`  Class A2   ${classIds.a2}`);
  console.log(`  Class B1   ${classIds.b1}`);
  console.log('\nWhen finished: node scripts/teardown_export_fixture.mjs');
}

// Gated so that importing this file can never seed a database. The teardown no
// longer imports it at all, and this makes it harmless if anything ever does.
if (isEntrypoint(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.error(
    'seed_export_fixture.mjs was imported rather than run. Nothing was seeded. ' +
      'Import scripts/export_fixture_common.mjs for the shared helpers.'
  );
}
