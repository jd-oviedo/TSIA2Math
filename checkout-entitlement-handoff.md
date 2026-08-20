# TSIA2Math, Checkout and Entitlement Session Handoff

*Originally written August 18, 2026. Updated August 18, 2026 with the Phase 1
findings and the six resolved blockers. For the `TSIA2Math` repo,
app.unpackmath.com. Read fully before touching anything.*

---

## 0. What this session is

Stripe is live. Six Payment Links exist and can take real money today. The path
from the marketing site to checkout is broken, and fixing the break without
building what sits behind it would be worse than leaving it broken.

This session builds the entitlement layer: what happens after someone pays. The
slug fix that surfaces the whole problem is the **last** step, not the first.

**Workflow, non-negotiable.** Investigate, report, wait for approval, build.
Juan reviews in the browser before any commit. Then
`npx tsc --noEmit && npx next build`, then commit. Never self-merge. PR for
review.

If you find a contradiction in these instructions, say so and stop. That
behaviour caught five real defects in the session that produced this document,
including two errors by the person who wrote it, and it caught four more in
Phase 1. It is the behaviour to reinforce, not smooth over.

**No em dashes, in copy or code.**

---

## 0.1 End state, 2026-08-19

Everything below this line was written earlier in the session. This section is
the state at the end of it.

### Live on production

`main` at `792b6f2`. Deploy confirmed by behaviour, not by a pipeline status:
the course gate enforces on `app.unpackmath.com`, `/dashboard/upgrade` exists,
and 24 anonymous POSTs to `/api/gumu/session` returned 401 with zero 429s, which
is the post-merge auth-before-rate-limit ordering.

- **Entitlement columns and the product-aware webhook** (Phases 2 and 3)
- **The course gate** (Phase 4). `/course` had never had an auth check of any
  kind. `curriculum` is Full Course only, AR.1.4 is the one free sample and is
  for SIGNED-IN free-tier users only, teachers enter by a second door
  (`curriculum OR teacher-dashboard`) rather than by widening the map.
  **25 of 32 existing accounts lost curriculum access at that merge**, which was
  the intended effect and is why the $89 product now unlocks something.
- **GUMU crisis screening.** Shipped after three weeks waiting. Three items in
  it are still `[PLACEHOLDER, COUNSELOR]`.
- **The unmatched-payment alert** (Part 1 of finding A).
- **The webhook writes role** on a teacher purchase (ruling 1).
- All six `subscription_status` readers moved onto the plan. The column cannot
  be dropped until `legacyActivateOnly` can name a product.

### Phase 6, run against production with real money

**Teacher purchase: SUCCESS, and it proves ruling 1 on production.** Teacher Core
$20 bought on a direct `buy.stripe.com` link with `juansmokylapis@gmail.com`, an
existing STUDENT row. The webhook wrote the entitlement and promoted `role` to
`teacher` in the same guarded UPDATE. `/teacher` loads. That is exactly the case
the old `auth/callback` promotion could not reach, because a direct link touches
neither `/upgrade` nor `/login`.

**Student purchase: FINDING A, FIRING ON LIVE TRAFFIC WITH REAL MONEY.** Practice
Pass bought on a direct link with `contact@jdoviedo.com`, which has no account.
All three resolution steps missed, nothing was written, and the handler returned
200. Being refunded and rebought with a Google address so Phase 6 can finish.

**And it is worse than unmatched, which changes Part 2's design.**
`contact@jdoviedo.com` is not a Google account. The app offers Google only: two
`signInWithOAuth` calls, both `provider: 'google'`, and no password, OTP or magic
link anywhere in the UI. So that buyer can never create the profile an
email-keyed pending row would wait for.

**The email key fails a second way that is not about Google at all.** The buyer
paid as `contact@jdoviedo.com` and signed in as `juansmokylapis@gmail.com`. A
plain Google user who types any other address at Stripe checkout is equally
unreachable. That is the default behaviour of a checkout form that pre-fills
nothing, not an edge case.

**So Part 2 keys on `checkout_session_id`, not email.** See the ordered queue
below. Email becomes a recorded attribute for the alert and for manual matching,
never the join.

**Noted while checking: Supabase has the email provider ENABLED with
`disable_signup: false`**, alongside Google. No UI offers it and
`mailer_autoconfirm` is false, so it is a door nobody is watching rather than a
usable path. Worth closing or watching, separately.

