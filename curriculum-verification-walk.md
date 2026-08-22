# Curriculum verification walk

Branch `fix/curriculum-dark-probe-gap`. Written 2026-08-22, against a running dev
server at `http://localhost:5140` and the live Supabase project
`knhqjztqtrsysgnwcbvw`.

This records a walk of every curriculum surface on **real `/course` URLs with a
real session**, in both themes, at 1280px and 390px, and the proof that each
check in it can fail.

---

## 1. The headline, re-verified

Removing the content cards raised inline-maths contrast in **both** themes. The
claim was re-measured from scratch because the original probe used a selector
that could have resolved to the wrong node.

Measured on `/course/tsia2/math/unit/0/topic/QR.1.5/lesson`, on the first inline
maths in prose — the `$40 - 65 = -25$` in the opening paragraph.

| node | light before → after | dark before → after |
|---|---|---|
| **inline maths** (`.um-prose p .katex`) | **18.96 → 14.68** | **13.12 → 15.29** |
| bold key term (`.um-prose strong`) | 18.96 → 14.68 | 13.12 → 15.29 |
| body prose (`.um-prose p`) | 8.73 → 7.56 | 7.16 → 7.97 |

**The original figures were correct.** No correction to the PR description is
needed.

Three measurement points, not two, so the card removal is isolated from the
three commits that followed it:

| point | commit | light | dark |
|---|---|---|---|
| A — before card removal | `61f639f^` (`0f1f969`) | 18.96 | 13.12 |
| B — card removal only | `61f639f` | 14.68 | 15.29 |
| C — branch tip (ships) | `f0f54b2` | 14.68 | 15.29 |

B and C are identical to the hundredth on all four probes, so **card removal
accounts for the entire delta** and the three later commits moved none of it.

### The mechanism is visible in the measurement

The probe reports which ancestor supplied the effective background:

- **Before**: `section.um-prose-card` — `#FFFDF8` light, `#262521` dark.
- **After**: `div.um-topic` — `#E8E0CF` light, `#17171A` dark.

The card is literally what sat between the text and the page. In dark, the card
was *lighter* than the page (`#262521` vs `#17171A`), which is why removing it
raised the ratio rather than lowering it.

### Why inline maths and the bold term report identical numbers

Not a probe artefact. They are the same ink on the same ground — `#0E0E11` in
light, `#F2EDDF` in dark — measured through two independent selectors.

### Did the old `.katex` selector land on the right node?

**Yes, but by luck, and it is now named rather than relied on.**

Proven rather than assumed, in-page:
`document.querySelector('.katex') === document.querySelector('.um-prose p .katex')`
evaluates **true** on this topic, and the node is the `$40 - 65 = -25$` inline
maths inside `p < div.um-prose < section.um-prose-card`. All **77** KaTeX nodes
on the page are inside `.um-prose`; **zero** are in the outline rail.

The risk was real. `LessonBody.tsx:215` renders the outline rail — including
`section.heading_html` — **before** the content column at `:340`. On a topic
whose authored `h5` contains maths, the first `.katex` in DOM order would be a
rail heading, and the probe would have measured chrome while reporting a prose
number. No QR.1.5 heading contains maths, so it never fired. The walk now uses
`.um-prose p .katex`.

---

## 2. The session, and why the capture changed

### The mint path replaced cookie transplant

`SUPABASE_SERVICE_ROLE_KEY` is already in `.env.local`, already used by nine
scripts and `app/lib/supabase-admin.ts`. Using it for a local harness introduces
no new secret. `scripts/capture_auth_state.mjs` now:

1. `admin.auth.admin.generateLink({ type: 'magiclink' })` → `hashed_token`
2. anon client `.auth.verifyOtp({ token_hash })` → a real session
3. serialises it through **`@supabase/ssr`'s own** `stringToBase64URL` +
   `createChunks`, so the cookie format is not hand-rolled
4. re-scopes onto `--base` and writes `.auth/e2e-storage-state.json`

Verified against the project 2026-08-22: a 56-char `hashed_token`, exchanged for
a session with a live refresh token, 60-minute expiry, chunked to
`sb-knhqjztqtrsysgnwcbvw-auth-token.0` (3180 chars) and `.1`.

**The Email provider was NOT enabled and does not need to be.** `generateLink`
mints a token without sending mail. Had it returned 422
`email_provider_disabled`, the script would have said so and pointed at the
transplant fallback — enabling a second auth path on production to satisfy a
test harness was ruled out, and the script's error text says so rather than
suggesting it.

**What the mint path does not cover, stated rather than implied:** it is not the
Google OAuth flow. It proves the `/course` gate accepts a valid Supabase session.
It does *not* exercise `app/login/SignIn.tsx` or `app/auth/callback/route.ts`,
which stay covered by `verify_login_next.mjs` and `verify_auth_gate.mjs`.

### `--from-cookies` was writing invalid sessions and exiting 0

The transplant path had **no validation at all**. The interactive path opened
QR.1.5 before saving; the cookie path wrote the file and exited 0. Measured with
a fabricated session — well-formed base64 JSON, garbage tokens:

```
wrote .auth/e2e-storage-state.json with 2 cookie(s) scoped to localhost
exit=0
```

That is the same defect class as `verify_items_self_contained.mjs` asserting
against the login page, inside the file written to fix that class.

`scripts/session-guard.mjs` now holds `assertSessionOpensCurriculum()`. **Every**
capture path clears it before a state file is written, and the walk re-runs it as
step 0. It asserts values, not shapes:

| | asserted |
|---|---|
| status | `=== 200` |
| pathname | `=== /course/tsia2/math/unit/0/topic/QR.1.5/lesson` |
| wrapper | `.um-topic` present, carrying `data-theme` |
| h1 | `=== "Operations with rational numbers (signed numbers, fractions, decimals)"` |
| topic code | `QR.1.5` on the page |
| provenance | `.um-prose .katex .katex-mathml` count `> 0` |

QR.1.5 is a Full-Course-only marker: the free sample is AR.1.4, so a signed-in
free-tier account is sent to `/dashboard/upgrade` for this topic and an anonymous
one to `/login`.

---

## 3. Three defects found in the committed walk

All three are the same class: a check reporting success while measuring
something other than the thing.

**1. It waited on `networkidle`, and the quiz surface never reaches it.**
Measured: 30s timeout with **zero** requests outstanding. Every surface now waits
on the element it is about to assert against.

**2. It trusted `addInitScript` for the theme.** It wrote
`localStorage['ec-theme']` and measured, asserting nothing about whether the
theme applied. `ThemeProvider` initialises to `"light"` and reads storage in an
*effect*, so a dark pass that silently stayed light would have reported clean —
and would have reported the **light** contrast number under a dark label.

**3. Its boundary check was an absence assertion.**
`!url.includes('/topic/QR.1.5/lesson')` passes when the server 500s, when the dev
server is down, and when the URL has a typo. Same shape as CourseBand's "absence
of `\d+\s*/\s*\d+`" passing on `undefined / 97`. It now asserts
`pathname === '/login'` **and** that `?next=` round-trips the requested path.

### Two defects found in the new checks, during the run

Recorded because both were caught by the checks failing, not by reading.

**The theme assertion was racing hydration.** It went red on different surfaces
on different runs — quiz on desktop/dark, practice on phone/dark — which is a
race signature, not a broken theme. The theme is now waited for and *then*
asserted. Waiting does not make it unfailable: on timeout the wait gives up and
the assertion reports the real attribute value, proven in §4.

**The rail-band check measured an element that does not exist at 390px.** It read
the band out of `document.body.innerText`, which omits anything not rendered. At
390px the rail is in the DOM but laid out to zero, so the check failed against a
correct mobile layout. It now reads the node directly and pins visibility per
width — so a rail *leaking* onto the phone is also red.

---

## 4. Proof that each check can fail

Every fault was applied to the real code path, the walk was run, the fault was
reverted, and the walk was re-run. Control: **160/160 passing** before and after
each.

| # | fault | result | reverted |
|---|---|---|---|
| 1 | fabricated session via `--from-cookies` | **red** — `redirected to /login: no valid session`, exit 1, **no state file written** (previously: wrote and exited 0) | n/a |
| 2 | `{"cookies":[…]}` wrapper instead of an array | **red** — named message, exit 1 (previously: raw `raw.filter is not a function` stack) | n/a |
| 3 | `CourseBand.tsx:100` → `{String(undefined)} / {topicCount}` | **red ×4** — `course numerator is an integer in 0..97 / got "undefined"`. Denominator check stayed green at 97, isolating which half broke. | ✅ |
| 4 | `ThemeProvider` never applies the stored theme | **red ×10** — every dark surface at both widths. The 6 dark contrast checks were **suppressed, not passed**, so no light number was ever reported as a dark one. | ✅ |
| 5 | pre-`61f639f` card fills restored via CSS | **red ×4** — `contrast (light) expected 14.68 got 18.96`, `contrast (dark) expected 15.29 got 13.12` | ✅ |
| 6 | stray `minWidth: 900` on `.um-lesson-measure` | **red ×2** — `horizontal overflow px expected "<= 1" got 542`, at 390px only, silent at 1280px | ✅ |

Fault 5 is worth reading twice: it reproduced the *exact* pre-removal numbers
through a completely different mechanism than the git-checkout measurement in §1.
That is a third independent confirmation of 18.96/13.12.

It also shows why the exact pin matters. Under fault 5 the
"clears WCAG AA" check **stayed green** — 18.96 and 13.12 both clear 4.5:1. A
threshold check could not have seen the regression. The pinned value did.

### One fault that did not work first time, and why

The first attempt at fault 6 set `min-width: 900px` via CSS. The walk stayed
**green**, which would have meant an unfaultable check. Investigated rather than
accepted: the rule was in the stylesheet and matched the element, but
`LessonBody.tsx:358` sets `minWidth: 0` as an **inline style**, which outranks
it. Re-faulted at the inline layer, it went red at 542px. The inline `minWidth: 0`
is load-bearing — its own comment says a long equation would otherwise set the
element's floor width — and this check is what guards it.

