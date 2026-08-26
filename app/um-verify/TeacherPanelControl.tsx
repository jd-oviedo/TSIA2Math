'use client';

import NewAssignment from '../teacher/NewAssignment';

// THE TEACHER CONTROL. The panel that must NOT have moved.
//
// WHY THIS EXISTS. The student shell's panels went flat on 2026-08-26 -- radius
// 0, one hairline, no shadow -- and /teacher deliberately did not. The two used
// to share a shape through cardStyle(), so "the flatten did not reach teacher"
// is a claim that needs measuring rather than asserting, and the only honest way
// to measure it is to mount a panel /teacher actually ships and read it in the
// same browser, on the same run, as the student panels next to it.
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
// reads DASH directly (dashboard-theme.ts:334); there is no --umd-* lookup in
// its style to be answered by the wrapper it happens to be sitting in.
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