### Queue

Rewritten 2026-08-20. Everything in the previous "tomorrow, in order" list has
shipped; what remains is renumbered rather than left as a stale entry.

**Where the payment-loss story stands: ONE PIECE LEFT, and it is not in this
repo.** A paid checkout that matches no account is now captured, alertable, and
claimable by two routes. What is still missing is the step that puts the claim
link in front of the buyer automatically. Until it lands, every recovery goes
through a human forwarding the ops email — see item 1.

**Shipped**

- **Part 2: pending entitlements and the claim. PR #164.**
  `pending_entitlements` (DDL applied by hand, zero grants for `anon` and
  `authenticated` confirmed), `app/lib/pending-entitlements.ts`, the webhook
  reorder so both branches consume one entitlement, `/claim`, the
  `auth/callback` email claim, the rewritten ops alert that no longer says the
  buyer has nothing, and `scripts/faultproof_claim.mjs` in `test:offline`.
  Verified live against the real table: `claimed`, `stale` and `not-found` all
  render, and a claim wrote `access_until` six months from the EVENT timestamp
  with `plan_updated_at` equal to `event_created_at`.

- **The unlinked-customer alert. PR #165.** Found while checking that live
  claim. `linkCustomerId` is first-writer-wins, so a purchase landing on a
  profile that already carries a different `stripe_customer_id` leaves the new
  one unstored — and if that new customer has a subscription, its renewals
  resolve to nobody and the teacher lapses looking like an ordinary expiry. It
  hits the **matched** webhook path too (`/upgrade` with a different checkout
  email), where no pending row exists and nothing in #164 could see it. Not
  fixable in the schema: `profiles` has one `stripe_customer_id` column and one
  profile genuinely cannot hold two Stripe customers. Both call sites now share
  one classifier and alert with severity following the term — `error` for
  monthly/annual where renewals really drop, `warning` for one-time where
  nothing renews. **Reconciling the two Stripe customers is manual when it
  fires.**

- **The `/upgrade` slug fix**, with `monthly` and `annual` dropped so the
  founding backdoor closed in the same change. Covered by
  `scripts/faultproof_upgrade_slugs.mjs`.

- **The tier label defect. PR #162** — the sidebar names the tier from the plan
  rather than from entitlement.

**Next**

1. **`unpackmath-home`'s `/success` must read `checkout_session_id` and forward
   the buyer to `app.unpackmath.com/claim?checkout_session_id=...`.** THE LAST
   PIECE OF THE PAYMENT-LOSS STORY. Everything on the app side is shipped; this
   is in the marketing repo, and it is Juan's.

   All **eight** success URLs now carry `?checkout_session_id={CHECKOUT_SESSION_ID}`
   — the six public links and both founding links, all of which land on
   `/success`. Confirmed in the Stripe dashboard 2026-08-20. (The previous
   revision of this document said six; that was wrong, and it mattered, because
   the two founding links are the ones warm contacts are buying on.)

   **Until that ships, the ops alert email is the ONLY delivery path for the
   claim link.** `sendUnmatchedCheckoutAlert` prints it for every captured
   purchase, so a buyer can be unblocked by forwarding it by hand. Nothing is
   lost in the meantime — the row is held either way — but the recovery is
   manual, and it stays manual until this lands.

2. **Ruling 1b**: remove the role write from `auth/callback:62-68`. Unblocked
   since the webhook writes role first, and now doubly redundant: the claim
   replays through `writeEntitlement`, whose guarded UPDATE promotes on a
   teacher plan. `/claim` already declines to set `role=teacher` on its callback
   for this reason. Deliberately not bundled into the Part 2 branch, so that
   removing a live role writer is a change reviewed on its own.

3. **"TEACHER · PRO" is printed as decoration on four PRE-PURCHASE screens.**
   Parked, not fixed, and listed here with line numbers because it is one
   string repeated in four places and should be resolved in one pass:

   | File | Line | Context |
   |---|---|---|
   | `app/login/page.tsx` | 93 | the teacher sign-in panel |
   | `app/demo/page.tsx` | 106 | the fake sidebar in the demo |
   | `app/teacher/inactive/page.tsx` | 26 | the "you're almost in" upsell |
   | `app/teacher/welcome/WelcomeClient.tsx` | 115 | above "Welcome, Founding Teacher!" |

   None of these know what the visitor bought — three of them run **before** any
   purchase exists, and the fourth runs on a page whose whole job is that the
   purchase has not been matched yet. So the badge is naming the top tier at
   someone who may be buying Teacher Core at $20, or nothing at all. It is the
   same defect PR #162 fixed on the sidebar, in the four places that read no
   plan at all rather than reading the wrong one.

   Not urgent: none of it blocks a purchase, and unlike the sidebar case it
   misleads before money changes hands rather than after. `/claim` deliberately
   does **not** repeat it — `ClaimClient` uses a neutral "PURCHASE FOUND" badge,
   because that page serves all four products including the $49 Practice Pass.

