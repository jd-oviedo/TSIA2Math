// Values the district-access helper needs that are not derivable from the code.
//
// ─── ALL THREE ARE UNSET AND NEED JUAN BEFORE LAUNCH ─────────────────────────
//
// Every one of these is a real-world value that only the account owner has. None
// of them is invented here, and none should be: a placeholder client ID handed
// to a Workspace admin is worse than no client ID, because they will paste it
// into App access control, it will match nothing, and the approval will silently
// cover no app at all.
//
// Each is EMPTY by default and every consumer is written to degrade honestly
// when it is empty rather than to render a fake value. See the notes on each.

/**
 * The PUBLIC OAuth client ID for the Google sign-in app, the one a Workspace
 * admin pastes into Security > API controls > App access control to trust
 * UnpackMath.
 *
 * SUPPLIED, so /start/access now renders the real value with its copy control
 * enabled. It appears twice on that page by design: once in the message a
 * teacher sends their admin, and once in the dedicated field, because an admin
 * reading the message needs it inline and a teacher pasting it into a ticket
 * needs it on its own.
 *
 * PUBLIC BY DESIGN. This is the client ID, never the client SECRET. The ID is
 * already visible in the OAuth consent URL every user hits, so shipping it in
 * the bundle discloses nothing. Do not put the secret here or anywhere in this
 * repo.
 *
 * If it is ever emptied, the field falls back to "Not published yet" with the
 * copy control disabled rather than showing an empty box that looks copyable.
 * That fallback is kept deliberately: a placeholder pasted into App access
 * control would match no app and approve nothing.
 */
export const GOOGLE_OAUTH_CLIENT_ID =
  "486519212269-u1r9kd404jur9sessegdf74kc01r97nl.apps.googleusercontent.com";

/**
 * Scheduling link for the "We'll help, book 15 min" button.
 *
 * TODO(juan): fill this in with the real booking URL, for example a Cal.com or
 * Calendly link. Must be a full https:// URL.
 *
 * While empty, the button falls back to a mailto: to SUPPORT_EMAIL with a
 * subject that asks for the same thing, so the affordance still works and the
 * teacher still reaches a human. It never renders as a dead control.
 */
export const BOOKING_URL = "";

/**
 * Where district-access mail goes when there is no booking link.
 *
 * support@unpackmath.com, set by Juan. Note this is DIFFERENT from the
 * schools@unpackmath.com alias that app/login/SignIn.tsx still points "Talk to
 * us" at. The two are deliberately separate for now: that link is a sales
 * enquiry from someone with no account, this one is a support request from a
 * teacher who is blocked. If they should be the same inbox, SignIn.tsx is the
 * other place to change and this file is not the only one.
 */
export const SUPPORT_EMAIL = "support@unpackmath.com";

/**
 * True when a real client ID has been supplied. Consumers branch on this rather
 * than testing the string, so the "not configured" rendering has one definition.
 */
export const HAS_OAUTH_CLIENT_ID = GOOGLE_OAUTH_CLIENT_ID.trim().length > 0;
