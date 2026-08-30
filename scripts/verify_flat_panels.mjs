// verify_flat_panels.mjs -- the 2026-08-26 flat panel pass, read off the
// committed DB-free lane in both themes.
//
//   node scripts/verify_flat_panels.mjs
//   node scripts/verify_flat_panels.mjs --prove
//
// WHAT THIS COVERS
// ----------------
//   FLAT      the real Card and the real EmptyState compute radius 0, no
//             shadow, and a panelEdge hairline, in light and dark.
//   CONVERTED DiagnosticCta and the Assignments list panel -- the shell's two
//             hand-rolled panels -- flattened with the primitive rather than
//             being left behind, and DiagnosticCta kept its sunset rule.
//   FIELDSET  the problem frame a student meets on an INTERACTIVE topic caps
//             at 788 and stops tracking the window.
//   TEACHER   a real /teacher panel still computes radius 12 and its shadow,
//             measured in the same browser on the same run.
//
// ─── THE FIELDSET IS THE REASON THIS FILE EXISTS ────────────────────────────
//
// #210 capped "the practice card" at 788 and shipped verified. It capped
// `.um-prose-card`, which practice/page.tsx:66 renders only when
// practiceInteractive is FALSE -- QR.1.1 and nothing else in the whole course.
// Every other topic renders GatedQuiz -> PracticeQuiz -> a <fieldset>, and that
// fieldset had no maxWidth at all. Nothing on its path constrains width either:
// .um-page carries none on purpose (layout.tsx:72-91), GatedQuiz's wrapper is a
// bare <section>, and PracticeQuiz's own column is a stretched flex container.
// So the box almost every student actually reads ran as wide as the monitor,
// while the verifier watched a card almost nobody sees and reported a pass.
//
// THE ASSERTION BELOW READS THE <fieldset> ITSELF, off the REAL PracticeQuiz
// mounted at app/um-verify/curriculum/page.tsx from a four-field in-memory item.
// A prose-card reading does not satisfy it and is not offered as though it
// does: the prose card is asserted separately, alongside, and neither is
// presented as the other.
//
// AND IT IS READ AT TWO VIEWPORTS. A single width reading cannot tell "capped
// at 788" from "the window happens to produce 788 here". 1280 and 1600 differ
// by 320px of available width, so a box that still tracked the window would
// return two different numbers and only a capped one returns 788 twice.
//
// FLUSH LEFT IS MEASURED, NOT READ BACK. `margin: 0` is a declaration; whether
// the box ends up left or centred depends on the flex container it sits in. So
// this compares the fieldset's horizontal centre against .um-page's, the same
// way ui-verify-lane.mjs's `centres` probe was built for the brand mark. A
// flush-left 788 box inside a ~1532px column sits its centre roughly 345px
// left of the column's; `margin: auto` would put it at 0.
//
// ─── WHAT THIS DOES NOT COVER, SAID PLAINLY ─────────────────────────────────
//
// THE QUIZ INTRO PANELS ARE SOURCE-CHECKED, NOT RENDERED. quiz/page.tsx is an
// async server component that calls loadTopic() and reads Supabase, and its two
// intro panels are inline JSX inside it rather than a component, so there is
// nothing to mount without a database. Asserting the declaration is the
// strongest claim available without one -- the same call, for the same reason,
// that verify_ui_lane.mjs:225-237 already records for the prose cards. It is
// weaker than the fieldset reading above and is reported as its own section so
// it cannot be mistaken for one.
//
// THE SUBTEXT IS SOURCE-CHECKED TOO, and for the same reason: the Course
// progress card is inline JSX in app/dashboard/page.tsx, an async server
// component that reads Supabase. What is asserted is that the count sentence is
// gone, that the zero-state survived it, and that the bar and the percentage
// are both still in the same panel -- a removal is exactly the kind of edit that
// takes a neighbour with it.

import { readFile } from 'fs/promises';
import { withBrowser, startLane, readComputed, assertTheme, LANE_ROUTES } from './ui-verify-lane.mjs';

const PROVE = process.argv.includes('--prove');

// ─── THE ORACLE ─────────────────────────────────────────────────────────────
//
// Restated here rather than imported from dashboard-theme.ts, on the standing
// principle this lane's verifiers share: a check that imports the module under
// test passes for whatever that module currently holds, including a wrong
// value. These are the approved numbers in Chromium's serialisation.

// V.panelEdge. dashboard-theme.ts:278 (light) and :335 (dark).
const PANEL_EDGE = {
  light: 'rgba(15, 30, 53, 0.16)',
  dark: 'rgba(255, 255, 255, 0.12)',
};

