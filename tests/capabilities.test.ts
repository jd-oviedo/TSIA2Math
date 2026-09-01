import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CAPABILITIES,
  planGrants,
  teacherTierLabel,
  isFreeSample,
  freeSampleGrants,
  FREE_SAMPLE,
  ALL_CAPABILITIES,
  WORKSHEET_QUOTA,
  worksheetQuota,
} from '../app/lib/capabilities.ts';

// The capability map, and the free sample.
//
// The map went through three versions in one day and two of them were wrong, so
// the properties that were got wrong are the ones asserted hardest: that
// Practice Pass holds nothing in /course, and that Full Course is a superset
// rather than an overlapping set.

test('a Practice Pass holder never reaches /course', () => {
  // The boundary the whole map exists to encode. Both earlier wrong versions
  // failed this or its mirror.
  assert.equal(planGrants('practice-pass', 'curriculum'), false);
  assert.equal(planGrants('practice-pass', 'gumu'), false);
});

test('Full Course holds the curriculum and GUMU', () => {
  assert.equal(planGrants('full-course', 'curriculum'), true);
  assert.equal(planGrants('full-course', 'gumu'), true);
});

test('Full Course is a strict superset of Practice Pass', () => {
  // "EVERYTHING IN PRACTICE PASS, PLUS" is published on the pricing page. This
  // is that commitment as an assertion rather than a comment.
  for (const capability of CAPABILITIES['practice-pass']) {
    assert.ok(
      CAPABILITIES['full-course'].has(capability),
      `full-course is missing ${capability}, which practice-pass has`
    );
  }
  assert.ok(CAPABILITIES['full-course'].size > CAPABILITIES['practice-pass'].size);
});

test('teacher plans sell no curriculum, and that is deliberate', () => {
  // Teachers DO reach /course, through the second door in the gate predicate.
  // The map records what a plan sells, and Teacher Core does not sell student
  // curriculum access. If this ever passes, the second door has been merged into
  // the map and the two reasons have stopped being separately legible.
  assert.equal(planGrants('teacher-core', 'curriculum'), false);
  assert.equal(planGrants('teacher-pro', 'curriculum'), false);
  assert.equal(planGrants('teacher-core', 'teacher-dashboard'), true);
  assert.equal(planGrants('teacher-pro', 'teacher-dashboard'), true);
});

test('worksheets belong to Practice Pass and up, including both teacher tiers', () => {
  for (const plan of ['practice-pass', 'full-course', 'teacher-core', 'teacher-pro'] as const) {
    assert.equal(planGrants(plan, 'worksheets'), true, `${plan} should hold worksheets`);
  }
});

test('no plan means no capability, and an unknown plan grants nothing', () => {
  // Derived from the type, not hand-written. This line used to be a literal
  // array, and because it was typed Capability[] a SHORT array stayed valid:
  // adding a capability left the list silently non-exhaustive while the test
  // went on passing over the subset it happened to name.
  const caps = ALL_CAPABILITIES;
  for (const capability of caps) {
    assert.equal(planGrants(null, capability), false);
    assert.equal(planGrants(undefined, capability), false);
    // A value the constraint would reject, in case one ever reaches this by a
    // path that skips the database.
    assert.equal(planGrants('founding-teacher', capability), false);
    assert.equal(planGrants('', capability), false);
  }
});

