import { NextResponse } from "next/server";
import { createClient } from "../lib/supabase-server";
import { planGrants } from "../lib/capabilities";
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
} as const satisfies Record<string, Product>;

type Slug = keyof typeof PRODUCTS;

function isSlug(value: string | null): value is Slug {
  return value !== null && Object.prototype.hasOwnProperty.call(PRODUCTS, value);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");

  if (!isSlug(plan)) {
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
