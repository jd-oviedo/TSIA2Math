# Phase 5, the slug fix. Design report.

*August 19, 2026. Branch `feat/entitlement-columns`.*

> ## STATUS: DESIGN. NOT BUILT.
>
> No code written. `/upgrade` still accepts only `monthly` and `annual`, both of
> which still route to the founding links, and the `role=teacher` hardcode at
> `app/upgrade/route.ts:28` is still unconditional. Three things need a ruling
> before anything is built; they are in section 7.

---

## 0. What this phase is, and the one thing that makes it urgent

`/upgrade` accepts two slugs. The marketing site sends six entirely different
ones. Zero match, so nobody reaches Stripe from any of the six pricing buttons,
and the guard at `route.ts:19-21` bounces every one of them to
`unpackmath.com/pricing`.

The two it does accept, `monthly` and `annual`, route to the **founding teacher
links at $10 and $100**, a tier that is closed and removed from every public
surface. So the only working path through `/upgrade` today sells a closed tier at
a fifth of list price. Dropping the slugs closes the backdoor with the same
change that opens the funnel.

**The urgency is not the funnel.** It is that fixing the funnel makes a dormant
defect live. `route.ts:28` hardcodes `role=teacher` on the sign-in redirect for
every plan, before payment. That is harmless today only because both accepted
slugs are teacher tier. Accept `practice-pass` and a student buyer is handed a
teacher account.

---

## 1. The slug list, confirmed rather than inferred

Confirmed by Juan from `lib/plans.ts` in `unpackmath-home`, 2026-08-19:

| Slug | Product | Plan | Term |
|---|---|---|---|
| `practice-pass` | Practice Pass $49 | `practice-pass` | one-time, 6 months |
| `full-course` | Full Course $89 | `full-course` | one-time, 12 months |
| `teacher-monthly` | Teacher Core $20/mo | `teacher-core` | monthly |
| `teacher-annual` | Teacher Core $200/yr | `teacher-core` | annual |
| `teacher-pro-monthly` | Teacher Pro $30/mo | `teacher-pro` | monthly |
| `teacher-pro-annual` | Teacher Pro $300/yr | `teacher-pro` | annual |

`monthly` and `annual` are **dropped, not mapped**. They become unrecognised
slugs like any other and fall through to the `/pricing` redirect.

---

## 2. One table, because there are two identifiers per product

The webhook identifies a purchase by `plink_` id. `/upgrade` redirects to a
`buy.stripe.com` URL. **Those are different, independent identifiers for the same
eight objects**, and nothing derives one from the other.

That is a drift hazard: two maps of the same eight products, and a mistake in
either sends a buyer to the wrong thing or records the wrong plan. The same shape
as the "one authoritative source" problem the curriculum unit map already has.

**So there is one table.** `PRODUCTS_BY_PAYMENT_LINK` in `app/lib/products.ts`
already exists, is keyed on `plink_` id, and already carries plan, term, mode and
expected amount. It gains two fields:

```ts
export type Product = {
  plan: Plan;
  term: PlanTerm;
  mode: "payment" | "subscription";
  amountTotal: number;
  months?: number;
  label: string;
  /** Where /upgrade sends the buyer. */
  url: string;
  /** The marketing slug that reaches it. ABSENT on the two founding links,
   *  which is what makes them unsellable by construction rather than by a
   *  filter someone could remove. */
  slug?: string;
};
```

and one derived index:

```ts
export function productForSlug(slug: string | null): Product | null;
```

built by walking the table once. **The two founding entries carry no `slug`, so
no slug can resolve to them.** That is stronger than an allowlist: there is no
line to delete that would make them sellable again.

`products.ts` stays runtime-pure, so all of this remains loadable by
`node --test` and faultable.

### 2.1 The eight rows, and the half I still need confirmed

Juan confirmed the eight `plink_` ids on 2026-08-19. He did **not** confirm the
eight `buy.stripe.com` URLs, and those are the half `/upgrade` actually redirects
to. The values below are transcribed from `checkout-entitlement-handoff.md`
section 1.2 and corroborated for the two founding links, which match
`app/upgrade/route.ts:5-6` exactly. The other six are unverified against live
Stripe.

| Plan / term | plink id | URL suffix on `buy.stripe.com/` |
|---|---|---|
| founding, monthly | `plink_1Ts6onF8f8aZDGVA7rSbLxdB` | `9B614ndby1je9210YT7AI02` |
| founding, annual | `plink_1Ts6pxF8f8aZDGVAGuq8UNof` | `fZu6oH8Vi3rm921cHB7AI03` |
| practice-pass | `plink_1U5tejF8f8aZDGVAKbnefl6Z` | `eVqaEXdby0fa7XXgXR7AI04` |
| full-course | `plink_1U5tgXF8f8aZDGVANGvtkoMF` | `3cI4gz5J6aTOeml7nh7AI05` |
| teacher-core, monthly | `plink_1U5tuZF8f8aZDGVARYelic7d` | `5kQaEX5J6e603HH4b57AI06` |
| teacher-core, annual | `plink_1U5txdF8f8aZDGVAIEKoo1EF` | `00w5kD5J6bXSa657nh7AI07` |
| teacher-pro, monthly | `plink_1U5u2HF8f8aZDGVAtPJtpWiE` | `eVq9ATgnK0fa2DDbDx7AI08` |
| teacher-pro, annual | `plink_1U5u3PF8f8aZDGVASKoXV5Fb` | `fZudR96Nafa4fqpbDx7AI09` |

