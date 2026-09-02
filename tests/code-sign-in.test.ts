import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normaliseEmail, submitCodeSignIn } from '../app/login/code-sign-in.ts';

// The district-code sign-in door.
//
// Tested against stubs rather than a browser because the behaviour that matters
// is the REFUSAL, and a login that is only ever exercised by hand is only ever
// exercised on the path that works. The failing leg has to be the easy one to
// run, or it does not get run.
//
// A real GoTrue refusal is proved separately, against a LOCAL Supabase stack.
// These stubs prove what the component does WITH that refusal: no navigation,
// no session assumed, one message.

interface Call {
  email: string;
  password: string;
}

function stubDeps(
  opts: { error?: { message: string; name?: string; status?: number } | null; throws?: boolean } = {}
) {
  const calls: Call[] = [];
  const navigations: string[] = [];
  const deps = {
    signIn: async (credentials: Call) => {
      calls.push(credentials);
      if (opts.throws) throw new Error('network down');
      return { error: opts.error ?? null };
    },
    navigate: (to: string) => {
      navigations.push(to);
    },
  };
  return { deps, calls, navigations };
}

const GOOD = { email: 'sarah.johnson@district.edu', code: 'K7R2P9WX3MTQ', next: '/dashboard' };

// ─── The success leg, so the refusal below means something ───────────────────

test('a correct email and code signs in and navigates to next', async () => {
  const { deps, calls, navigations } = stubDeps();
  const outcome = await submitCodeSignIn(deps, GOOD);

  assert.equal(outcome, 'ok');
  assert.equal(calls.length, 1);
  assert.deepEqual(navigations, ['/dashboard']);
});

// ─── THE ONE THAT MATTERS ────────────────────────────────────────────────────
//
// A wrong code must refuse AND must not navigate. Navigating on a failed sign-in
// would send the student to a dashboard gate that bounces them straight back to
// /login with nothing said, which reads as "the code worked and then something
// broke" rather than "that code is wrong".

test('a wrong code is refused and does NOT navigate', async () => {
  const { deps, navigations } = stubDeps({
    error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
  });
  const outcome = await submitCodeSignIn(deps, { ...GOOD, code: 'WRONGWRONG12' });

  assert.equal(outcome, 'invalid-credentials');
  assert.deepEqual(navigations, [], 'a refused sign-in must not navigate');
});

test('an unknown email is refused the same way, and is indistinguishable', async () => {
  const refusal = { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 };
  const wrongCode = await submitCodeSignIn(stubDeps({ error: refusal }).deps, GOOD);
  const unknownEmail = await submitCodeSignIn(stubDeps({ error: refusal }).deps, {
    ...GOOD,
    email: 'nobody@district.edu',
  });
  // Same outcome, so the caller has the same sentence for both. Anything finer
  // would answer "does this address have an account?" for whoever asks.
  assert.equal(wrongCode, 'invalid-credentials');
  assert.equal(unknownEmail, 'invalid-credentials');
});

// ─── The split: reached a verdict, or did not ────────────────────────────────
//
// THE CASE THAT ALMOST GOT MISSED. signInWithPassword catches AuthErrors and
// RETURNS them, so a dropped connection arrives here as a returned
// AuthRetryableFetchError, not as a throw. A split that only watched the
// try/catch would call every real network failure a wrong code, which is the
// exact harm the split exists to remove.
test('a RETURNED AuthRetryableFetchError is unreachable, not a wrong code', async () => {
  const { deps, navigations } = stubDeps({
    // status 0 is what GoTrue attaches when the response was not a fetch
    // Response at all: a dropped connection or a DNS failure.
    error: { message: 'Failed to fetch', name: 'AuthRetryableFetchError', status: 0 },
  });
  const outcome = await submitCodeSignIn(deps, GOOD);

  assert.equal(outcome, 'unreachable');
  assert.deepEqual(navigations, [], 'still must not navigate');
});

// GoTrue raises the same error for 500, 501, 502, 503, 504 and 520-530: a
// gateway that never asked the database anything. No verdict, so no claim about
// the credentials.
test('a 5xx gateway failure is unreachable too', async () => {
  for (const status of [500, 502, 503, 504, 521, 530]) {
    const outcome = await submitCodeSignIn(
      stubDeps({ error: { message: 'Bad gateway', name: 'AuthRetryableFetchError', status } }).deps,
      GOOD
    );
    assert.equal(outcome, 'unreachable', `status ${status}`);
  }
});

// A real refusal must NOT be classified as unreachable, or the enumeration
// protection quietly stops applying to the case it was written for.
test('a credentials refusal is never mistaken for unreachable', async () => {
  for (const name of ['AuthApiError', 'AuthUnknownError', undefined]) {
    const outcome = await submitCodeSignIn(
      stubDeps({ error: { message: 'Invalid login credentials', name, status: 400 } }).deps,
      GOOD
    );
    assert.equal(outcome, 'invalid-credentials', `name ${String(name)}`);
  }
});

test('a thrown request is unreachable rather than reported as signed in', async () => {
  const { deps, navigations } = stubDeps({ throws: true });
  const outcome = await submitCodeSignIn(deps, GOOD);

  assert.equal(outcome, 'unreachable');
  assert.deepEqual(navigations, []);
});