test('class-data-export separates Pro from Core, and nothing else moved', () => {
  // THE TIER BOUNDARY. Before this capability existed, Core and Pro held
  // byte-identical sets, and five Core accounts could reach the CSV export
  // routes in production, one of them a paying customer.
  assert.equal(planGrants('teacher-pro', 'class-data-export'), true);
  assert.equal(planGrants('teacher-core', 'class-data-export'), false);

  // No student plan acquires it by being "higher".
  assert.equal(planGrants('full-course', 'class-data-export'), false);
  assert.equal(planGrants('practice-pass', 'class-data-export'), false);

  // The rest of Core is untouched: this was meant to REMOVE something from
  // Core, not to hand Pro a second change by accident.
  //
  // UPDATED 2026-08-23 for official-scores, again 2026-08-24 for
  // curriculum-progress, again 2026-08-24 for assignments, and again 2026-08-24
  // for student-grades -- all four held by both tiers. This test caught every one
  // of them when it landed, which is the whole reason the two sets are pinned in
  // full rather than spot-checked.
  // The property being asserted has not moved across any of them:
  // class-data-export is still the ONLY difference between the tiers, and it is
  // still the one Core does not have.
  assert.deepEqual(
    [...CAPABILITIES['teacher-core']].sort(),
    [
      'assignments',
      'curriculum-progress',
      'official-scores',
      'student-grades',
      'teacher-dashboard',
      'worksheets',
    ]
  );
  assert.deepEqual(
    [...CAPABILITIES['teacher-pro']].sort(),
    [
      'assignments',
      'class-data-export',
      'curriculum-progress',
      'official-scores',
      'student-grades',
      'teacher-dashboard',
      'worksheets',
    ]
  );

  // Said directly rather than left to be inferred from the two lists above: the
  // symmetric difference of the tiers is exactly one capability.
  const core = CAPABILITIES['teacher-core'];
  const pro = CAPABILITIES['teacher-pro'];
  assert.deepEqual(
    [...pro].filter((c) => !core.has(c)),
    ['class-data-export']
  );
  assert.deepEqual([...core].filter((c) => !pro.has(c)), []);

  // Pro is a strict superset of Core, which is the shape a tier ladder has to
  // keep. If this ever fails, Core holds something Pro does not.
  for (const capability of CAPABILITIES['teacher-core']) {
    assert.ok(
      CAPABILITIES['teacher-pro'].has(capability),
      `Pro is missing ${capability}, which Core holds`
    );
  }
});

test('the tier badge is unchanged by the new capability', () => {
  // teacherTierLabel reads the plan and nothing else, so adding a capability
  // must not move it. Asserted because the badge was wrong once before.
  assert.equal(teacherTierLabel('teacher-pro'), 'PRO');
  assert.equal(teacherTierLabel('teacher-core'), 'CORE');
  assert.equal(teacherTierLabel('full-course'), null);
  assert.equal(teacherTierLabel(null), null);
});

test('there are exactly four plans, so a fifth row cannot appear unnoticed', () => {
  assert.deepEqual(Object.keys(CAPABILITIES).sort(), [
    'full-course',
    'practice-pass',
    'teacher-core',
    'teacher-pro',
  ]);
});

// ─── The free sample ─────────────────────────────────────────────────────────

test('the free sample is AR.1.4 on the live course, and nothing else is', () => {
  assert.equal(isFreeSample('tsia2-math', 'AR.1.4'), true);
  assert.equal(isFreeSample('tsia2-math', 'QR.1.1'), false);
  assert.equal(isFreeSample('tsia2-math', 'GR.4.3'), false);
});

test('the free sample is scoped to its course, not to a topic id anywhere', () => {
  // Topic ids are only unique within a course. A second course carrying an
  // AR.1.4 must not inherit the exemption.
  assert.equal(isFreeSample('tsia2-english', 'AR.1.4'), false);
  assert.equal(isFreeSample('', 'AR.1.4'), false);
});

test('the free sample grants the curriculum but never GUMU', () => {
  // GUMU is the Full Course differentiator. A sample that included it would give
  // away the thing the $89 buys.
  assert.equal(freeSampleGrants('curriculum'), true);
  assert.equal(freeSampleGrants('gumu'), false);
});

test('the free sample grants nothing outside the course tree', () => {
  assert.equal(freeSampleGrants('worksheets'), false);
  assert.equal(freeSampleGrants('teacher-dashboard'), false);
});

test('the sample constant and the predicate cannot drift', () => {
  assert.equal(isFreeSample(FREE_SAMPLE.courseId, FREE_SAMPLE.topicId), true);
});


// ---------------------------------------------------------------------------
// Official score tracking
//
// Core-tier, decided 2026-08-23. The three assertions below are separated on
// purpose: "Core has it", "Pro has it" and "no student plan has it" fail for
// different reasons and a single combined test would report the wrong one.
// ---------------------------------------------------------------------------