// V.cardBorder, the quieter line the flat panel stepped away from. Asserted
// against because "square, shadowless, and still wearing the 0.07 border" is
// the half-done version of this change and the one that looks finished.
const OLD_EDGE = {
  light: 'rgba(15, 30, 53, 0.07)',
  dark: 'rgba(255, 255, 255, 0.09)',
};

// V.cardShadow. Asserted against, never for: it is what the student panels
// dropped on 2026-08-26, and as of 2026-08-30 what the teacher dashboard
// dropped too. cardStyle() still hands it to app/teacher/student/[id]/ and to
// ExportModal, so the constant is not dead -- it just no longer has a panel on
// this lane that is supposed to be wearing it.
const CARD_SHADOW = {
  light: 'rgba(15, 30, 53, 0.04) 0px 1px 2px 0px',
  dark: 'rgba(0, 0, 0, 0.34) 0px 1px 2px 0px',
};

// C.sunset, DiagnosticCta's 3px top rule. Theme-independent: it is the brand
// orange as a RULE, which is one of the three non-text roles the palette keeps
// it for, so it does not flip.
const SUNSET = 'rgb(240, 163, 62)';

const FLAT_RADIUS = '0px';

// ─── THE TEACHER PANEL'S OWN ORACLE ──────────────────────────────────────────
//
// RETARGETED 2026-08-30, and the claim underneath it changed with it.
//
// This used to read `const TEACHER_RADIUS = '12px'` and assert, beside every
// student panel on the lane, that the 2026-08-26 flatten had NOT reached
// /teacher. That was a real claim for four days and it is now retired on
// purpose: the teacher dashboard restyle flattens the dashboard tree
// deliberately, so the panel this lane mounts is square, shadowless and wearing
// the warm hairline.
//
// WHAT THE THREE ASSERTIONS BELOW ARE WORTH NOW. They no longer prove a
// boundary held. They prove the dashboard tree actually ARRIVED at the shape it
// claims, measured in a browser rather than read off a diff, and they still do
// it on the one teacher panel that mounts with no database. The half-done
// version of this change -- square and shadowless but still wearing the old
// 0.07 border -- is exactly what teacherEdge catches, which is the same job
// cardEdgeNotOld does for the student side.
//
// NOT panelEdge. The teacher tree took a WARMER hairline than the student
// shell: #E8E4DA has no navy in it, against panelEdge's rgba(15,30,53,0.16).
// Asserting PANEL_EDGE here would pass for the wrong colour, so it gets its own
// constant. dashboard-theme.ts DASH_FLAT.panelHairline, in Chromium's
// serialisation.
const TEACHER_RADIUS = FLAT_RADIUS;
const TEACHER_EDGE = 'rgb(232, 228, 218)';
const MEASURE = '788px';

// How far left of .um-page's centre a flush-left 788 box sits, PER VIEWPORT.
//
// It has to be per viewport, and getting that wrong is what this constant is a
// record of: a single threshold derived from the 1600 geometry reddened the
// 1280 reading on a page that was laid out perfectly correctly. The offset is
// a function of how much room is left over beside the cap, so it necessarily
// shrinks as the window does.
//
//   offset = (34px page padding + 421px half the border box) - viewport / 2
//
// The border box is 842 -- 788 content, 26px padding a side, 1px border a side
// -- because nothing in this app sets box-sizing. That gives -185 at 1280 and
// -345 at 1600, which are the figures observed.
//
// THRESHOLDS RATHER THAN THOSE EXACT NUMBERS, with ~40px of slack, because the
// figure moves with whatever scrollbar the headless browser draws and a
// scrollbar is not a layout result. The slack is nowhere near enough to admit
// the failure being watched for: `margin: auto` centres the box and reads ~0px
// at every viewport, which is 150px clear of the loosest bound here.
const FLUSH_LEFT_MAX = { 1280: -150, 1600: -300 };

// ─── SELECTORS ──────────────────────────────────────────────────────────────
//
// BY POSITION, NOT BY TAG, for the reason verify_announcements_card.mjs:86-94
// records: selecting `section` or `article` makes a SHAPE probe depend on a TAG
// claim, so a one-word semantic regression reddens a dozen colour assertions
// and buries the real one. Position selectors keep each failure to itself.
const STACK = '[data-probe="spacing-lane"] > .um-page-stack';
// Group 1 child 1: the plain Card, the primitive with nothing wrapped round it.
const CARD = `${STACK} > .um-section-group:nth-child(1) > *:nth-child(1)`;
// Group 2 child 1: DiagnosticCta, the hand-rolled louder card.
const CTA = `${STACK} > .um-section-group:nth-child(2) > *:nth-child(1)`;
// Group 3 child 1: EmptyState, which is a Card with its own padding.
const EMPTY = `${STACK} > .um-section-group:nth-child(3) > *:nth-child(1)`;
// The Assignments list panel: SectionLabel is child 1, the panel is child 2.
const LIST = '[data-probe="assignments-lane"] > .um-page-stack > section > *:nth-child(2)';
// The teacher panel. NewAssignment's root, inside the lane's client wrapper.
const TEACHER = '[data-probe="teacher-control"] > *';