4. **When the unlinked-customer alert fires, reconcile the two Stripe customers
   by hand.** Not a task with a fix attached — a standing operational note. See
   the #165 entry above for why it cannot be fixed in the schema. If it starts
   firing often rather than occasionally, the question to reopen is whether
   `profiles` needs a customer-id side table, which is a real schema change and
   not a tidy-up.

5. **Parked, all real, none of them stop someone paying:** the Modules locked
   state, the upgrade page copy and branding, the reveal ruling, the free-tier
   progress bar, and the item 2 curriculum sentence.

### Blocked on Juan

- **Deactivate the two founding LINKS Thursday night. Never archive the PRICES**,
  which two live subscriptions renew against.
- The counselor conversation. Now five questions: the student-facing wording,
  whether teacher notification suppresses disclosure, whether a gentler middle
  tier should exist, whether the alert email should carry the student's text, and
  whether a crisis stop should raise a Sentry issue.
- The crisis screen live check, on the Phase 6 trip. Section 6.1. Expected: the
  resource card, an email to `juan@unpackmath.com`, and a `gumu_sessions` row
  with `status = 'ended_support'`. **No Sentry issue**, which is a correction to
  what was assumed when it was scheduled.

---

## 1. Resolved facts

Everything in this section was unknown or wrong in the first draft. It is now
confirmed. Do not re-derive it.

### 1.1 Where the Payment Links land the buyer

**All EIGHT success URLs point to `https://unpackmath.com/success`, on the
marketing site.** Corrected 2026-08-20: this said six, and section 1.2 on the
very next page says there are eight links, not six. The two founding links land
on `/success` like the rest, and they are the ones warm contacts are actually
buying on, so undercounting them here was the more dangerous half of the error.

**All eight now carry `?checkout_session_id={CHECKOUT_SESSION_ID}`**, set in the
Stripe dashboard and confirmed there on 2026-08-20. That parameter is what makes
`/claim` reachable — see queue item 1 for the marketing-side half that still has
to read it and forward it on.

Consequences, all load-bearing:

- `/teacher/welcome` **never runs on any purchase.** The code that verifies the
  checkout session and calls `activate()` from the browser is dead on every
  live path.
- **The webhook is the only thing that activates anyone today.**
- No student buyer is currently promoted to teacher by the welcome page, because
  the welcome page never executes. The other two promotion paths in section 3.2
  are still live.

### 1.2 Eight live Payment Links exist, not six

The six public links, plus two founding teacher links that are **retained on
purpose**. Listed by URL suffix, because the `plink_` IDs are not yet resolved
(see 1.6). The suffixes are sequential, which is how the extra pair was found:

```
...7AI00, ...7AI01   test mode, returned by the test key
...7AI02, ...7AI03   LIVE, founding teacher tier, see 1.3
...7AI04 to ...7AI09 LIVE, the six public products
```

| Product | Price | URL suffix |
|---|---|---|
| Practice Pass | $49 one time | `eVqaEXdby0fa7XXgXR7AI04` |
| Full Course | $89 one time | `3cI4gz5J6aTOeml7nh7AI05` |
| Teacher Core | $20 monthly | `5kQaEX5J6e603HH4b57AI06` |
| Teacher Core | $200 annual | `00w5kD5J6bXSa657nh7AI07` |
| Teacher Pro | $30 monthly | `eVq9ATgnK0fa2DDbDx7AI08` |
| Teacher Pro | $300 annual | `fZudR96Nafa4fqpbDx7AI09` |
| **Founding teacher** | **$10 monthly** | `9B614ndby1je9210YT7AI02` |
| **Founding teacher** | **$100 annual** | `fZu6oH8Vi3rm921cHB7AI03` |

