import { NextResponse } from "next/server";
import { createClient } from "../lib/supabase-server";

const PAYMENT_LINKS = {
  monthly: "https://buy.stripe.com/9B614ndby1je9210YT7AI02",
  annual: "https://buy.stripe.com/fZu6oH8Vi3rm921cHB7AI03",
} as const;

type Plan = keyof typeof PAYMENT_LINKS;

function isPlan(value: string | null): value is Plan {
  return value === "monthly" || value === "annual";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");

  if (!isPlan(plan)) {
    return NextResponse.redirect("https://unpackmath.com/pricing");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("role", "teacher");
    loginUrl.searchParams.set("next", `/upgrade?plan=${plan}`);
    return NextResponse.redirect(loginUrl);
  }

  const paymentLink = new URL(PAYMENT_LINKS[plan]);
  paymentLink.searchParams.set("client_reference_id", user.id);
  if (user.email) paymentLink.searchParams.set("prefilled_email", user.email);

  return NextResponse.redirect(paymentLink.toString());
}