// The problem frame, selected as the element PracticeQuiz itself renders.
// Nothing was added to the product component for this probe.
const FIELDSET = '[data-probe="practice-frame"] fieldset';
const PROSE = '[data-probe="prose-card"]';

const shellProbes = {
  cardRadius: { selector: CARD, prop: 'borderRadius' },
  cardShadow: { selector: CARD, prop: 'boxShadow' },
  cardEdge: { selector: CARD, prop: 'borderColor' },

  emptyRadius: { selector: EMPTY, prop: 'borderRadius' },
  emptyShadow: { selector: EMPTY, prop: 'boxShadow' },
  emptyEdge: { selector: EMPTY, prop: 'borderColor' },

  ctaRadius: { selector: CTA, prop: 'borderRadius' },
  ctaShadow: { selector: CTA, prop: 'boxShadow' },
  // borderTopColor, not borderColor: the top edge is the sunset rule and the
  // other three are panelEdge, so this element is the one place the two are
  // read separately. borderColor on a box with four different edges serialises
  // as a four-value string and would prove neither claim cleanly.
  ctaRule: { selector: CTA, prop: 'borderTopColor' },
  ctaRuleWidth: { selector: CTA, prop: 'borderTopWidth' },
  ctaLeftEdge: { selector: CTA, prop: 'borderLeftColor' },

  listRadius: { selector: LIST, prop: 'borderRadius' },
  listShadow: { selector: LIST, prop: 'boxShadow' },
  listEdge: { selector: LIST, prop: 'borderColor' },

  // THE TEACHER PANEL. Read in the same browser, on the same run, next to the
  // student panels above -- which is what makes it worth reading at all. See
  // the note over TEACHER_RADIUS for what these three prove now that /teacher
  // has flattened too.
  teacherRadius: { selector: TEACHER, prop: 'borderRadius' },
  teacherShadow: { selector: TEACHER, prop: 'boxShadow' },
  teacherEdge: { selector: TEACHER, prop: 'borderColor' },
};

const frameProbes = {
  fieldsetWidth: { selector: FIELDSET, prop: 'width' },
  fieldsetMaxWidth: { selector: FIELDSET, prop: 'maxWidth' },
  fieldsetRadius: { selector: FIELDSET, prop: 'borderRadius' },
  fieldsetShadow: { selector: FIELDSET, prop: 'boxShadow' },
  proseWidth: { selector: PROSE, prop: 'width' },
  proseMaxWidth: { selector: PROSE, prop: 'maxWidth' },
  proseRadius: { selector: PROSE, prop: 'borderRadius' },
  proseShadow: { selector: PROSE, prop: 'boxShadow' },
};

const frameCentres = {
  fieldsetOffset: { inner: FIELDSET, outer: '.um-page' },
};

const failures = [];

function check(scope, name, got, want) {
  const ok = got === want;
  if (!ok) failures.push({ scope, name, got, want });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(24)} ${String(got).padEnd(32)} want ${want}`);
}

function checkNot(scope, name, got, forbidden) {
  const ok = got !== forbidden;
  if (!ok) failures.push({ scope, name, got, want: `anything but ${forbidden}` });
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(24)} ${String(got).padEnd(32)} want != ${forbidden}`,
  );
}