**Never hardcode any of these in the marketing repo.** That repo holds no Stripe
URLs or price IDs and that invariant must hold.

**The two founding links must never be referenced by any new code path.** They
exist only to serve warm contacts until the tier closes and to keep existing
subscriptions renewing.

### 1.3 The founding tier, and the backdoor in /upgrade

`app/upgrade/route.ts:5-6` hardcodes the two founding links. They are the
**founding teacher rates, $10 monthly and $100 annual**, not Teacher Core as the
first draft of this document guessed.

**Founding teachers are grandfathered for life.** The distinction that matters
operationally:

- Deactivating the **links** stops new purchases. This is what Juan is doing,
  after Friday.
- Archiving the **prices** would break existing subscriptions. Two live
  subscriptions renew off these prices. **Never archive them.**

Both links stay ACTIVE until Friday, because warm contacts can still buy the
founding tier. Juan is sending those `buy.stripe.com` URLs directly rather than
routing them through `/upgrade`.

**The real finding: `/upgrade` is a working, unadvertised backdoor to a closed
tier.** `?plan=monthly` and `?plan=annual` route straight to the founding links
and charge $10. The founding tier is closed and removed from every public
surface, and this route still sells it.

**Phase 5 must treat `monthly` and `annual` as unrecognised slugs like any
other.** Do not preserve them, do not special case them, do not map them to the
founding links. Nothing in the app should reference those two links again.

### 1.4 Webhook endpoint

Live-mode endpoint registered and Active: `unpackmath-webhook-production` at
`https://app.unpackmath.com/api/stripe/webhook`, 4 events, 0% errors.

### 1.5 Vercel environment

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are both **live** and set on
**Production only**. Neither is set on Preview.

Consequence: `getStripe()` throws on any Preview deployment, so no Stripe path
works there at all. Phase 6 must run against production. See section 6.

`.env.local` holds `sk_test_`, which is why the six live links cannot be
resolved locally.

### 1.6 profiles grants and policies

`anon` and `authenticated` hold **SELECT only**. One policy, "users can read own
profile", `polcmd = r`. All writes are `service_role`.

A client cannot self-grant an entitlement column. New columns inherit this
posture. Phase 2 must still confirm no new column leaks through a view or RPC.

### 1.7 qualified_sessions

`security_invoker = true`, confirmed. The view runs with the caller's
permissions, so an **empty result may be a permissions artefact rather than
absence of data**. Same lesson as `questions_public` in the June session. Not
this session's work, recorded so nobody re-learns it.

---

## 2. The bug, and why it is not the priority

`app/upgrade/route.ts` (38 lines, GET Route Handler, commit `b29553f`) accepts
exactly two plan strings:

```
function isPlan(value: string | null): value is Plan {
  return value === "monthly" || value === "annual";
}
```

The marketing site sends six entirely different slugs:

```
practice-pass  full-course  teacher-monthly
teacher-annual  teacher-pro-monthly  teacher-pro-annual
```

Zero match. The guard at `app/upgrade/route.ts:19-21` fires and redirects to
`https://unpackmath.com/pricing`. That check runs **before** the auth check at
line 24, so signed in and signed out users behave identically and nobody reaches
Stripe from any of the six URLs.

That redirect is the only external redirect in the entire codebase.

**Do not fix this first.** A working funnel today would take real money and
deliver either nothing or the wrong thing.

---

## 3. Phase 1 findings

### 3.1 What already exists

An earlier planning session assumed there was no Stripe integration here. That
was wrong.

| File | What it does |
|---|---|
| `app/lib/stripe.ts` | Server only `getStripe()`, reads `STRIPE_SECRET_KEY`, no pinned API version |
| `app/api/stripe/webhook/route.ts` | 164 lines, real signature verification. Four events. Three step buyer resolution: `client_reference_id`, then `stripe_customer_id`, then customer email. Returns 500 on handler error so Stripe retries. |
| `app/lib/stripe-activation.ts` | `activate()` / `deactivate()` / `findUserIdByEmail()`, flips `subscription_status` |
| `app/teacher/welcome/page.tsx` | Post checkout landing. **Dead on every live path, see 1.1.** |
| `middleware.ts` | Supabase token refresh only, stamps `x-pathname`. No gating. |

`profiles` has ten columns:

```
id (uuid PK), role, subscription_status, created_at, updated_at,
stripe_customer_id, is_founder, is_founding_teacher, email, teacher_tour_done
```