---

## 5. What the walk covers

`node scripts/walk_curriculum.mjs --base http://localhost:5140` → **160 checks,
all passing**.

Five surfaces × two themes × two widths, plus the signed-out boundary and the
step-0 session guard. Real `/course` URLs throughout; **no synthetic probe
routes**.

| surface | pinned values |
|---|---|
| `/dashboard/modules` | h1 `Modules`; rail band `TEACHER · PREVIEW`; course denominator `97`; numerator an integer 0..97; band visible at 1280 and hidden at 390 |
| `/course/…/QR.1.5` | h1 exact; `.katex` count `0` |
| `/course/…/QR.1.5/lesson` | h1 exact; `.katex` `77`; `.katex-mathml` `77`; first inline maths text `40−65=−25`; contrast `14.68` light / `15.29` dark; clears 4.5:1 |
| `/course/…/QR.1.5/practice` | h1 exact; `.katex` `5`; `.katex-mathml` `5`; item counter `1 / 10` |
| `/course/…/QR.1.5/quiz` | h1 exact; `.katex` `23`; `.katex-mathml` `23` |
| all | status `200`; pathname exact; resolved `data-theme` matches the requested theme; horizontal overflow `<= 1px` |

Every surface also asserts the resolved `data-theme` **before** anything is
measured, and the contrast measurements are gated behind it.

### The persona this runs as

`vics8388@gmail.com` is `role='teacher'`, `plan='full-course'`.

Checked against `app/lib/course-access.ts` rather than assumed: the **buyer
branch is evaluated first and matches**, returning `viaTeacher: false`, so the
role is never read. This is the plain direct-entitlement path. The teacher branch
below it could not fire anyway — it also requires
`planGrants(plan, 'teacher-dashboard')`, and that capability exists only on
`teacher-core` and `teacher-pro`.

So **role is orthogonal to `/course`**. It is *not* orthogonal to the student
rail on `/dashboard/modules`: `StudentNav.tsx:193,208` renders the band as
`TEACHER · PREVIEW` rather than `STUDENT`, and `:289` adds a Teacher Dashboard
link. The walk pins the value this persona actually produces.

`sql/e2e_test_account_entitlement.sql` claimed role had to stay `'student'` or
the walk would take "the derived viaTeacher branch". That is wrong for the reason
above, and the file has been corrected in place rather than silently edited.

---

## 6. Not covered — entitlement states, and this is a real gap

**The brief asked for every entitlement state. Two of five are covered on real
URLs. This was not deliverable without a decision that is not mine to make.**

| state | covered on real URLs? | how |
|---|---|---|
| anonymous / signed out | ✅ | fresh context → `pathname === '/login'`, `?next=` round-trips |
| full course | ✅ | the captured session |
| signed-in free tier | ❌ | needs a second account |
| teacher by plan (`teacher-core`/`teacher-pro`) | ❌ | needs a second account |
| derived teacher-grant (student in an entitled teacher's class) | ❌ | needs two accounts and a class enrolment |

One saved session is one account. The three uncovered states each need a
**different** account, and the only ways to get one are:

1. **Create dedicated test accounts in production auth.** The mint path can do
   this (`admin.auth.admin.createUser`), but it writes real rows to
   `auth.users` and `public.profiles` on production, days from a district pilot.
   Not done without an explicit decision.
2. **Temporarily change `vics8388@gmail.com`'s own plan.** That is the live
   owner account; flipping its plan mid-session would take away real access.
   Not done.
3. **Borrow a real customer's account.** The service-role key makes this
   technically possible and it is not acceptable — that is impersonating a
   paying customer. Not done, and should stay not done.

Until one of those is chosen, these three states remain covered only by
`verify_modules_states.mjs`, which mounts the real row components in each state.
That is a **weaker instrument** — it does not exercise the gate, the middleware,
the layout chain or the real Supabase read — and it is named as one here rather
than left implied.

---

## 7. Other open items

- **`sql/e2e_test_account_entitlement.sql` shipped with the literal
  `REPLACE_WITH_TEST_ACCOUNT_EMAIL`** in both `where` clauses, so the first runs
  matched zero rows and the Supabase editor reported *"Success. No rows
  returned"* for both the `UPDATE` and the `SELECT`. That reads as a pass and is
  not one; it cost an hour. A warning is now at the top of the file, and the
  correction to the `role` rationale is beside it.
- **`.katex` as a bare selector** still appears in other probe scripts. Only the
  walk was tightened. Worth a sweep, out of scope here.
- **The session expires in ~60 minutes.** Re-running the capture is one command,
  which is the main practical reason mint beats transplant.

---

## Reproducing

```bash
npx next dev -p 5140
node scripts/capture_auth_state.mjs --base http://localhost:5140
node scripts/walk_curriculum.mjs   --base http://localhost:5140
```

Both must use the **same** `--base`: the session is cookie-borne and cookies are
scoped to an origin.
