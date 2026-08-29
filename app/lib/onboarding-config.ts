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
 * TODO(juan): fill this in before launch. Google Cloud console >
 * APIs & Services > Credentials > the OAuth 2.0 Client ID used by Supabase Auth
 * for the Google provider. It looks like:
 *
 *     000000000000-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com
 *
 * PUBLIC BY DESIGN. This is the client ID, never the client SECRET. The ID is
 * already visible in the OAuth consent URL every user hits, so shipping it in
 * the bundle discloses nothing. Do not put the secret here or anywhere in this
 * repo.
 *
 * While empty, /start/access renders the field as "not published yet" with the
 * copy control disabled, rather than showing an empty box that looks copyable.
 */
export const GOOGLE_OAUTH_CLIENT_ID = "";

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
 * schools@unpackmath.com is the alias app/login/SignIn.tsx already points
 * "Talk to us" at, so this is the address the product already promises rather
 * than a new one. Confirmed live at the time SignIn.tsx was written; it is
 * absent from the rest of the repo, which is why it is named here instead of
 * grepped for.
 *
 * TODO(juan): confirm this is still the right inbox for district approval
 * requests, or point it somewhere better.
 */
export const SUPPORT_EMAIL = "schools@unpackmath.com";

/**
 * True when a real client ID has been supplied. Consumers branch on this rather
 * than testing the string, so the "not configured" rendering has one definition.
 */
export const HAS_OAUTH_CLIENT_ID = GOOGLE_OAUTH_CLIENT_ID.trim().length > 0;