`is_founding_teacher` is `false` on all 32 rows. It is dead. Separate cleanup.

### 3.2 Three paths promote a buyer to teacher

None of them checks what was purchased.

1. `app/upgrade/route.ts:28` hardcodes `role=teacher` on the login redirect for
   **every** plan. `app/auth/callback/route.ts:62` acts on it. This fires
   **before payment**. Currently harmless because both accepted slugs are
   teacher tier. Becomes live the moment Phase 5 accepts `practice-pass`.
2. `app/teacher/welcome/WelcomeClient.tsx:57` sets the same param. Dead, per 1.1.
3. `app/teacher/welcome/page.tsx:106` runs
   `update({ role: "teacher" })` unconditionally. Dead, per 1.1.

Path 1 is live and must be fixed in Phase 5.

Separately, the webhook grants `subscription_status='active'` regardless of
product, and the teacher gate reads only role plus that flag. So a student
product purchase that ever reaches a role promotion yields a full teacher
dashboard, including join code generation and roster access over other people's
students. That is the child safety exposure in section 7.

### 3.3 What the webhook writes and discards

Every handler writes only `subscription_status` and `stripe_customer_id`.

| Event | Writes | Discards |
|---|---|---|
| `checkout.session.completed` | `active`; `stripe_customer_id` if null | **`payment_link`**, `mode`, `amount_total`, `currency`, `livemode`, `subscription`, `metadata` |
| `customer.subscription.updated` | `active` or `inactive` by status | **`items.data[].price.id`**, **`current_period_end`** |
| `customer.subscription.deleted` | `inactive` | price id, `ended_at` |
| `invoice.payment_failed` | `inactive` | everything else |

**Price and product ID are not available in the webhook payload.**
`line_items?: ApiList<LineItem>` (types line 182) is populated only on an
explicit retrieve with expand, which webhooks cannot do.

**`payment_link` is available and is discarded.** Type line 219,
`payment_link: string | PaymentLink | null`, present on every session.
`route.ts:98` computes it and references it only inside the failure branch at
line 101. On the success path it is dead.

With six distinct links and no price IDs anywhere, **the payment link ID is
already a complete product discriminator, in the payload, needing no extra API
call.**

Also free and discarded: `mode` separates `payment` (the two student products)
from `subscription` (the four teacher tiers); `livemode` would let the handler
assert key and mode agreement instead of failing silently.

Two gaps:

- `incomplete` and `paused` match neither branch at lines 116 to 123, so no
  write happens. A paused subscription keeps access indefinitely.
- `invoice.payment_failed` deactivates on the **first** failure. Stripe retries
  for days. A card that fails once and succeeds on retry loses access in
  between.
- No event ID deduplication. Harmless while `activate()` is idempotent, not
  harmless once an expiry is written.

### 3.4 No student facing entitlement gate exists

Complete inventory of every read of `subscription_status`:

| Location | Gate? |
|---|---|
| `app/lib/auth.ts:45-65` `requireTeacher()` | Yes, teacher only |
| `app/teacher/page.tsx:29`, `app/teacher/settings/page.tsx:36` | Yes, teacher only |
| `app/dashboard/layout.tsx:17-39` | Gates on signed in and role only. **No payment check.** |
| `app/components/StudentNav.tsx:163` | No, cosmetic badge |
| `app/components/Header.tsx:68-73` | No, cosmetic nav |
| `topic-data.ts:112` | Teacher answer key privilege, not a student gate |

**The `/course` tree has no auth gate at all.** `app/course/layout.tsx` is a bare
twelve line passthrough div with no imports. `topic-data.ts` reads a session only
to build `signInHref`. Every topic is readable by an anonymous visitor through
`curriculum_topics_public`.

So Full Course at $89 unlocks nothing, because the curriculum it would unlock is
already free and public. **Phase 4 is not wiring a check into an existing gate,
it is introducing gating to a tree that has never had any**, including the GUMU
surface and the anonymous funnel that may depend on that openness.

Note: `GumuGate.tsx` is **not** an entitlement gate. It hides the answer key
while a GUMU conversation is live. The name is misleading for Phase 4 purposes.

### 3.5 The safeNext round trip holds for all six slugs

Verified empirically against the real `app/lib/next-param.ts` under Node, not
reasoned about. All six pass `isSafeNext`. Simulated round trip for
`teacher-monthly`:

```
1. /upgrade 307 -> /login?role=teacher&next=%2Fupgrade%3Fplan%3Dteacher-monthly
2. login redirectTo = /auth/callback?next=%2Fupgrade%3Fplan%3Dteacher-monthly&role=teacher
3. Supabase returns  = ...&code=abc123
4. callback next     = "/upgrade?plan=teacher-monthly"
5. final redirect    = /upgrade?plan=teacher-monthly
6. plan reads back as "teacher-monthly"
```

It holds because `searchParams.set` percent encodes `?` and `=`, `safeNext`
inspects only the first two characters plus control characters and never parses
a query string, and `auth/callback:71` concatenates `${origin}${next}`.

Not yet verified against real Supabase, which must append `?code=` with `&` to a
`redirectTo` that already carries a query. One live click in Phase 5 settles it.

---

## 4. Current data shape

32 profiles. Confirmed against production:

| role | subscription_status | count |
|---|---|---|
| student | inactive | 22 |
| teacher | active | 7 |
| teacher | inactive | 3 |

**No student has ever had `active` status.** There is no student entitlement to
migrate.

Of the 7 active teachers: 6 are `is_founder`, 5 have a `stripe_customer_id`, 2
have none at all (comped, no Stripe record). One is a non founder with a
customer ID, the only unambiguous real payer.

5 classes, 3 enrolments. `class_enrollments` is
`(id, class_id, student_id, enrolled_at, enrolled_via, status)` with
`status='active'` and `enrolled_via` in `('join_code','teacher_invite')`.

---

## 4.1 Capability map

Settled. Phase 4 implements exactly this and must not invent a fifth row.

| Plan | Unlocks |
|---|---|
| `practice-pass` | Practice only, including the worksheet generator when it ships. **No GUMU, no curriculum.** |
| `full-course` | **Everything in Practice Pass, plus** curriculum and GUMU. A strict superset. |
| `teacher-core` | Teacher dashboard, regular worksheet access |
| `teacher-pro` | Teacher dashboard, **unlimited** worksheets |

Two corrections to earlier framing:

- The **worksheet generator belongs to Practice Pass**, on the student side.
- **Teacher Pro's differentiator is unlimited worksheets versus regular access**,
  not worksheets versus none. Core and Pro differ by quota, not by feature
  presence.

**Full Course being a superset is a live public commitment, not an assumption.**
The Full Course column on unpackmath.com/pricing reads "EVERYTHING IN PRACTICE
PASS, PLUS". Phase 4 may not implement it as a disjoint set.

**Terms run from the payment date.** `access_until = paid_at` plus 6 months for
Practice Pass, plus 12 months for Full Course. Not a fixed course start, so two
buyers on different days get different end dates.

**Founding teachers hold the `teacher-core` capability set.** The founding rate
is a **price**, not a tier; `is_founder` and `stripe_payment_link_id` record it.
No Teacher Pro has ever sold, so the backfill's blanket `teacher-core` is correct
for every existing active teacher.

Nothing in the capability map is open.

## 5. Phases

Stop and report at the end of each phase. Do not proceed without explicit
approval.

- **Phase 1, verify.** Complete. Findings in section 3.
- **Phase 2, data model.** Design first, report, build on approval. Juan runs
  all DDL manually in the Supabase SQL editor. RLS posture per 1.6 must hold.
- **Phase 3, activation writes the product.** Extend `activate()` and the
  webhook to record what was bought and set the expiry. Preserve the three step
  buyer resolution.
- **Phase 4, student entitlement gate.** GUMU has **two** entitlement paths:
  direct Full Course purchase, and teacher assigned access through a teacher's
  subscription. A student in a teacher's class bought nothing and must still get
  in.
- **Phase 5, the slug fix.** Map all six public slugs, preserve the signed out
  login round trip for all six, make the `role=teacher` hardcode at line 28
  conditional on the product, and **drop `monthly` and `annual` entirely** so
  the founding backdoor in 1.3 closes with the same change.
- **Phase 6, end to end with real money.** See section 6.

---

## 6. Phase 6 environment decision

Preview has neither Stripe variable, so `getStripe()` throws there and no Stripe
path runs at all. The choice is not production versus preview-with-test-keys
until someone provisions preview.

**Recommendation: test against production with a real card, refunded after.**