test('a Teacher Core plan may record official scores', () => {
  // The decision that makes this feature Core rather than Pro, as an assertion.
  assert.equal(planGrants('teacher-core', 'official-scores'), true);
});

test('a Teacher Pro plan may record official scores too', () => {
  // Pro must not lose a Core feature. The tiers diverge on exports only.
  assert.equal(planGrants('teacher-pro', 'official-scores'), true);
});

test('no student plan may record an official score', () => {
  // A student never transcribes their own official result. This is the half
  // that a grant added to the wrong Set would break silently, because every
  // teacher-facing assertion above would still pass.
  assert.equal(planGrants('practice-pass', 'official-scores'), false);
  assert.equal(planGrants('full-course', 'official-scores'), false);
  assert.equal(planGrants(null, 'official-scores'), false);
});

test('recording an official score and exporting one are different capabilities', () => {
  // Entry is Core, export stays Pro. If these ever collapse into one capability
  // the tier boundary moves without anyone deciding to move it.
  assert.equal(planGrants('teacher-core', 'official-scores'), true);
  assert.equal(planGrants('teacher-core', 'class-data-export'), false);
});

// ---------------------------------------------------------------------------
// Curriculum progress on the teacher surface
//
// Core-tier, decided 2026-08-24, and split the same four ways official-scores is
// split above for the same reason: "Core has it", "Pro has it" and "no student
// plan has it" fail for different reasons.
//
// THE STUDENT HALF IS NOT SYMMETRIC WITH official-scores AND THE DIFFERENCE IS
// THE POINT. A student not holding 'official-scores' means the feature is
// unreachable for them. A student not holding 'curriculum-progress' means no
// such thing: a student sees their own progress on /dashboard/modules, which
// gates on 'curriculum' and reads the identical getTopicStatuses. This
// capability names the TEACHER's cross-student read, so granting it to a student
// plan would not add a student feature -- it would hand a student the teacher
// route. That is why the assertion below is worth making rather than obvious.
// ---------------------------------------------------------------------------

test('a Teacher Core plan may read curriculum progress', () => {
  // The decision that makes this feature Core rather than Pro, as an assertion.
  assert.equal(planGrants('teacher-core', 'curriculum-progress'), true);
});

test('a Teacher Pro plan may read curriculum progress too', () => {
  // Pro must not lose a Core feature. The tiers diverge on exports only.
  assert.equal(planGrants('teacher-pro', 'curriculum-progress'), true);
});

test('no student plan holds the teacher curriculum-progress capability', () => {
  // See the note above: this is not about a student seeing their own progress,
  // which 'curriculum' already covers. It is about the cross-student read.
  assert.equal(planGrants('practice-pass', 'curriculum-progress'), false);
  assert.equal(planGrants('full-course', 'curriculum-progress'), false);
  assert.equal(planGrants(null, 'curriculum-progress'), false);
});

test('reading curriculum progress and exporting class data are different capabilities', () => {
  // Status on screen is Core; a CSV of class data stays Pro. Build 2 ships no
  // export of any of this, and if one is ever added it gates on
  // class-data-export, not on this.
  assert.equal(planGrants('teacher-core', 'curriculum-progress'), true);
  assert.equal(planGrants('teacher-core', 'class-data-export'), false);
});

// ---------------------------------------------------------------------------
// Assignments on the teacher surface
//
// Core-tier, decided 2026-08-24, split the same four ways the two capabilities
// above are split, and for the same reason: "Core has it", "Pro has it" and "no
// student plan has it" are three different failures.
//
// THE READ/WRITE SPLIT IS THE ONE WORTH ASSERTING. 'curriculum-progress' names a
// read and 'assignments' names a write, and the tests below pin that they are
// genuinely separate keys rather than two names for one grant. A future
// read-only observer plan is the case this protects: it would hold the read and
// not the write, which is only expressible while these stay distinct.
//
// A STUDENT NOT HOLDING THIS IS NOT A STATEMENT ABOUT BUILD 4b. When the student
// surface lands, a student reads the assignments that target them through their
// own gate; it is not this capability, which names the teacher's authority to
// SET work for a class. Granting it to a student plan would hand a student the
// teacher write route.
// ---------------------------------------------------------------------------

