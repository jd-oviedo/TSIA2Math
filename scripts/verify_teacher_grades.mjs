// verify_teacher_grades.mjs -- the Build 3 spot-check, against a real teacher
// session on real production data.
//
//   npm run build                                   (once; this does NOT rebuild)
//   node --import ./scripts/ts-alias-hook.mjs scripts/verify_teacher_grades.mjs
//
// WHAT IT PROVES, in the order it matters:
//
//   1. vics8388 reads "—" and "2 of 3 topics quizzed" on the roster, NOT an F.
//      He has two quizzed topics and five answered questions; without the
//      minimum-evidence gate the arithmetic succeeds and hands him a 38% F.
//   2. A topic he PRACTISED and never quizzed (QR.1.5) shows completion
//      progress and is absent from the grade -- the two-axis rule, on live data.
//   3. Both definitions arrive, per topic, and disagree: GR.4.3 is 1/3 latest
//      and 2/4 mastery.
//   4. quiz_score appears in NO response body. Ruling A, checked as a string
//      search over the raw text rather than over a parsed object, so a nested
//      or renamed leak is still caught.
//   5. The student's own /dashboard/grades number is unchanged by the extract,
//      recomputed here from the frozen oracle over his entire real attempt log
//      rather than over the harness's fixture subset.
//   6. All four entry points answer 200 and resolve to one gradebook route.
//
// NO PLAYWRIGHT. Cookies go straight onto fetch. A browser would add ~400MB to
// a Codespace that is already memory-gated, and every assertion here is about a
// response body rather than about a rendered pixel.
//
// READ-ONLY. This script writes nothing, to any table, at any point.

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const PORT = 3117;
const BASE = `http://localhost:${PORT}`;
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const db = createClient(URL_, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anonClient = createClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CLASS_NAME = 'Sample Class 1';
const STUDENT_EMAIL = 'vics8388@gmail.com';

let failures = 0;
function check(label, ok, detail = '') {
  if (!ok) failures += 1;
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${label}${detail ? `\n        ${detail}` : ''}`);
}

// ─── The frozen oracle, again ────────────────────────────────────────────────
// app/dashboard/grades/page.tsx:35-61 as it stood at ae0e486. Duplicated from
// faultproof_grades_extract.mjs on purpose: that one runs fixtures, this one
// runs the student's ENTIRE real attempt log, and an oracle shared between them
// could be softened once and stop guarding both.
function referenceReducer(attempts) {
  const latest = new Map();
  for (const a of attempts) {
    const key = `${a.course_id}:${a.topic_id}:${a.section}:${a.item_number}`;
    if (!latest.has(key)) latest.set(key, { is_correct: a.is_correct, created_at: a.created_at });
  }
  const rows = new Map();
  for (const [key, value] of latest) {
    const [courseId, topicId, section] = key.split(':');
    const rowKey = `${courseId}:${topicId}:${section}`;
    const existing = rows.get(rowKey);
    if (existing) {
      existing.total += 1;
      if (value.is_correct) existing.correct += 1;
      if (value.created_at > existing.last) existing.last = value.created_at;
    } else {
      rows.set(rowKey, { key: rowKey, correct: value.is_correct ? 1 : 0, total: 1, last: value.created_at });
    }
  }
  return rows;
}

async function signInHeader(email) {
  const { data: link, error: linkErr } = await db.auth.admin.generateLink({ type: 'magiclink', email });
  if (linkErr) throw new Error(`generateLink failed for ${email}: ${linkErr.message}`);
  const { data: verified, error: otpErr } = await anonClient.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link.properties.hashed_token,
  });
  if (otpErr) throw new Error(`verifyOtp failed for ${email}: ${otpErr.message}`);

  const jar = [];
  const ssr = createServerClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [], setAll: (list) => jar.push(...list) },
  });
  await ssr.auth.setSession({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  });
  return jar.map((c) => `${c.name}=${c.value}`).join('; ');
}

async function startServer() {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    console.error(`\nSomething is already listening on ${BASE}. That would test a stale build.`);
    process.exit(1);
  } catch {
    /* nothing listening, good */
  }
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'ignore', 'pipe'],
    detached: true,
  });
  const stop = () => {
    try {
      process.kill(-server.pid, 'SIGKILL');
    } catch {
      /* group gone */
    }
  };
  process.on('exit', stop);

  const deadline = Date.now() + 120000;
  for (;;) {
    if (Date.now() > deadline) {
      stop();
      throw new Error('server did not answer within 120s');
    }
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return stop;
}

// ─── Run ─────────────────────────────────────────────────────────────────────

const { data: classes } = await db.from('classes').select('id, name, teacher_id').eq('name', CLASS_NAME);
const cls = (classes ?? [])[0];
if (!cls) {
  console.error(`Could not find a class named "${CLASS_NAME}".`);
  process.exit(2);
}

let teacherEmail = null;
let student = null;
for (let page = 1; page <= 10 && (!teacherEmail || !student); page++) {
  const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
  if (!data?.users?.length) break;
  for (const u of data.users) {
    if (u.id === cls.teacher_id) teacherEmail = u.email;
    if ((u.email ?? '').toLowerCase() === STUDENT_EMAIL) student = u;
  }
}
if (!teacherEmail || !student) {
  console.error('Could not resolve the class teacher or the student.');
  process.exit(2);
}

console.log(`\nclass    ${cls.name} (${cls.id})`);
console.log(`teacher  ${teacherEmail}`);
console.log(`student  ${student.email} (${student.id})\n`);

const stop = await startServer();
const cookie = await signInHeader(teacherEmail);
const get = (path) => fetch(`${BASE}${path}`, { headers: { cookie }, redirect: 'manual' });

try {
  // ── 1. The class grid ────────────────────────────────────────────────────
  const gridRes = await get(`/api/teacher/grades?class_id=${cls.id}`);
  const gridText = await gridRes.text();
  const grid = JSON.parse(gridText);
  check('class grid answers 200', gridRes.status === 200, `status ${gridRes.status}`);

  const row = (grid.students ?? []).find((s) => s.student_id === student.id);
  check('the student appears on the class grid', Boolean(row));

  if (row) {
    console.log(`\n        roster letter: ${JSON.stringify(row.letter)}\n`);
    check('the roster letter is WITHHELD, not a letter', row.letter.kind === 'withheld', `kind=${row.letter.kind}`);
    check('it renders an em dash', row.letter.display === '—', `display=${row.letter.display}`);
    check(
      'the subtitle is the honest count "2 of 3 topics quizzed"',
      row.letter.subtitle === '2 of 3 topics quizzed',
      `subtitle="${row.letter.subtitle}"`
    );
    check('NO letter grade is present at all', row.letter.letter === undefined);
    check('and specifically it is not an F', JSON.stringify(row.letter) !== undefined && row.letter.letter !== 'F');
    check('two graded topics, five graded items', row.letter.graded_topics === 2 && row.letter.graded_items === 5,
      `topics=${row.letter.graded_topics} items=${row.letter.graded_items}`);
  }

  // ── 2. Ruling A: quiz_score reaches no response body ─────────────────────
  check('quiz_score does not appear in the class grid body', !gridText.includes('quiz_score'));

  // ── 3. The per-student gradebook ─────────────────────────────────────────
  const bookRes = await get(`/api/teacher/grades?class_id=${cls.id}&student_id=${student.id}`);
  const bookText = await bookRes.text();
  const book = JSON.parse(bookText);
  check('the gradebook answers 200', bookRes.status === 200, `status ${bookRes.status}`);
  check('quiz_score does not appear in the gradebook body', !bookText.includes('quiz_score'));
  check('completed_at does not appear in the gradebook body', !bookText.includes('completed_at'));

  check(
    'the gradebook letter is IDENTICAL to the roster letter',
    JSON.stringify(book.letter) === JSON.stringify(row?.letter),
    `${JSON.stringify(book.letter)} vs ${JSON.stringify(row?.letter)}`
  );

  const byTopic = new Map((book.topics ?? []).map((t) => [t.topic_id, t]));

  // GR.4.3: the live disagreement.
  const gr43 = byTopic.get('GR.4.3');
  check('GR.4.3 is in the gradebook', Boolean(gr43));
  if (gr43) {
    console.log(
      `\n        GR.4.3  latest=${JSON.stringify(gr43.quiz_latest)}  mastery=${JSON.stringify(gr43.quiz_mastery)}  completion=${JSON.stringify(gr43.completion)}\n`
    );
    check('GR.4.3 latest-attempt is 1/3', gr43.quiz_latest?.correct === 1 && gr43.quiz_latest?.total === 3);
    check('GR.4.3 mastery is 2/4', gr43.quiz_mastery?.correct === 2 && gr43.quiz_mastery?.total === 4);
    check('the two definitions genuinely disagree here',
      gr43.quiz_latest.correct !== gr43.quiz_mastery.correct && gr43.quiz_latest.total !== gr43.quiz_mastery.total);
  }

  // ── 4. THE TWO-AXIS RULE, on live data ───────────────────────────────────
  // QR.1.5: he answered one practice item and never opened the quiz.
  const qr15 = byTopic.get('QR.1.5');
  check('QR.1.5 (practised, never quizzed) is in the gradebook', Boolean(qr15));
  if (qr15) {
    console.log(
      `\n        QR.1.5  quiz_mastery=${JSON.stringify(qr15.quiz_mastery)}  practice_mastery=${JSON.stringify(qr15.practice_mastery)}  completion=${JSON.stringify(qr15.completion)}\n`
    );
    check('QR.1.5 shows completion progress', qr15.completion !== null && qr15.completion.done > 0,
      `completion=${JSON.stringify(qr15.completion)}`);
    check('QR.1.5 practice is reported as CONTEXT', qr15.practice_latest !== null || qr15.practice_mastery !== null);
    check('QR.1.5 quiz is ABSENT, not zero', qr15.quiz_mastery === null && qr15.quiz_latest === null);
    check(
      'and so QR.1.5 is NOT in the grade denominator',
      book.letter.graded_topics === 2,
      `graded_topics=${book.letter.graded_topics} while ${book.topics.length} topics are listed`
    );
  }

  // ── 5. The student's own number is unchanged by the extract ──────────────
  const { data: attempts } = await db
    .from('curriculum_attempts')
    .select('course_id, topic_id, section, item_number, is_correct, created_at')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  const { latestAttemptScores } = await import('../app/lib/grades.ts');
  const oracle = referenceReducer(attempts ?? []);
  const extracted = latestAttemptScores(attempts ?? []);

  const canon = (m, get_) =>
    JSON.stringify([...m.keys()].sort().map((k) => [k, get_(m.get(k))]));
  const oracleJson = canon(oracle, (v) => [v.correct, v.total, v.last]);
  const extractJson = canon(extracted, (v) => [v.correct, v.total, v.lastWorkedAt]);

  console.log(`\n        /dashboard/grades rows, from the FROZEN oracle over his whole log:`);
  for (const k of [...oracle.keys()].sort()) {
    const v = oracle.get(k);
    console.log(`          ${k}  ${v.correct}/${v.total}`);
  }
  console.log();
  check(
    'the extract reproduces the live student page byte for byte, over the whole real log',
    oracleJson === extractJson,
    oracleJson === extractJson ? '' : `\n        oracle  ${oracleJson}\n        extract ${extractJson}`
  );

  // ── 6. The four entry points ─────────────────────────────────────────────
  const gradebookPath = `/teacher/students/grades/${student.id}?class_id=${cls.id}`;
  const pages = [
    ['nav -> roster', `/teacher/students?class_id=${cls.id}`],
    ['roster -> grid', `/teacher/students/grades?class_id=${cls.id}`],
    ['grid/roster/banner -> gradebook', gradebookPath],
    ['student detail (carries the banner button)', `/teacher/student/${student.id}?class_id=${cls.id}`],
  ];
  for (const [label, path] of pages) {
    const res = await get(path);
    check(`${label} answers 200`, res.status === 200, `${path} -> ${res.status}`);
  }

  // ── 6b. The two-axis rule at its sharpest, on live rows ──────────────────
  //
  // vics8388's QR.1.5 above proves the half that matters most -- practised,
  // quiz absent, not in the denominator -- but his completion reads 1/3 rather
  // than 2/3, because his single practice answer was WRONG and so the practice
  // gate is not cleared. The 2/3 shape (practice CLEARED, quiz never opened) is
  // the one a teacher will actually argue about, so it is checked here too.
  //
  // IT IS CHECKED THROUGH THE REDUCER, NOT THROUGH THE ROUTE, and that is not a
  // shortcut: the two accounts in production carrying this shape are enrolled in
  // NO class, so no teacher may see them and no API call can legitimately
  // return them. getGradebook is the same function the route calls, one layer
  // down from the tenancy check that correctly excludes them.
  const { data: practiceHeavy } = await db
    .from('curriculum_attempts')
    .select('student_id, topic_id, section, item_number, is_correct');

  const shapes = new Map();
  for (const r of practiceHeavy ?? []) {
    const k = `${r.student_id}|${r.topic_id}`;
    if (!shapes.has(k)) shapes.set(k, { practice: new Set(), quiz: 0 });
    const e = shapes.get(k);
    if (r.section === 'practice' && r.is_correct) e.practice.add(r.item_number);
    if (r.section === 'mini_quiz') e.quiz += 1;
  }
  const candidate = [...shapes].find(([, e]) => e.practice.size >= 7 && e.quiz === 0);

  if (!candidate) {
    check('a live practice-cleared-never-quizzed case exists to check', false,
      'none found; the two-axis rule is pinned only by tests/grades.test.ts');
  } else {
    const [pair] = candidate;
    const [otherId, otherTopic] = pair.split('|');
    const tk = `tsia2-math:${otherTopic}`;

    // curriculum-progress.ts cannot be imported here: it pulls `cache` from
    // react, which Node's ESM resolver refuses. That is the same constraint
    // that made grades.ts and topic-completion.ts import-free in the first
    // place, so the pure halves are imported and the two reads are done by hand
    // -- the reader is the only thing not exercised, and section 1 above already
    // ran it through the live route.
    const { gradesFor, rollupLetter, topicCompletion } = await import('../app/lib/grades.ts');
    const { isPastLesson, requiredCorrect } = await import('../app/lib/topic-completion.ts');
    const { hasAttemptedSection } = await import('../app/lib/attempt-sets.ts');

    const { data: rows } = await db
      .from('curriculum_attempts')
      .select('course_id, topic_id, section, item_number, is_correct, created_at')
      .eq('student_id', otherId)
      .eq('topic_id', otherTopic)
      .order('created_at', { ascending: false });

    const { data: snapRows } = await db
      .from('curriculum_completion')
      .select('completed_at, lesson_completed_at, practice_correct, practice_total, quiz_correct, quiz_total')
      .eq('user_id', otherId)
      .eq('topic_id', otherTopic);
    const snap = (snapRows ?? [])[0] ?? null;

    // The gradable counts. Taken from the snapshot's *_total columns, which
    // syncCompletionSnapshot writes straight off the authored shape. Using them
    // to build the INPUT to the function under test is fine; what Ruling A
    // forbids is reading quiz_score as the ANSWER, and that column is neither
    // selected above nor used below.
    const shapes = new Map([
      [tk, { practice: { gradable: snap?.practice_total ?? 0 }, mini_quiz: { gradable: snap?.quiz_total ?? 0 } }],
    ]);

    const grades = gradesFor(rows ?? [], shapes);
    const g = grades.get(tk);
    const practiceAttempted = hasAttemptedSection(rows ?? [], 'tsia2-math', otherTopic, 'practice');
    const quizAttempted = hasAttemptedSection(rows ?? [], 'tsia2-math', otherTopic, 'mini_quiz');
    const practiceCount = snap?.practice_total ?? 0;
    const quizCount = snap?.quiz_total ?? 0;

    const comp = topicCompletion({
      lessonDone: isPastLesson(snap, { practiceAttempted, quizAttempted }),
      practiceCorrect: g?.practice.mastery?.correct ?? 0,
      practiceRequired: requiredCorrect('practice', practiceCount),
      practiceCount,
      practiceAttempted,
      quizCorrect: g?.quiz.mastery?.correct ?? 0,
      quizRequired: requiredCorrect('quiz', quizCount),
      quizCount,
      quizAttempted,
    });

    console.log(`\n        ${otherTopic} for a practice-cleared student (${otherId.slice(0, 8)}…)`);
    console.log(`          completion   ${JSON.stringify(comp)}`);
    console.log(`          quiz mastery ${JSON.stringify(g?.quiz.mastery ?? null)}`);
    console.log(`          practice     ${JSON.stringify(g?.practice.mastery ?? null)}\n`);

    check('practice CLEARED counts toward completion (2 of 3)', comp?.done === 2, `done=${comp?.done}`);
    check('and its practice section is marked cleared', comp?.practice === true);
    check('while the quiz is absent, not zero', (g?.quiz.mastery ?? null) === null);

    const letter = rollupLetter(grades, [tk]);
    check(
      'a topic in that state yields NO grade at all, not a zero',
      letter.kind === 'withheld' && letter.reason === 'no_graded_work',
      JSON.stringify(letter)
    );
  }

  // ── 7. Tenancy still refuses ─────────────────────────────────────────────
  const { data: other } = await db.from('classes').select('id, name').neq('teacher_id', cls.teacher_id).limit(1);
  if (other?.[0]) {
    const res = await get(`/api/teacher/grades?class_id=${other[0].id}`);
    check("another teacher's class 404s", res.status === 404, `got ${res.status}`);
  }
  const res404 = await get(`/api/teacher/grades?class_id=${cls.id}&student_id=${cls.teacher_id}`);
  check('a non-member student id 404s', res404.status === 404, `got ${res404.status}`);
} finally {
  stop();
}

console.log();
if (failures > 0) {
  console.log(`SPOT-CHECK FAILED: ${failures} assertion(s).`);
  process.exit(1);
}
console.log('SPOT-CHECK GREEN. The roster reads a dash, not an F; practice counts for completion and not for the grade.');
process.exit(0);
