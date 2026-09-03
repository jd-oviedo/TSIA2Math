import { NextResponse } from "next/server";
import { createClient } from "../lib/supabase-server";
import { createAdminClient } from "../lib/supabase-admin";
import { planGrants } from "../lib/capabilities";
import { isEntitledWithLegacyFallback } from "../lib/entitlement";
import { resolveCourseAccess } from "../lib/course-access";
import type { Plan } from "../lib/products";
import { loginHref } from "../lib/next-param";

// Turns a marketing slug into a Stripe Payment Link.
//
// THE SLUGS ARE A CONTRACT WITH unpackmath-home, and they were broken on this
// side. lib/plans.ts over there emits exactly the six keys below and says so:
// "These slugs are a contract with app.unpackmath.com. Renaming one here without
// renaming it there silently breaks the funnel." This route accepted only
// `monthly` and `annual`, so all six pricing buttons matched nothing, hit the
// guard below, and bounced the buyer back to /pricing. Nobody could buy from the
// pricing page at all.
//
// The six URLs are transcribed from the Stripe dashboard and confirmed there.
// Pairing a slug with the wrong URL is SILENT: the buyer reaches a real checkout,
// pays a real amount, and the webhook records the plan the LINK says rather than
// the one the button promised. scripts/faultproof_upgrade_slugs.mjs exists
// because nothing else would catch that.
//
// `monthly` and `annual` ARE DELIBERATELY ABSENT. They used to be the only two
// accepted, and both pointed at the founding teacher links at $10 and $100, a
// tier that is closed, removed from every public surface, and grandfathered for
// life. So the only working path through this route sold a closed tier at half
// price to anyone who learned the URL. They are dropped rather than remapped:
// remapping would keep a live URL the marketing site never emits, named after
// nothing in the product, and a future tidy-up might "restore" it. Dropped, they
// are unrecognised like any other bad slug and the backdoor closes as a property
// of this table.
//
// The founding links themselves are untouched and stay reachable as raw
// buy.stripe.com URLs until Friday, and both stay in products.ts so the webhook
// still recognises a founding purchase. Receiving is not selling.
//
// NO CHECKOUT SESSIONS. This redirects to a Payment Link and nothing more. The
// orphaned /api/stripe/checkout in the marketing repo stays orphaned.
//
// THE $5 TRIPWIRE IS THE SEVENTH SLUG, AND THE ONLY ONE WITH A HOLDER GUARD.
// It sells the existing full-course plan for 7 days, and it is the one product
// whose purchase can make a buyer WORSE off: writeEntitlement overwrites
// access_until wholesale, so the shortening guard in stripe-activation.ts
// refuses the write for anyone already holding longer live access and logs the
// $5 as "refund or comp by hand". That guard is correct and stays. This route is
// where the same buyer is turned away BEFORE paying, so the refund path is the
// backstop rather than the ordinary outcome. See tripwireHolderGuard.
//
// The URL below is a placeholder until Juan pastes the real one, and the slug
// is refused while it is. A buy.stripe.com URL cannot be derived from a plink
// id -- the two are independent identifiers for one object -- so the id in
// products.ts cannot supply it. While the placeholder stands, ?plan=tripwire
// falls through to /pricing exactly like an unrecognised slug, so this can
// deploy ahead of the paste with nothing sellable. faultproof_upgrade_slugs.mjs
// asserts that the gate exists and that the placeholder is not a real link.

type Product = {
  /** The live Payment Link, confirmed against the Stripe dashboard. */
  url: string;
  /** What it sells, in the same vocabulary as products.ts, so the sign-in role
   *  below is derived from the capability map rather than typed out per row. */
  plan: Plan;
};