test('a Teacher Core plan may set and track assignments', () => {
  // The decision that makes this feature Core rather than Pro, as an assertion.
  assert.equal(planGrants('teacher-core', 'assignments'), true);
});

test('a Teacher Pro plan may set and track assignments too', () => {
  // Pro must not lose a Core feature. The tiers diverge on exports only.
  assert.equal(planGrants('teacher-pro', 'assignments'), true);
});

test('no student plan holds the assignments capability', () => {
  // See the note above: this names the teacher's write, not a student's read of
  // work set for them.
  assert.equal(planGrants('practice-pass', 'assignments'), false);
  assert.equal(planGrants('full-course', 'assignments'), false);
  assert.equal(planGrants(null, 'assignments'), false);
});

test('setting assignments and reading progress are different capabilities', () => {
  // Both are Core and both are held by both tiers today, so this passes for a
  // reason that has nothing to do with who holds what: it asserts the two keys
  // exist independently. If one were ever folded into the other, the missing key
  // would grant nothing and this fails.
  assert.equal(planGrants('teacher-core', 'assignments'), true);
  assert.equal(planGrants('teacher-core', 'curriculum-progress'), true);
  assert.notEqual('assignments', 'curriculum-progress');
});

test('assignments does not drag the export capability along with it', () => {
  // The tracking view shows status on screen. Nothing about it is a CSV, and if
  // an export of it is ever built it gates on class-data-export.
  assert.equal(planGrants('teacher-core', 'assignments'), true);
  assert.equal(planGrants('teacher-core', 'class-data-export'), false);
});

// ---------------------------------------------------------------------------
// The tier label
//
// Both teacher rails named the wrong product. The teacher dashboard rendered the
// literal 'TEACHER · PRO' for everyone, and the student rail derived its badge
// from `role === 'teacher' && entitledTeacher`, which is ENTITLED, not PRO. No
// Teacher Pro has ever sold, so every one of those labels was wrong, and the
// first paying Teacher Core customer was shown one.
//
// The unit tests below cover the derivation. The last test covers the WIRING,
// which is the half that was actually broken: a correct helper nothing calls
// would have left both rails exactly as wrong as they were.
// ---------------------------------------------------------------------------

test('the tier label names the plan that was bought', () => {
  assert.equal(teacherTierLabel('teacher-core'), 'CORE');
  assert.equal(teacherTierLabel('teacher-pro'), 'PRO');
});

test('a Teacher Core plan is never labelled PRO', () => {
  // The defect, stated as an assertion. This is the one that matters.
  assert.notEqual(teacherTierLabel('teacher-core'), 'PRO');
});

test('a plan that names no teacher tier returns null rather than a product name', () => {
  // Null forces the caller to say what it renders instead. Defaulting to a tier
  // here would put the guess back where it was.
  assert.equal(teacherTierLabel('practice-pass'), null);
  assert.equal(teacherTierLabel('full-course'), null);
  assert.equal(teacherTierLabel(null), null);
  assert.equal(teacherTierLabel(undefined), null);
  assert.equal(teacherTierLabel(''), null);
});