Reason: the six live Payment Links are the artefact under test. Test mode links
are different objects with different `plink_` IDs, so a preview run would
exercise a different product mapping than production uses, and that mapping is
the single thing most likely to be wrong. The webhook endpoint under test is
also the live one.

Mitigations: use a throwaway Google account, refund immediately in Stripe, and
reset the resulting `profiles` row by hand. Do at least one student product and
one teacher product, because they exercise different code paths.

### 6.1 One extra check while already clicking through live

**The crisis screen has never run in production.** It was proved locally in both
directions and merged in #153, and the deploy is confirmed live by behaviour: the
course gate enforces on `app.unpackmath.com`, `/dashboard/upgrade` exists, and 24
anonymous POSTs to `/api/gumu/session` returned 401 with zero 429s, which is the
post-merge auth-before-rate-limit ordering. But none of that executes the
screening branch itself, because it needs an authenticated session.

So, signed in on production, after the purchases: open GUMU on any reachable
topic, get an item wrong, and type a disclosure phrase.

**Expected, and it is less than was assumed when this was scheduled:**

- the session ends, the panel is replaced by the resource card with 988 and the
  Crisis Text Line, both tappable
- a real alert email arrives at `juan@unpackmath.com`
- `gumu_sessions` gains a row with `status = 'ended_support'` and
  `resolution` null
- **NO Sentry issue.** Checked rather than assumed: there is no `Sentry` call
  anywhere in `crisis.ts`, `crisis-screen.ts`, or the crisis branch of the GUMU
  route. The Sentry captures added in that merge belong to the Stripe no-match
  branch and the course gate's unreadable-header path, not to this. Email and the
  session row are the whole of the signal.

Worth a decision separately: whether a crisis stop should raise a Sentry issue at
all. The argument for is that email is a single point of failure and Sentry
groups and persists. The argument against is that it puts a minor's distress
event into an error tracker with `sendDefaultPii: true`. Not decided here.

Also worth pairing with it, since it costs one more message: type an obvious
hyperbole ("this problem is killing me") and confirm it does NOT fire. Proving
the guard, not just the branch, is the standard the rest of this work has used.

---

## 7. Carried over, not in scope

**The orphaned checkout route in the marketing repo.** `app/api/stripe/checkout`
in `unpackmath-home`, live dynamic route, pre-existing on `main` at `d9ce1aa`,
orphaned by the redesign. Nothing calls it. It accepts a `priceId` from the
request body and creates a session. No secrets committed, all env sourced, so
the repo invariant holds literally. But six live prices now exist and an open
endpoint accepting an arbitrary `priceId` is only harmless while none do.
Recommended: delete it. Alternative: server side allowlist. Also confirm whether
its `success_url` is hardcoded or caller supplied, because caller supplied is an
open redirect.

**Teacher verification.** Nothing prevents a student creating a teacher account.
The revenue arbitrage is small. The real risk is a student who creates a teacher
account, shares the join code, and holds a dashboard of other minors' names,
scores, and misconception data.

**PARTIALLY CLOSED, 2026-08-19, commit `b58d9d4`.** The half of this that was
already live is fixed. `requireTeacher` checked role plus an active payment of
ANY kind, so a student row promoted to `role='teacher'` by one of the three
promotion paths in section 3.2, while holding an active STUDENT purchase, passed
the teacher gate and received the full dashboard: join code generation and roster
access over other people's students. Moving that reader onto the plan closed it,
because the plan now has to be a teacher plan. It closed as a consequence of
moving a reader rather than as a feature, which is worth noting: the exposure was
a side effect of `subscription_status` conflating "paid" with "paid for this".

What is NOT closed is the original item: nothing still prevents someone paying
for Teacher Core and creating a teacher account they should not have. Verify at
the capability boundary, as below.

Recommended shape: verify at the capability boundary, not the account boundary.
Anyone can sign up and pay. Generating a join code or enrolling a student
requires verification. Manual review is appropriate at this scale. Google
Classroom OAuth becomes the primary signal when it lands, because Google
confirming course ownership is verification by someone else's identity system.
School email domain checks do **not** work here, since many Texas districts
share a domain between students and staff.

Open sub question: what does a paid but unverified teacher see? They have paid
and cannot use the product yet. That needs a real holding state, not the
existing inactive subscription page, which says something different.