const PRODUCTS = {
  "practice-pass": {
    url: "https://buy.stripe.com/eVqaEXdby0fa7XXgXR7AI04",
    plan: "practice-pass",
  },
  "full-course": {
    url: "https://buy.stripe.com/3cI4gz5J6aTOeml7nh7AI05",
    plan: "full-course",
  },
  "teacher-monthly": {
    url: "https://buy.stripe.com/5kQaEX5J6e603HH4b57AI06",
    plan: "teacher-core",
  },
  "teacher-annual": {
    url: "https://buy.stripe.com/00w5kD5J6bXSa657nh7AI07",
    plan: "teacher-core",
  },
  "teacher-pro-monthly": {
    url: "https://buy.stripe.com/eVq9ATgnK0fa2DDbDx7AI08",
    plan: "teacher-pro",
  },
  "teacher-pro-annual": {
    url: "https://buy.stripe.com/fZudR96Nafa4fqpbDx7AI09",
    plan: "teacher-pro",
  },
  // Tripwire Pass, $5 for 7 days of full-course. Same plan as full-course above
  // on purpose: it is a PRICE, not a tier (products.ts explains at length).
  // JUAN PASTES THE REAL buy.stripe.com URL HERE, ON THIS LINE, AND NOWHERE ELSE.
  "tripwire": {
    url: "https://buy.stripe.com/PASTE_THE_TRIPWIRE_URL_HERE",
    plan: "full-course",
  },
} as const satisfies Record<string, Product>;

// A slug whose URL still reads as unpasted is not sellable. Matched on the
// marker rather than on the tripwire slug by name, so any future row added with
// a placeholder is refused the same way instead of forwarding a buyer to a URL
// Stripe has never heard of.
const UNPASTED_MARKER = "PASTE_THE_";

function isSellable(product: Product): boolean {
  return !product.url.includes(UNPASTED_MARKER);
}

const TRIPWIRE_SLUG = "tripwire";

// Columns the holder guard reads, spelled once. Every column the shared
// predicate needs is here; a narrower select would deny nobody and admit the
// wrong people (see auth.ts on why the link id is required, not optional).
const HOLDER_COLUMNS =
  "plan, plan_status, access_until, stripe_payment_link_id, subscription_status, role";

type HolderRow = {
  plan: string | null;
  plan_status: string | null;
  access_until: string | null;
  stripe_payment_link_id: string | null;
  subscription_status: string | null;
  role: string | null;
};

/**
 * Where an already-covered visitor is sent instead of the tripwire checkout,
 * or null when they may buy.
 *
 * PLAN-AGNOSTIC ON PURPOSE. The question is "do they hold ANY live access", not
 * "does their plan grant curriculum". profileGrants(profile, "curriculum") would
 * wave a live Practice Pass holder through -- that plan holds only worksheets --
 * and the webhook would then refuse the $5 write on duration and log a refund.
 * So the first half of profileGrants (planGrants) is deliberately absent here
 * and only its second half, the shared entitlement predicate, is consulted.
 * planGrants appears once below, to pick a DESTINATION for a teacher, never to
 * decide whether they are turned away.
 *
 * THREE DOORS, IN THE ORDER course-access.ts EVALUATES THEM:
 *
 *   1. own row live         full-course, practice-pass, a teacher plan, a
 *                           still-running tripwire, or a legacy row with no
 *                           plan at all. All refused by the shortening guard
 *                           on duration; all turned away here first.
 *   2. entitled teacher     the same row, so it is the same test; only the
 *                           destination differs.
 *   3. an entitled teacher's class   the student's own row holds nothing, so
 *                           the webhook would NOT refuse: the $5 would land and
 *                           grant a week of what the class already gives. Not
 *                           a refund case, but still a pointless purchase, so
 *                           they are told rather than sold to.
 *
 * A LAPSED TRIPWIRE IS LET THROUGH, consistent with the shortening guard.
 * accessGraceMs gives that link zero grace, so the moment access_until passes
 * the shared predicate says no and the buyer may pay again. A lapsed $49 or $89
 * holder is held for the three days of grace their pass carries and is let
 * through after; the webhook would already accept them inside that window, so
 * this route is the stricter of the two, which is the safe direction.
 *
 * FAIL OPEN ON A READ ERROR, the same call the shortening guard makes. A read
 * that errors tells us nothing about the row, and the webhook guard still
 * stands behind this one. A missing row is the ordinary "nothing held" case.
 */
