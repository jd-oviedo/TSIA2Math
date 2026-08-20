// teardown_export_fixture.mjs -- remove every row scripts/seed_export_fixture.mjs made.
//
//   node scripts/teardown_export_fixture.mjs
//
// Deletes on the fixture markers and on nothing else:
//
//   auth users whose email ends @csv-export-fixture.example.com
//   classes whose name starts "ZZ CSV Export Fixture"
//
// Order matters, and it is the reverse of creation: responses before sessions,
// enrolments before classes, everything before the users they point at. The
// script deletes explicitly at each level rather than trusting cascades, then
// verifies zero remain, because "the cascade probably handled it" is exactly
// the assumption that leaves fixture rows in a production table for a year.
//
// Safe to run twice. Safe to run when nothing exists.
import { admin, EMAIL_DOMAIN, CLASS_PREFIX } from './seed_export_fixture.mjs';

async function main() {
  const db = admin();
  console.log('Removing CSV export fixture.\n');

  // ─── 1. Find the fixture users ────────────────────────────────────────────
  const fixtureUsers = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error(`  FAILED to list users: ${error.message}`);
      process.exit(1);
    }
    const users = data?.users ?? [];
    for (const u of users) {
      if ((u.email ?? '').endsWith(`@${EMAIL_DOMAIN}`)) fixtureUsers.push(u);
    }
    if (users.length < 1000) break;
  }
  const userIds = fixtureUsers.map((u) => u.id);
  console.log(`  found  ${userIds.length} fixture users`);

  // ─── 2. Find the fixture classes ──────────────────────────────────────────
  const { data: classes, error: cErr } = await db
    .from('classes')
    .select('id, name')
    .like('name', `${CLASS_PREFIX}%`);
  if (cErr) {
    console.error(`  FAILED to list classes: ${cErr.message}`);
    process.exit(1);
  }
  const classIds = (classes ?? []).map((c) => c.id);
  console.log(`  found  ${classIds.length} fixture classes`);

  // ─── 3. Responses, then sessions ──────────────────────────────────────────
  if (userIds.length > 0) {
    const { data: sessions, error: sErr } = await db
      .from('sessions')
      .select('id')
      .in('user_id', userIds);
    if (sErr) {
      console.error(`  FAILED to list sessions: ${sErr.message}`);
      process.exit(1);
    }
    const sessionIds = (sessions ?? []).map((s) => s.id);

    if (sessionIds.length > 0) {
      const { error } = await db.from('responses').delete().in('session_id', sessionIds);
      if (error) {
        console.error(`  FAILED to delete responses: ${error.message}`);
        process.exit(1);
      }
      console.log(`  delete responses for ${sessionIds.length} sessions`);

      const { error: dsErr } = await db.from('sessions').delete().in('id', sessionIds);
      if (dsErr) {
        console.error(`  FAILED to delete sessions: ${dsErr.message}`);
        process.exit(1);
      }
      console.log(`  delete ${sessionIds.length} sessions`);
    }

    // Any misconception rows the seed's sessions might have accumulated. The
    // seed does not call record_misconception, but a row here would be invisible
    // and permanent, so it is cleared rather than assumed absent.
    const { error: mErr } = await db
      .from('student_misconceptions')
      .delete()
      .in('student_id', userIds);
    if (mErr) console.log(`  note: student_misconceptions delete said "${mErr.message}"`);
  }

  // ─── 4. Enrolments, then classes ──────────────────────────────────────────
  if (classIds.length > 0) {
    const { error } = await db.from('class_enrollments').delete().in('class_id', classIds);
    if (error) {
      console.error(`  FAILED to delete enrolments: ${error.message}`);
      process.exit(1);
    }
    console.log('  delete enrolments');

    const { error: dcErr } = await db.from('classes').delete().in('id', classIds);
    if (dcErr) {
      console.error(`  FAILED to delete classes: ${dcErr.message}`);
      process.exit(1);
    }
    console.log(`  delete ${classIds.length} classes`);
  }

  // ─── 5. Audit rows the verification run wrote ─────────────────────────────
  if (userIds.length > 0) {
    const { error } = await db
      .from('audit_log')
      .delete()
      .eq('action', 'teacher_export')
      .in('user_id', userIds);
    if (error) console.log(`  note: audit_log delete said "${error.message}"`);
    else console.log('  delete fixture audit_log rows');
  }

  // ─── 6. The users themselves ──────────────────────────────────────────────
  for (const u of fixtureUsers) {
    const { error } = await db.auth.admin.deleteUser(u.id);
    if (error) {
      console.error(`  FAILED to delete user ${u.email}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`  delete ${fixtureUsers.length} users`);

  // ─── 7. Prove it ──────────────────────────────────────────────────────────
  //
  // A teardown that reports success without looking is the same as no teardown.
  console.log('\nVerifying nothing remains.');
  let remaining = 0;

  const { data: leftClasses } = await db
    .from('classes')
    .select('id, name')
    .like('name', `${CLASS_PREFIX}%`);
  console.log(`  classes matching the marker : ${leftClasses?.length ?? 0}`);
  remaining += leftClasses?.length ?? 0;

  let leftUsers = 0;
  for (let page = 1; ; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    const users = data?.users ?? [];
    leftUsers += users.filter((u) => (u.email ?? '').endsWith(`@${EMAIL_DOMAIN}`)).length;
    if (users.length < 1000) break;
  }
  console.log(`  users matching the marker   : ${leftUsers}`);
  remaining += leftUsers;

  if (userIds.length > 0) {
    const { data: leftSessions } = await db.from('sessions').select('id').in('user_id', userIds);
    console.log(`  sessions for fixture users  : ${leftSessions?.length ?? 0}`);
    remaining += leftSessions?.length ?? 0;
  }

  if (remaining === 0) {
    console.log('\nTeardown complete. Nothing remains.');
  } else {
    console.error(`\nTEARDOWN INCOMPLETE: ${remaining} rows still present.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