**Pairing a plink id with the wrong URL is silent.** The buyer reaches a real
checkout, pays a real amount, and the webhook records the plan the LINK says, not
the one the button promised. Nothing in the system would flag it. So this is
question 1 in section 7.

An alternative that removes the second identifier entirely is in section 6.

---

## 3. The rewritten `/upgrade`

```
GET /upgrade?plan=<slug>

  1  product = productForSlug(plan)          monthly and annual now yield null
  2  if (!product) -> https://unpackmath.com/pricing
  3  user = getUser()
  4  if (!user) -> loginHref(`/upgrade?plan=${slug}`, roleFor(product))
  5  -> product.url + client_reference_id=user.id + prefilled_email
```

Three changes of substance.

**The role is derived, not hardcoded.** `roleFor` reuses the capability map
rather than adding a second table:

```ts
const role = planGrants(product.plan, "teacher-dashboard") ? "teacher" : "student";
```

`practice-pass` and `full-course` yield `student`, and `/login` already supports
`role=student`: `LoginPageBody` renders the OAuth screen for `teacher` **or**
`student`, and only `role=teacher` reaches `auth/callback:64` where the promotion
happens. So a student buyer gets a clean sign-in and no promotion, which is
requirement 2.

**It uses `loginHref` instead of building the param by hand.** Line 29 currently
concatenates `next` itself, bypassing `safeNext`. The value is a safe literal
today, so this is tidiness rather than a fix, but it removes a second way of
writing something the repo has deliberately centralised.

**`client_reference_id` is preserved.** It is the webhook's first and strongest
buyer resolution step, and it is the reason a purchase through `/upgrade` never
has to fall back to matching on email.

---

## 4. The hole requirement 2 does not reach, and where role should actually be set

Requirement 2 is about line 28, which is inside `if (!user)`. **A signed-in buyer
never passes through `/login` at all, so no role is ever set for them.**

That is not hypothetical and it is not new:

- A signed-in visitor who buys a teacher plan today goes straight from
  `/upgrade` to Stripe. They pay, `writeEntitlement` records
  `plan = teacher-core`, and their role stays `student`. `requireTeacher` fails
  on `p.role !== 'teacher'` before it ever looks at the plan. **A paying teacher,
  locked out of the dashboard, with nothing in the data to explain it.**
- Worse, the path Juan is using through Friday makes this the normal case rather
  than the edge one: warm contacts get a `buy.stripe.com` URL **directly**, which
  never touches `/upgrade` or `/login`, so no role is set for any of them.

Grepping every writer of `role: "teacher"` in the codebase returns exactly two:
`auth/callback/route.ts:66`, which needs the sign-in path, and
`teacher/welcome/page.tsx:137`, which is dead on every live path because all six
success URLs go to the marketing site.

**So the only mechanism that promotes a teacher requires them to sign in through
a link they may never use.**

### 4.1 Recommendation: promote in the webhook

Requirement 3 states the principle this follows from: the webhook is the only
thing that activates anyone. Role should be set from the same event, for the same
reason.

In the `checkout.session.completed` branch, after `writeEntitlement` returns:

```ts
const outcome = await writeEntitlement(admin, profileId, write, eventCreatedMs, SOURCE);
if (outcome === "written" && planGrants(write.plan, "teacher-dashboard")) {
  // promote to role = 'teacher'
}
```

Four properties, each deliberate:

- **Gated on `"written"`, not fire-and-forget.** `writeEntitlement` already
  returns `"written" | "stale" | "refused"` and every caller currently discards
  it. A stale event is an out-of-order redelivery and must not re-promote.
- **Promotes only, never demotes.** A cancelled teacher keeps `role = 'teacher'`
  and is denied by the plan check, which is correct: role is identity and the
  entitlement is what lapsed. Demoting would be destructive and would also strip
  the course tree's second door from someone mid-renewal.
- **Covers every purchase path**, including the direct `buy.stripe.com` links,
  which is the case that is live right now.
- **Only after payment.** Nothing is promoted on intent.

This does not remove the promotion in `auth/callback`. That one is an identity
signal, "I am signing up as a teacher", and it is legitimate before payment: it
is what gives an unpaid teacher the `/teacher/inactive` holding state rather than
a bounce to `/dashboard`. With `/upgrade` no longer sending `role=teacher` for
student products, it stops firing on the wrong people.

---

## 5. What requirement 3 costs, stated rather than assumed

All six success URLs point at `unpackmath.com/success`. The buyer leaves the app
at checkout and lands on the marketing site, and **the app never sees them come
back**.