async function tripwireHolderGuard(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(HOLDER_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      `[upgrade] could not read ${userId} before the tripwire forward, so the holder guard is not applied:`,
      error.message
    );
    return null;
  }

  if (data) {
    const row = data as HolderRow;
    const ownLive = isEntitledWithLegacyFallback(
      row.plan_status,
      row.access_until,
      row.stripe_payment_link_id,
      row.subscription_status,
      "upgrade tripwire guard"
    );
    if (ownLive) {
      // Destination only. The turn-away was decided on the line above.
      const teacher = row.role === "teacher" && planGrants(row.plan, "teacher-dashboard");
      return teacher ? "/teacher" : "/dashboard?upgrade=held";
    }
  }

  // The third door. Own row holds nothing live (or there is no row), so a
  // curriculum grant from resolveCourseAccess can only be an entitled teacher's
  // class. Derived live and never stored, which is why it is asked here rather
  // than read off the profile.
  const access = await resolveCourseAccess();
  if (access.curriculum) return "/dashboard?upgrade=class";

  return null;
}

type Slug = keyof typeof PRODUCTS;

function isSlug(value: string | null): value is Slug {
  return value !== null && Object.prototype.hasOwnProperty.call(PRODUCTS, value);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");

  if (!isSlug(plan) || !isSellable(PRODUCTS[plan])) {
    return NextResponse.redirect("https://unpackmath.com/pricing");
  }

  const product = PRODUCTS[plan];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // DERIVED FROM THE PRODUCT, NOT HARDCODED. This line used to set
    // role=teacher for every plan, which was harmless only because both accepted
    // slugs were teacher tier. Accepting practice-pass would have handed a
    // student buyer a teacher account through auth/callback, before paying.
    //
    // The parameter is not removed, because it does a second job: /login renders
    // the teacher OAuth screen for role=teacher and the role selector without
    // it, so dropping it would put a "student or teacher?" chooser in the middle
    // of a purchase. role=student is already supported and reaches no promotion.
    //
    // planGrants rather than a literal per row, so this cannot disagree with the
    // capability map the rest of the entitlement layer reads.
    const role = planGrants(product.plan, "teacher-dashboard") ? "teacher" : "student";
    return NextResponse.redirect(new URL(loginHref(`/upgrade?plan=${plan}`, role), req.url));
  }

  // Signed in. The tripwire alone asks whether there is anything to sell; every
  // other slug forwards as it always has. Anonymous visitors never reach this
  // line, so the guard cannot be used to probe whether an account exists, and
  // the sign-in-first rule above is what attaches client_reference_id to the
  // purchase -- the tripwire gets that protection for free by living here.
  if (plan === TRIPWIRE_SLUG) {
    const held = await tripwireHolderGuard(user.id);
    if (held) return NextResponse.redirect(new URL(held, req.url));
  }

  // client_reference_id IS THE WHOLE REASON THIS PATH IS SAFE, and it is worth
  // knowing six months from now.
  //
  // It is the FIRST step of resolveProfileId in the Stripe webhook, so a purchase
  // that comes through here is matched on the auth id and never falls back to
  // matching on the checkout email. Both of the failure modes that cost a real
  // payment on 2026-08-19 are therefore impossible on this path: a buyer who
  // types a non-Google address at checkout, and a Google buyer who simply types
  // a different address than the one they sign in with. prefilled_email also
  // makes the two agree by default rather than by luck.
  //
  // It does NOT cover direct buy.stripe.com links, which carry none of this and
  // are what every warm contact is being sent until Friday. That is Part 2's job,
  // not this one's.
  const paymentLink = new URL(product.url);
  paymentLink.searchParams.set("client_reference_id", user.id);
  if (user.email) paymentLink.searchParams.set("prefilled_email", user.email);

  return NextResponse.redirect(paymentLink.toString());
}