test('neither teacher rail hardcodes a tier name', () => {
  // The wiring check. Both files must derive the band from teacherTierLabel and
  // neither may contain the literal string that was there before.
  //
  // REPOINTED 2026-09-01, AND THE ASSERTIONS ARE UNCHANGED. The first entry was
  // app/teacher/TeacherDashboardClient.tsx, which is where the teacher band used
  // to be drawn. The rail was extracted to TeacherShell (PR #201) and the
  // dashboard now only MOUNTS it and passes `plan` through -- its own comments
  // say so at :1112 and :1262-1266 -- so there has been no teacherTierLabel call
  // in that file for some time and this test asserted against a file that could
  // not satisfy it. That is a stale pointer, not a regression: the band itself
  // has been correct throughout, at TeacherShell.tsx:284-285.
  //
  // The fix is the target, not the check. Both assertions below keep their exact
  // form, because the question they ask -- does the teacher rail derive its tier
  // from the plan -- is still the right question and TeacherShell IS the teacher
  // rail now. Weakening either one to get green would have thrown away the only
  // thing standing between this and the defect described at the top of this
  // block, which shipped a product name to every Teacher Core customer.
  //
  // WHY IT WENT RED ON MAIN AND STAYED THERE: this repo runs no tests in CI. See
  // the PR that made this change.
  const rails = [
    'app/teacher/TeacherShell.tsx',
    'app/components/StudentNav.tsx',
  ];
  for (const file of rails) {
    const src = readFileSync(file, 'utf8');
    // Comments are allowed to quote the old string, since both files explain at
    // length what was wrong with it. Only rendered code is refused, so both
    // comment forms are stripped first -- including block comments, which is
    // what a JSX {/* ... */} note is and which a line-prefix filter misses.
    const rendered = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !/^\s*\/\//.test(line))
      .join('\n');
    // A CALL, not a mention. Asserted against the comment-stripped source
    // because the first version of this test read the raw file, and a fault that
    // ripped the call out entirely still passed: both files talk ABOUT
    // teacherTierLabel in their comments, and that was enough to satisfy it.
    assert.ok(
      /teacherTierLabel\s*\(/.test(rendered),
      `${file} does not derive its tier label from the plan`
    );
    assert.ok(
      !/['"`]TEACHER · PRO['"`]/.test(rendered),
      `${file} still renders a hardcoded TEACHER · PRO`
    );
  }
});

test('the capability list is exhaustive, and stays exhaustive by construction', () => {
  // The compiler is what enforces this, via Record<Capability, true> in
  // capabilities.ts. These assertions are the runtime half: they catch the list
  // being emptied or truncated by something the type system cannot see, such as
  // a bad merge that deletes keys from the presence map.
  assert.ok(ALL_CAPABILITIES.length >= 6, `only ${ALL_CAPABILITIES.length} capabilities`);
  assert.deepEqual([...ALL_CAPABILITIES].sort(), [
    'assignments',
    'class-data-export',
    'curriculum',
    'curriculum-progress',
    'gumu',
    'official-scores',
    'student-grades',
    'teacher-dashboard',
    'worksheets',
  ]);

  // Every capability any plan actually grants must appear in the list. If a
  // plan could grant something the list does not name, every "no plan means no
  // capability" assertion would skip it.
  const granted = new Set(Object.values(CAPABILITIES).flatMap((set) => [...set]));
  for (const capability of granted) {
    assert.ok(
      ALL_CAPABILITIES.includes(capability),
      `${capability} is granted by a plan but missing from ALL_CAPABILITIES`
    );
  }
});


// ─── The worksheet quota ────────────────────────────────────────────────────
//
// Asserted the same way CAPABILITIES is, for the same reason: this map decides
// who gets metered, and a wrong entry here either meters a plan that paid not
// to be or lets the one capped plan run free.

test('exactly one plan is capped, and it is Teacher Core at 15', () => {
  assert.equal(WORKSHEET_QUOTA['teacher-core'], 15);

  const capped = Object.entries(WORKSHEET_QUOTA)
    .filter(([, cap]) => cap !== null)
    .map(([plan]) => plan);
  assert.deepEqual(capped, ['teacher-core'],
    'adding a second capped plan is a pricing change, not a refactor');
});

test('every unlimited plan is null, never Infinity', () => {
  // Infinity is the obvious spelling and the wrong one: JSON.stringify(Infinity)
  // is `null`, so a cap that crossed to the client as Infinity would arrive as
  // null anyway and the codebase would carry two spellings of one idea. This
  // pins the decision rather than leaving it to whoever edits the map next.
  for (const plan of ['practice-pass', 'full-course', 'teacher-pro'] as const) {
    assert.equal(WORKSHEET_QUOTA[plan], null, `${plan} should be uncapped`);
    assert.notEqual(WORKSHEET_QUOTA[plan], Infinity);
  }
  for (const cap of Object.values(WORKSHEET_QUOTA)) {
    assert.ok(cap === null || Number.isFinite(cap), 'a cap is a finite number or null');
  }
});

test('every plan that holds worksheets has declared a quota', () => {
  // The map is Record<Plan, ...>, so this cannot fail while the types hold. It
  // is asserted anyway because the PROPERTY that matters is the pairing: a plan
  // may hold the capability without being capped, but it may never hold the
  // capability and be missing from the quota map.
  for (const plan of ['practice-pass', 'full-course', 'teacher-core', 'teacher-pro'] as const) {
    assert.ok(planGrants(plan, 'worksheets'));
    assert.ok(plan in WORKSHEET_QUOTA, `${plan} holds worksheets but declares no quota`);
  }
});

test('worksheetQuota returns null for absent and unknown plans', () => {
  // null from this function means "do not count", never "let them in". It is
  // safe only because nothing calls it before requireTeacher() and
  // profileGrants() have already run.
  assert.equal(worksheetQuota(null), null);
  assert.equal(worksheetQuota(undefined), null);
  assert.equal(worksheetQuota(''), null);
  assert.equal(worksheetQuota('founding-teacher'), null);
  assert.equal(worksheetQuota('teacher-core'), 15);
  assert.equal(worksheetQuota('teacher-pro'), null);
});

// ---------------------------------------------------------------------------
// Grades on the teacher surface
//
// Core-tier, decided 2026-08-24, split the same four ways the three capabilities
// above are split, and for the same reason: "Core has it", "Pro has it" and "no
// student plan has it" are three different failures.
//
// THE SPLIT FROM curriculum-progress IS THE ONE WORTH ASSERTING, and it is the
// only capability boundary in this file that a previous build wrote down in
// advance. The note over 'curriculum-progress' reads "STATUS ONLY, NOT GRADES.
// [...] Do not widen this capability to cover it by assuming the name already
// stretches that far." The test below is that sentence as an assertion: the two
// are distinct keys, so a plan can hold progress without holding grades.
//
// A read-only district viewer counting completion is the case this protects. It
// is only expressible while these stay separate, and the way that expressibility
// dies is not by anybody arguing against it -- it is by somebody gating the
// grades route on 'curriculum-progress' because the teacher already had it.
// ---------------------------------------------------------------------------

test('a Teacher Core plan may read student grades', () => {
  // The decision that makes this feature Core rather than Pro, as an assertion.
  assert.equal(planGrants('teacher-core', 'student-grades'), true);
});

test('a Teacher Pro plan may read student grades too', () => {
  // Pro must not lose a Core feature. The tiers diverge on exports only.
  assert.equal(planGrants('teacher-pro', 'student-grades'), true);
});

test('no student plan holds the teacher student-grades capability', () => {
  // Not a statement about a student seeing their own scores: /dashboard/grades
  // gates on being signed in and reads the identical latestAttemptScores. This
  // capability names the TEACHER's cross-student read, so granting it to a
  // student plan would hand a student the teacher route rather than adding a
  // student feature. Same asymmetry as curriculum-progress above.
  assert.equal(planGrants('practice-pass', 'student-grades'), false);
  assert.equal(planGrants('full-course', 'student-grades'), false);
  assert.equal(planGrants(null, 'student-grades'), false);
});

test('progress and grades are separate capabilities, as curriculum-progress required', () => {
  // Both are Core today, so both of these pass for the same plan and the test
  // looks redundant. It is not: what it pins is that they are two KEYS. If the
  // grades route is ever gated on 'curriculum-progress' and this capability
  // deleted as unused, a plan could no longer hold status without scores -- and
  // nothing else in the suite would notice.
  assert.notEqual('student-grades', 'curriculum-progress');
  assert.ok(CAPABILITIES['teacher-core'].has('curriculum-progress'));
  assert.ok(CAPABILITIES['teacher-core'].has('student-grades'));
});

test('reading grades and exporting class data are different capabilities', () => {
  // Scores on screen are Core; a CSV containing them stays Pro. Build 3 ships no
  // export of any of this, and if one is ever added it gates on
  // class-data-export, not on this.
  assert.equal(planGrants('teacher-core', 'student-grades'), true);
  assert.equal(planGrants('teacher-core', 'class-data-export'), false);
});
