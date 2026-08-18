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

## 1. Resolved facts

Everything in this section was unknown or wrong in the first draft. It is now
confirmed. Do not re-derive it.

### 1.1 Where the Payment Links land the buyer

**All six success URLs point to `https://unpackmath.com/success`, on the
marketing site.**

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

**GUMU crisis escalation.** From the marketing session's legal review, and the
highest priority item on that list. A Socratic tutor for teenagers will
eventually receive a disclosure of distress in the middle of a math problem.
There must be a decided, written behaviour (stop tutoring, surface crisis
resources, flag to the teacher) before GUMU talks to a student who is not Juan.
GUMU was expected to ship the evening of August 18, so this is no longer
hypothetical.

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
