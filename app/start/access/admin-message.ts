import { GOOGLE_OAUTH_CLIENT_ID } from '../../lib/onboarding-config';

// The message a teacher sends their district's Google Workspace admin.
//
// ─── ONE SOURCE, TWO RENDERINGS ──────────────────────────────────────────────
//
// This message is consumed three ways: laid out on screen as numbered steps with
// a labelled details block, copied to the clipboard as plain text, and pushed
// into a mailto: body. Written once as structured data and composed into text
// below, because three hand-maintained copies would drift the first time a step
// is reworded, and the one a teacher actually sends is the one nobody would be
// looking at when it happened.
//
// ─── WRITTEN IN THE TEACHER'S VOICE ──────────────────────────────────────────
//
// First person, and that is the point: this is a note the teacher SENDS, not
// instructions we give them. So it opens with what they want ("I'd like to use
// UnpackMath with my students"), says what they are seeing, and only then asks
// for the fix. An earlier draft was written at the teacher in the second person,
// which read as documentation and could not be pasted into an email without
// rewriting every sentence.
//
// ─── IT IS ABOUT STUDENTS, NOT TEACHERS ──────────────────────────────────────
//
// Google Workspace blocks THIRD PARTY APPS FOR STUDENT ACCOUNTS by default in
// most districts, while staff accounts usually sit in a group where they are
// already allowed. So the teacher signs in fine, assumes everything works, and
// then their whole class cannot. Both states of /start/access are framed around
// that.
//
// ─── NO SCHOOL OR DISTRICT NAME APPEARS HERE ─────────────────────────────────
//
// Deliberately, and worth stating because a sample of this message written for
// one pilot district carried a real school name. Everything below says "our
// students" and "the student group". Nothing is interpolated except the OAuth
// client ID, which comes from config.

/** Opening paragraph: what the teacher wants, and what they are seeing. */
export const ADMIN_MESSAGE_INTRO =
  `I'd like to use UnpackMath with my students. It's a TSIA2 math prep tool. ` +
  `Right now our students can't sign in, and most likely it's because their ` +
  `accounts are in a group where third-party apps aren't trusted by default, so ` +
  `Google is blocking sign-in.`;

/** Second paragraph, the lead-in to the numbered steps. */
export const ADMIN_MESSAGE_LEAD =
  `If that's what's happening, it's a quick fix in the Google Workspace admin ` +
  `console:`;

/** The console walkthrough, rendered as an ordered list and numbered in text. */
export const ADMIN_MESSAGE_STEPS: readonly string[] = [
  'Go to admin.google.com, then Security, then Access and data control, then API controls.',
  'Open App access control, then Manage third-party app access.',
  // "below" is accurate here: the client ID is in the details block that follows
  // this list, inside the same message.
  'Choose Configure new app and search by the OAuth client ID below.',
  'Set UnpackMath to Trusted for the student group, or district-wide.',
];

export const ADMIN_MESSAGE_DETAILS_LABEL = `Details you'll need:`;

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
  ADMIN_MESSAGE_LEAD,
  '',
  ...ADMIN_MESSAGE_STEPS.map((step, i) => `${i + 1}. ${step}`),
  '',
  ADMIN_MESSAGE_DETAILS_LABEL,
  ...ADMIN_MESSAGE_DETAILS.map(([label, value]) => `- ${label}: ${value}`),
].join('\n');

export const ADMIN_MAIL_SUBJECT = 'Approving UnpackMath for student accounts in Google Workspace';