Consequences Phase 5 must design around rather than paper over:

- **There is no post-purchase surface in this repo.** `/teacher/welcome` exists
  and is dead. Phase 5 must not add anything that assumes it runs.
- **Activation is asynchronous and the buyer can outrun it.** They pay, land on
  the marketing site, click through to `app.unpackmath.com`, and may arrive
  before Stripe has delivered the webhook. With Phase 4's gate now live, a Full
  Course buyer in that window opens a topic and is shown
  `/dashboard/upgrade`: **the page they just paid to get past.**

That race did not exist before Phase 4, because nothing was gated. It is created
by the combination of a marketing-site success URL and a real gate, and it is
worth naming now even though the fix is probably not in this repo. Options, none
of them chosen here: the marketing `/success` page holds the buyer briefly before
linking on; the app shows a "confirming your payment" state instead of the
upgrade page when a recent unconfirmed checkout exists; or the success URLs move
into the app, which is a Stripe dashboard change across six links.

---

## 6. The alternative that would delete the second identifier

`stripe.paymentLinks.retrieve(id)` returns the link's `url`. So `/upgrade` could
map slug to `plink_` id and resolve the URL from Stripe at request time, leaving
exactly one identifier in the codebase and making section 2.1's confirmation
question disappear.

Rejected for now, and the reasoning is worth recording rather than the
conclusion:

- It puts a live Stripe API call on the path of every checkout click. Stripe
  being slow or down would mean nobody can buy, where today a stale hardcoded URL
  would still work.
- It is cacheable, but a cache of eight rarely-changing URLs is a hardcoded table
  with extra steps and a staleness window.
- The failure it prevents, a mispaired URL, is a one-time transcription risk that
  a confirmed table and a test close permanently.

Worth revisiting if the link set ever becomes dynamic. It is not.

---

## 7. What I need before writing code

1. **Confirm the six `buy.stripe.com` URLs in section 2.1.** You confirmed the
   slugs and the plink ids and explicitly asked me not to infer the rest. These
   are transcribed from the handoff, not read from Stripe, and a mispairing is
   silent: the buyer pays a real amount for the wrong product and the webhook
   records the link's plan, not the button's.
2. **Confirm role promotion moves to the webhook** (section 4.1), promote-only,
   gated on a `"written"` outcome. This is beyond requirement 2 and it is the
   part that fixes the signed-in and direct-link cases, including the path you
   are using through Friday.
3. **Confirm `auth/callback`'s promotion stays** as a pre-payment identity
   signal, rather than being removed in favour of the webhook alone.

---

## 8. Verification plan

### 8.1 Offline, before anything is live

Unit tests on the pure table, faulted:

- every one of the six slugs resolves to a product, and to distinct products
- `monthly` and `annual` resolve to **null**
- **no slug resolves to either founding plink id**, which is the backdoor
  assertion and must be shown failing if a `slug` is added to a founding row
- each slug's product plan matches the tier its name claims, so
  `teacher-pro-annual` cannot quietly point at Teacher Core
- `roleFor` yields `student` for both student products and `teacher` for all four
  teacher rows
- the URL and plink id in each row belong to the same product, asserted against
  `amountTotal`, which is the one cross-check the table already carries

### 8.2 The live click, requirement 4

One click, signed out, which exercises the whole round trip. **Juan runs this.**

```
1  open  https://app.unpackmath.com/upgrade?plan=teacher-monthly   signed out
2  expect a redirect to /login?role=teacher&next=%2Fupgrade%3Fplan%3Dteacher-monthly
3  sign in with Google
4  expect to land on buy.stripe.com showing Teacher Core, $20 per month
```

**What is actually being tested at step 3.** `/login` builds a `redirectTo` that
already carries a query (`?next=...&role=teacher`), and Supabase appends its own
`code` parameter to it. If it appends with `&` the callback reads `next` intact
and step 4 works. If it appends with `?`, or re-encodes, `next` is lost and the
buyer lands on `/dashboard` instead of Stripe. Phase 1 verified this logically
against the real `next-param.ts` under Node; what has never been verified is
Supabase's own behaviour, and it cannot be verified offline.

**Landing on `/dashboard` instead of Stripe is the failure signal**, and it means
the round trip needs the `next` value moved out of the query string rather than
any change to `safeNext`.

Worth doing the same click once with `plan=practice-pass` as the control: it must
redirect to `/login?role=student`, and the profile must NOT become
`role = 'teacher'`. That is requirement 2 observed rather than reasoned about.

---

## 9. Build order

1. `products.ts`: the two new fields, the eight rows, `productForSlug`. Tests
   first, faulted, including the founding-link assertion.
2. `/upgrade` rewritten against it, with the derived role.
3. The webhook role promotion, if section 7 question 2 is confirmed.
4. `npx tsc --noEmit`, lint, the offline suite.
5. The live click in 8.2, by Juan, before anything is called done.

Phase 6 is the end-to-end purchase with a real card, refunded, against
production, because Preview has no Stripe environment.
