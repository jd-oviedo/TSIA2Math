import { createAdminClient } from "./supabase-admin";

// Shared by the two places a Stripe payment can turn into dashboard access:
// the webhook (app/api/stripe/webhook/route.ts), which fires server-to-server,
// and /teacher/welcome, which is where the buyer's browser lands after
// checkout. Both resolve "this payment belongs to this account" the same way,
// so that logic lives here rather than in either caller.

type Admin = ReturnType<typeof createAdminClient>;

// profiles has no email column -- email lives in auth.users. Page through
// the auth admin API to resolve an email to its profile/user id. Founding-
// teacher scale, so a bounded scan is fine.
export async function findUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) return null;
    const match = data.users.find(
      (u: { id: string; email?: string | null }) => (u.email ?? "").toLowerCase() === target
    );
    if (match) return match.id;
    if (data.users.length < perPage) return null; // reached the last page
  }
  return null;
}

export async function activate(
  admin: Admin,
  profileId: string,
  customerId: string | null,
  email: string | null,
  source = "stripe/webhook"
) {
  await admin
    .from("profiles")
    .update({ subscription_status: "active" })
    .eq("id", profileId);

  // Store the customer id only if it isn't already set.
  if (customerId) {
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", profileId)
      .is("stripe_customer_id", null);
  }

  console.log(`[${source}] activated profile for ${email ?? profileId}, customer ${customerId}`);
}

export async function deactivate(admin: Admin, profileId: string, email: string | null) {
  await admin
    .from("profiles")
    .update({ subscription_status: "inactive" })
    .eq("id", profileId);

  console.log(`[stripe/webhook] deactivated profile for ${email ?? profileId}`);
}
