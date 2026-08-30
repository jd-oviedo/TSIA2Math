'use client';

import NewAssignment from '../teacher/NewAssignment';

// THE TEACHER PANEL, MEASURED RATHER THAN ASSERTED.
//
// WHY THIS EXISTS, AND WHAT IT PROVES NOW.
//
// Originally: the student shell's panels went flat on 2026-08-26 and /teacher
// deliberately did not, so this mounted a real teacher panel beside the student
// ones to show the flatten had stopped where it was meant to.
//
// As of 2026-08-30 that boundary is gone, on purpose -- the teacher dashboard
// restyle flattens the dashboard tree as well, and scripts/verify_flat_panels.mjs
// was retargeted in the same change rather than left asserting a shape the
// product no longer has.
//
// What survives the retarget is the REASON this file is a good idea: the claim
// "the dashboard tree is flat" is worth measuring in a browser rather than
// reading off a diff, and this is the only teacher panel that can be measured
// without a database. The oracle moved; the method did not.
//
// NewAssignment IS THE ONE TEACHER PANEL THAT MOUNTS WITH NO DATABASE. It takes
// three plain props and a callback, holds all its state locally, and its only
// fetch is inside submit(), which needs a click -- so an empty topic list and an
// empty roster render the panel at app/teacher/NewAssignment.tsx:171 and reach
// nothing. Every other cardStyle() consumer on /teacher either loads in an async
// server component or fetches on mount.
//
// A CLIENT BOUNDARY, AND THAT IS THE ONLY REASON THIS FILE EXISTS. onCreated is
// a function, and a function cannot cross a server-to-client boundary in the App
// Router, so the lane route -- a server component -- cannot mount NewAssignment
// directly. This wrapper supplies the no-op on the client side. It adds no
// markup and no style of its own: everything the probe reads comes from the real
// component.
//
// IT PAINTS FROM RESOLVED HEXES, NOT VARIABLES, so mounting it inside the
// student shell's .um-dash does not contaminate it. /teacher is light-only and
// reads DASH directly; there is no --umd-* lookup in its style to be answered
// by the wrapper it happens to be sitting in. The verifier reads the same three
// values under both themes, which is what turns that sentence into a check.
//
// ITS ONE --umt-* DEPENDENCY IS SELF-SUPPLIED. NewAssignment's buttons hover
// through custom properties declared in app/teacher/dashboard-chrome.ts, and
// this route loads no dashboard CSS -- so the component emits that sheet itself
// rather than relying on a parent to have done it. Nothing here needs to.
export default function TeacherPanelControl() {
  return (
    <NewAssignment
      classId="um-verify-lane"
      topics={[]}
      students={[]}
      onCreated={() => {}}
    />
  );
}