// ─── Normalisation, asserted on what GoTrue actually receives ────────────────
//
// Not on a display value. student-provision.ts:101 stores
// trim().toLowerCase(), so that is the string the account is keyed on.

test('the email handed to signInWithPassword is trimmed and lowercased', async () => {
  const { deps, calls } = stubDeps();
  await submitCodeSignIn(deps, { ...GOOD, email: '  Sarah.JOHNSON@District.edu \n' });

  assert.equal(calls[0].email, 'sarah.johnson@district.edu');
});

// The code is a PASSWORD and is case-sensitive. Normalising it the way the email
// is normalised would make every code with a lowercase glyph unusable, and the
// generator's alphabet is uppercase only, so the bug would hide until the
// alphabet changed.
test('the code is passed through untouched', async () => {
  const { deps, calls } = stubDeps();
  await submitCodeSignIn(deps, { ...GOOD, code: 'K7R2P9WX3MTQ' });

  assert.equal(calls[0].password, 'K7R2P9WX3MTQ');
});

test('normaliseEmail handles the shapes a roster paste produces', () => {
  assert.equal(normaliseEmail('  SARAH@X.EDU '), 'sarah@x.edu');
  assert.equal(normaliseEmail('sarah@x.edu'), 'sarah@x.edu');
  assert.equal(normaliseEmail('\tSarah@X.Edu\n'), 'sarah@x.edu');
});

// `next` is resolved by the caller with safeNext(), the same call the Google
// button uses. This module must not second-guess it, but it must not rewrite it
// either: a student who followed /login?next=/dashboard/settings lands there.
test('next is navigated to verbatim', async () => {
  const { deps, navigations } = stubDeps();
  await submitCodeSignIn(deps, { ...GOOD, next: '/dashboard/settings' });

  assert.deepEqual(navigations, ['/dashboard/settings']);
});

// ─── The disclosure, pinned in source ────────────────────────────────────────
//
// A source-level check, and it is worth being honest that it is not a DOM
// assertion: there is no renderer in this lane. What it pins is the two facts a
// DOM test would check -- the form starts closed, and it is rendered only when
// opened -- so neither can be reversed without this failing.

const SIGNIN = readFileSync(new URL('../app/login/SignIn.tsx', import.meta.url), 'utf8');

test('the code form is closed on load and gated on the toggle', () => {
  assert.match(
    SIGNIN,
    /const \[showCode, setShowCode\] = useState\(false\)/,
    'the second door must start closed'
  );
  assert.match(
    SIGNIN,
    /\{!isTeacher && showCode && \(/,
    'the form renders only when the toggle is open'
  );
  assert.match(
    SIGNIN,
    /\{!isTeacher && !showCode && \(/,
    'the link shows only while the form is closed'
  );
  assert.match(SIGNIN, /onClick=\{\(\) => setShowCode\(true\)\}/, 'the link opens it');
});

// Students only. A teacher reaching /login?role=teacher must see neither the
// link nor the form: teacher accounts are not provisioned with codes.
test('the second door is students only', () => {
  assert.doesNotMatch(SIGNIN, /\{showCode && \(/, 'every gate must also test isTeacher');
});

// The trap this door exists to avoid. A join code typed here would be staged in
// a cookie only /auth/callback reads, and password sign-in never goes there, so
// the student would land enrolled in nothing while the screen said otherwise.
const CODE_FORM = readFileSync(new URL('../app/login/CodeSignIn.tsx', import.meta.url), 'utf8');

// COMMENTS STRIPPED BEFORE MATCHING, and that correction came out of running the
// check rather than reading it. The first spelling asserted that the string
// "JoinClass" was absent from the file, and it failed on the component's own
// header comment, which names JoinClass in order to explain why there is no join
// box here. A guard that fires on the documentation of a decision, rather than
// on the code that implements it, is a guard that gets deleted.
const CODE_FORM_SOURCE = CODE_FORM.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// The two outcomes must reach two different strings. A component that mapped
// both to codeError would pass every test above while showing "that code is
// wrong" to a student whose wifi dropped.
test('the component routes each outcome to its own message', () => {
  assert.match(
    CODE_FORM_SOURCE,
    /outcome === 'unreachable' \? 'codeErrorNetwork' : 'codeError'/,
    'unreachable and invalid-credentials must not share a string'
  );
  assert.match(CODE_FORM_SOURCE, /t\(lang, errorKey\)/, 'the message must read the routed key');
  assert.doesNotMatch(CODE_FORM_SOURCE, /t\(lang, 'codeError'\)/, 'must not hardcode one key');
});

test('the code form carries no join-code box', () => {
  assert.doesNotMatch(CODE_FORM_SOURCE, /JoinClass/, 'no join-code component');
  assert.doesNotMatch(CODE_FORM_SOURCE, /enroll\/lookup/, 'no pre-auth join lookup');
  // The comment IS still expected to explain the absence. If someone strips the
  // reasoning out, the next person re-adds the box.
  assert.match(CODE_FORM, /NO JOIN-CODE BOX IN THIS FORM/, 'the reason must stay documented');
});
