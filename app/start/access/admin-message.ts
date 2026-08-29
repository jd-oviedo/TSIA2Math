import { GOOGLE_OAUTH_CLIENT_ID } from '../../lib/onboarding-config';

// The message a teacher sends their district's Google Workspace admin.
//
// ─── ONE SOURCE, TWO RENDERINGS ──────────────────────────────────────────────
//
// This message is consumed three ways: laid out on screen as a numbered list
// with a labelled details block, copied to the clipboard as plain text, and
// pushed into a mailto: body. Written once as structured data and composed into
// text below, because three hand-maintained copies would drift the first time a
// step is reworded, and the one a teacher actually sends is the one nobody would
// be looking at when it happened.
//
// ─── IT IS ABOUT STUDENTS, NOT TEACHERS ──────────────────────────────────────
//
// The earlier version of this page described a teacher who could not sign in.
// That was the wrong diagnosis. Google Workspace blocks THIRD PARTY APPS FOR
// STUDENT ACCOUNTS by default in most districts, and staff accounts usually sit
// in a group where they are already allowed. So the teacher gets in, assumes
// everything works, and then their whole class cannot. Both states of
// /start/access are framed around that now.
//
// ─── NO SCHOOL OR DISTRICT NAME APPEARS HERE ─────────────────────────────────
//
// Deliberately, and it is worth stating because a sample of this message written
// for one pilot district carried a real school name. Everything below says "your
// school" and "your district". Nothing is interpolated except the OAuth client
// ID, which comes from config.

/** The lead paragraph. States the likely cause before asking for anything. */
export const ADMIN_MESSAGE_INTRO =
  `Most likely, your school's student accounts sit in a group where third-party ` +
  `apps are not trusted by default, so Google is blocking the sign-in. If that is ` +
  `what is happening, your district's Google Workspace admin can fix it in a few ` +
  `minutes:`;

/** The console walkthrough, rendered as an ordered list and numbered in text. */
export const ADMIN_MESSAGE_STEPS: readonly string[] = [
  'Go to admin.google.com, then Security, then Access and data control, then API controls.',
  'Open App access control, then Manage third-party app access.',
  // "included here" rather than "included below": the client ID is inside this
  // same message, so "below" would send an admin looking past the end of it.
  'Choose Configure new app and search by OAuth client ID (included here).',
  'Set UnpackMath to Trusted for your student group, or district-wide.',
];

export const ADMIN_MESSAGE_DETAILS_LABEL = 'The details they will need:';

/** Label and value pairs for the block under the steps. */
export const ADMIN_MESSAGE_DETAILS: readonly (readonly [string, string])[] = [
  ['App name', 'UnpackMath'],
  ['Domain', 'app.unpackmath.com'],
  ['OAuth client ID', GOOGLE_OAUTH_CLIENT_ID],
  ['Sign-in scopes', 'email and profile only'],
];

/**
 * The whole thing as plain text, for the clipboard and the mailto body.
 *
 * Composed from the same constants the screen renders, so the message a teacher
 * sends is always the message they were shown.
 */
export const ADMIN_MESSAGE_TEXT = [
  ADMIN_MESSAGE_INTRO,
  '',
  ...ADMIN_MESSAGE_STEPS.map((step, i) => `${i + 1}. ${step}`),
  '',
  ADMIN_MESSAGE_DETAILS_LABEL,
  ...ADMIN_MESSAGE_DETAILS.map(([label, value]) => `- ${label}: ${value}`),
].join('\n');

export const ADMIN_MAIL_SUBJECT = 'Approving UnpackMath for student accounts in Google Workspace';