function record(scope, name, ok, detail) {
  if (!ok) failures.push({ scope, name, got: detail, want: 'true' });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(24)} ${detail}`);
}

async function run() {
  const lane = await startLane({ quiet: false });
  try {
    await withBrowser(async (browser) => {
      // ── 1. THE FLAT PANELS, BOTH THEMES ────────────────────────────────
      for (const theme of ['light', 'dark']) {
        console.log(`\n── shell · ${theme} ──────────────────────────────────`);
        const { values, resolvedTheme } = await readComputed(browser, lane.origin, {
          route: LANE_ROUTES.shell,
          theme,
          probes: shellProbes,
        });
        assertTheme(theme, resolvedTheme, 'verify_flat_panels shell');

        console.log('  -- the primitive --');
        check(theme, 'cardRadius', values.cardRadius, FLAT_RADIUS);
        check(theme, 'cardShadow', values.cardShadow, 'none');
        check(theme, 'cardEdge', values.cardEdge, PANEL_EDGE[theme]);
        checkNot(theme, 'cardEdgeNotOld', values.cardEdge, OLD_EDGE[theme]);
        checkNot(theme, 'cardShadowNotOld', values.cardShadow, CARD_SHADOW[theme]);

        console.log('  -- EmptyState, which is a Card --');
        check(theme, 'emptyRadius', values.emptyRadius, FLAT_RADIUS);
        check(theme, 'emptyShadow', values.emptyShadow, 'none');
        check(theme, 'emptyEdge', values.emptyEdge, PANEL_EDGE[theme]);

        console.log('  -- DiagnosticCta: flattened, rule kept --');
        check(theme, 'ctaRadius', values.ctaRadius, FLAT_RADIUS);
        check(theme, 'ctaShadow', values.ctaShadow, 'none');
        // The distinction the card exists to make, still there. Without this
        // the flatten could have taken the one mark that separates it from its
        // neighbours and every assertion above would still pass.
        check(theme, 'ctaRule', values.ctaRule, SUNSET);
        check(theme, 'ctaRuleWidth', values.ctaRuleWidth, '3px');
        check(theme, 'ctaLeftEdge', values.ctaLeftEdge, PANEL_EDGE[theme]);

        console.log('  -- the Assignments list panel --');
        check(theme, 'listRadius', values.listRadius, FLAT_RADIUS);
        check(theme, 'listShadow', values.listShadow, 'none');
        check(theme, 'listEdge', values.listEdge, PANEL_EDGE[theme]);

        // ── THE TEACHER PANEL ────────────────────────────────────────────
        // Was "the non-leak", asserting /teacher had NOT flattened. It has
        // now, deliberately -- see the note over TEACHER_RADIUS.
        //
        // The oracle stays theme-INDEPENDENT and that is still an assertion
        // rather than a shortcut: /teacher is light-only and paints from
        // resolved hexes, so mounting it inside the student shell's .um-dash
        // must not tint it. Reading the same three values under both themes
        // is what proves that, and it survives the retarget untouched.
        console.log('  -- /teacher, now flat like the rest --');
        check(theme, 'teacherRadius', values.teacherRadius, TEACHER_RADIUS);
        check(theme, 'teacherShadow', values.teacherShadow, 'none');
        check(theme, 'teacherEdge', values.teacherEdge, TEACHER_EDGE);
      }

      // ── 2. THE FIELDSET, TWO VIEWPORTS, BOTH THEMES ────────────────────
      for (const theme of ['light', 'dark']) {
        for (const width of [1280, 1600]) {
          console.log(`\n── frame · ${theme} · ${width}px ─────────────────────`);
          const { values, centres, resolvedTheme } = await readComputed(browser, lane.origin, {
            route: LANE_ROUTES.curriculum,
            theme,
            probes: frameProbes,
            centres: frameCentres,
            viewport: { width, height: 1000 },
          });
          assertTheme(theme, resolvedTheme, `verify_flat_panels frame ${width}`);

          console.log('  -- the problem frame the student actually gets --');
          // THE BINDING ONE. 788 at both widths, or it is still tracking the
          // window.
          check(`${theme}/${width}`, 'fieldsetWidth', values.fieldsetWidth, MEASURE);
          check(`${theme}/${width}`, 'fieldsetMaxWidth', values.fieldsetMaxWidth, MEASURE);
          check(`${theme}/${width}`, 'fieldsetRadius', values.fieldsetRadius, FLAT_RADIUS);
          check(`${theme}/${width}`, 'fieldsetShadow', values.fieldsetShadow, 'none');

          const offset = parseFloat(centres.fieldsetOffset);
          const bound = FLUSH_LEFT_MAX[width];
          record(
            `${theme}/${width}`,
            'fieldsetFlushLeft',
            Number.isFinite(offset) && offset <= bound,
            `centre sits ${centres.fieldsetOffset} from .um-page's ` +
              `(want <= ${bound}px; margin:auto would read ~0px)`,
          );

          console.log('  -- the prose card, asserted separately --');
          check(`${theme}/${width}`, 'proseWidth', values.proseWidth, MEASURE);
          check(`${theme}/${width}`, 'proseMaxWidth', values.proseMaxWidth, MEASURE);
          check(`${theme}/${width}`, 'proseRadius', values.proseRadius, FLAT_RADIUS);
          check(`${theme}/${width}`, 'proseShadow', values.proseShadow, 'none');
        }
      }
    });
  } finally {
    lane.stop();
  }

  // ── 3. THE TWO SOURCE CHECKS ─────────────────────────────────────────────
  // Weaker than everything above, in their own section, and labelled. See the
  // header for why neither surface can be mounted.
  console.log('\n── source · quiz intro panels ────────────────────────────');
  const QUIZ = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/quiz/page.tsx';
  const quizSrc = await readFile(new URL(`../${QUIZ}`, import.meta.url), 'utf8');
  // Three capped boxes: both intro panels and the prose card. The count is
  // owned by verify_ui_lane.mjs; what is asserted here is the SHAPE.
  record(
    'source',
    'quizNoRoundPanels',
    !/borderRadius: '16px'/.test(quizSrc),
    /borderRadius: '16px'/.test(quizSrc)
      ? "still declares borderRadius: '16px'"
      : 'no 16px radius left in the file',
  );
  record(
    'source',
    'quizNoSoftShadow',
    !quizSrc.includes("boxShadow: '0 1px 3px rgba(14,14,17,.05)'"),
    quizSrc.includes("boxShadow: '0 1px 3px rgba(14,14,17,.05)'")
      ? 'the soft drop shadow is back'
      : 'no soft drop shadow',
  );
  const PRACTICE = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/practice/page.tsx';
  const practiceSrc = await readFile(new URL(`../${PRACTICE}`, import.meta.url), 'utf8');
  record(
    'source',
    'practiceNoRoundCard',
    !/borderRadius: '16px'/.test(practiceSrc),
    /borderRadius: '16px'/.test(practiceSrc)
      ? "still declares borderRadius: '16px'"
      : 'no 16px radius left in the file',
  );

  console.log('\n── source · the Course progress subtext ──────────────────');
  const HOME = 'app/dashboard/page.tsx';
  const homeSrc = await readFile(new URL(`../${HOME}`, import.meta.url), 'utf8');
  // The removal. Matched on the distinctive tail rather than the whole
  // sentence, so a reworded return of the same count still reddens.
  record(
    'source',
    'countSentenceGone',
    !/across \$\{topics\.length\} topics/.test(homeSrc),
    /across \$\{topics\.length\} topics/.test(homeSrc)
      ? 'the "across N topics" count is back'
      : 'the count sentence is gone',
  );
  record(
    'source',
    'countPhraseGone',
    !homeSrc.includes('practice and quiz questions answered correctly'),
    homeSrc.includes('practice and quiz questions answered correctly')
      ? 'the count phrasing is back'
      : 'no count phrasing',
  );
  // THE THREE THINGS THE REMOVAL MUST NOT HAVE TAKEN WITH IT. A deletion that
  // swallows a neighbour is the failure mode here, and all three of these lived
  // inside or beside the block that was cut.
  record(
    'source',
    'zeroStateKept',
    homeSrc.includes('No curriculum items are published yet.'),
    homeSrc.includes('No curriculum items are published yet.')
      ? 'the zero-state copy survived'
      : 'the zero-state copy went with the count',
  );
  record(
    'source',
    'barKept',
    homeSrc.includes('<ProgressBar value={doneItems} total={totalItems} />'),
    homeSrc.includes('<ProgressBar value={doneItems} total={totalItems} />')
      ? 'the bar is still there'
      : 'the bar went with the count',
  );
  record(
    'source',
    'percentageKept',
    homeSrc.includes('{pct}%'),
    homeSrc.includes('{pct}%') ? 'the percentage is still there' : 'the percentage went with the count',
  );

  console.log('\n─────────────────────────────────────────────────────────');
  if (failures.length === 0) {
    console.log(
      'PASS: panels flat in both themes, the fieldset caps at 788 at 1280 and\n' +
        '1600 and sits flush left, /teacher flat at 0 on the warm hairline.',
    );
    if (PROVE) {
      console.error(
        '\nBUT --prove WAS PASSED AND NOTHING FAILED.\n' +
          'That flag means "a fault has been injected; confirm the matching\n' +
          'assertion reddens". A clean run under --prove means the fault did not\n' +
          'land, so the check has proved nothing. Treating it as a failure.',
      );
      process.exit(1);
    }
    return;
  }

  console.log(`FAIL: ${failures.length} assertion(s) reddened.\n`);
  for (const f of failures) {
    console.log(`  [${f.scope}] ${f.name}: got ${f.got}, want ${f.want}`);
  }
  if (PROVE) {
    console.log('\n--prove: the injected fault reddened the expected assertion(s).');
    return;
  }
  process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
