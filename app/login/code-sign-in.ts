// The submit half of the district-code sign-in door.
//
// SPLIT OUT OF THE COMPONENT so it can be tested without a DOM. Same shape as
// app/lib/join-enroll.ts against the OAuth callback: the component owns when
// this runs and what the screen looks like, this owns what happens. The
// behaviour worth proving here is a refusal, and a refusal that is only ever
// exercised by hand is not proven at all.
//
// PASSWORD SIGN-IN DOES NOT PASS THROUGH /auth/callback. The OAuth door hands
// `next` to Supabase as redirectTo and the callback route performs the redirect;
// this door gets its session in-page and has to navigate itself. `next` is
// therefore resolved by the CALLER with the same safeNext() call the Google
// button uses, so the two doors cannot disagree about where a student lands.
//
// Imports nothing, so `node --test` can load it directly.

/** The shape of a GoTrue refusal, narrowed to what this module reads. */
export interface SignInError {
  message: string;
  /** GoTrue sets this. "AuthRetryableFetchError" means no verdict was reached. */
  name?: string;
  status?: number;
}

/** Just enough of the Supabase auth client to sign in. */
export interface CodeSignInDeps {
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ error: SignInError | null }>;
  /** Full document navigation. See the note on the caller in CodeSignIn.tsx. */
  navigate: (to: string) => void;
}

export type CodeSignInOutcome =
  /** Signed in. Navigation is already under way. */
  | "ok"
  /** GoTrue reached a verdict and it was no. Deliberately ambiguous on screen. */
  | "invalid-credentials"
  /** The request never got an auth verdict at all. Says nothing about accounts. */
  | "unreachable";

/**
 * Did the request fail to reach a verdict, rather than get refused?
 *
 * READ OFF error.name, NOT off the message. GoTrue raises
 * AuthRetryableFetchError in exactly two situations
 * (@supabase/auth-js/lib/fetch.js:26-33): the response does not look like a
 * fetch Response at all, which is a dropped connection or DNS failure and
 * carries status 0, and an HTTP 500, 501, 502, 503, 504 or 520-530, which is a
 * server or gateway that never asked the database anything. Both mean the same
 * thing here: nobody checked the credentials, so nothing can be said about them.
 *
 * AND IT IS RETURNED, NOT THROWN. signInWithPassword catches every AuthError and
 * hands it back in `error` (GoTrueClient.js, the catch on isAuthError), so a
 * split that only inspected the try/catch below would classify every real
 * network failure as a wrong code. That is the bug this function exists to
 * prevent, and it is why the catch is the second line of defence rather than the
 * first.
 */
function neverReachedAVerdict(error: SignInError): boolean {
  return error.name === "AuthRetryableFetchError";
}

/**
 * The email as it was STORED, not as it was typed.
 *
 * app/lib/student-provision.ts:101 writes `input.email.trim().toLowerCase()`, so
 * that is the string the account is keyed on. GoTrue matches case-insensitively
 * and would forgive the case on its own, but the trim it would not: a trailing
 * space pasted out of a roster is a failed sign-in with nothing on screen to
 * explain it, and a student cannot see a space.
 */
export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Sign in with an email and a provisioned code, and navigate on success.
 *
 * TWO FAILURES, AND THE SPLIT IS ON WHETHER ANYONE CHECKED. A wrong code and an
 * unknown email are one outcome, "invalid-credentials", and the caller says the
 * same ambiguous sentence for both: telling them apart would make this form
 * answer "does this address have an account?" for whoever asks, and the student
 * can do nothing different with the finer answer.
 *
 * A request that never reached a verdict is "unreachable" and is told apart,
 * because it carries NO enumeration cost. It is true for every email, existing
 * or not, so it leaks nothing. Folding it into the ambiguous string was the
 * earlier behaviour and it was actively harmful: a student whose wifi dropped
 * was told their code was wrong, and the only thing they can do with that is go
 * ask their teacher to mint a new one they did not need.
 *
 * NAVIGATION HAPPENS ONLY ON SUCCESS, and only after the client has written the
 * session. A navigate on a failed sign-in would land the student on a dashboard
 * gate that bounces them straight back to /login with nothing said.
 */
export async function submitCodeSignIn(
  deps: CodeSignInDeps,
  input: { email: string; code: string; next: string }
): Promise<CodeSignInOutcome> {
  let error: SignInError | null = null;
  try {
    const result = await deps.signIn({
      email: normaliseEmail(input.email),
      password: input.code,
    });
    error = result?.error ?? null;
  } catch {
    // SECOND LINE OF DEFENCE, not the main one. signInWithPassword returns its
    // AuthErrors rather than throwing them, so the network case almost always
    // arrives as a returned AuthRetryableFetchError and is classified below.
    // Anything that still throws got no verdict either.
    return "unreachable";
  }

  if (error) {
    return neverReachedAVerdict(error) ? "unreachable" : "invalid-credentials";
  }

  deps.navigate(input.next);
  return "ok";
}