**Scope collision, needs a decision.** Section 3.2 path 1 means Phase 5 routes
student purchases through code that promotes to teacher. Either Phase 3 and 5
add product conditional role handling, or teacher verification comes into scope.
Both cannot be left. Recommended: the former, which is small and already inside
those phases. Verification stays deferred.

**The twelve dark Playwright probes, pending an authenticated-harness decision.**
Phase 4 gated `/course`, and fourteen scripts navigate to a `/course` URL while
none of them can authenticate. `verify_auth_gate` was repaired (its course route
moved from control to subject) and `verify_gumu_tier` is confirmed dead rather
than repaired: its premise is a signed-out visitor being graded inline, which is
now correctly a 403, so it tests something the product no longer does. The other
twelve lose their subject and cannot be repaired without an authenticated
harness, which does not exist.

**Do not repair any of them until that decision is made**, and do not trust a
repaired probe without showing it fail first. The authenticated branch has had no
automated probe since Phase 1 recorded it as a structural gap; Phase 4 is where
it starts to bite.

**A fault-proof guard had been correctly refusing to run since #135, and nobody
read its exit code.** This is the most valuable finding of the session and it is
recorded here rather than only in a commit message, because the failure was in
the VERIFICATION rather than in the product.

`scripts/verify_auth_gate.mjs --prove` injects a fault, asserts the suite goes
red, restores, and asserts it goes green. Its fault target was a multi-line
literal containing
`redirect('/login?next=' + encodeURIComponent('/dashboard'))`. #135 changed that
to `loginHref(safeNext(requested, DEFAULT_NEXT))`, the literal stopped matching,
and the guard began exiting 2 with "FAULT TARGET ABSENT". Confirmed stale at HEAD
before any Phase 4 change.

The guard did exactly the right thing: it refused to inject a no-op and report
success. But the plain suite kept reporting green, so for as long as that drift
lasted **nothing had demonstrated that the dashboard gate check could fail.** A
check nobody has seen fail is a check nobody has verified.

Two fixes, both general rather than specific to this script. The fault now
targets ONE short stable line, `const profile = await getProfile();`, replaced
with a stand-in profile so the page genuinely serves to an anonymous visitor: a
multi-line block containing a call expression was always going to drift, a single
declaration is much less likely to. And both gates, dashboard and course, are
faulted in a single run, so a partial proof cannot pass while the other half
rots.

**GUMU crisis escalation.** From the marketing session's legal review, and the
highest priority item on that list. A Socratic tutor for teenagers will
eventually receive a disclosure of distress in the middle of a math problem.
There must be a decided, written behaviour (stop tutoring, surface crisis
resources, flag to the teacher) before GUMU talks to a student who is not Juan.
GUMU was expected to ship the evening of August 18, so this is no longer
hypothetical.

**Update, August 19.** This now sits AHEAD of Phase 4 by decision. GUMU is
merged to main and live. Investigation confirmed there is no crisis handling of
any kind: the only prompt instruction covering a student in difficulty tells the
model to keep tutoring (`gumu.ts:22`), nothing scans student input, the message
is persisted before the model sees it, and none of the four session statuses can
represent a conversation that stopped being about math. Designed in
`gumu-crisis-screen-design.md`, not built. Blocked on school counselor input.

**The GUMU rate-limit threshold, once the crisis screen is settled.** Commit
`3fba12d` moved the auth check above the limiter and rekeyed it from IP to the
signed-in user id, which fixes the shared-NAT case where one classroom shared a
single budget. It deliberately did NOT retune the number. 20 per 5 minutes was
sized for an IP that could be a whole classroom; as a per-user number it is
loose, roughly four complete conversations in five minutes, where one
conversation is at most a start, three messages and a reveal. Revisit it in its
own change. Sequenced after the crisis screen because that screen adds a second
paid model call per student message, which changes what the right number is.

---

## 8. Constraints

- Inline React `style={{}}`, relative imports, no Tailwind, no `@/` aliases
- All math in `$...$` LaTeX, display math as `$$...$$` on its own line
- No em dashes anywhere
- Juan runs all DDL manually in the Supabase SQL editor and reviews every
  statement
- RLS enforced. Writes go through the admin client from server side route
  handlers only
- Never trust client side subscription status
- Every Stripe webhook endpoint verifies the `stripe-signature` header first
- Playwright, if used, runs against `next build && next start`, never `next dev`
- The authenticated branch has no automated probe coverage. Known structural
  gap, not implied coverage
