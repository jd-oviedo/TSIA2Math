import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { createClient as createServerClient } from "../../../lib/supabase-server";
import { safeLimit, flagRateLimit, getClientIp } from "../../../lib/rate-limit";
import { flagSchema } from "../../../lib/schemas";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = await safeLimit(flagRateLimit, ip);
  if (!limited.success)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const parsed = flagSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { item_id, category, comment } = parsed.data;

  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin.from("item_flags").insert({
    item_id,
    user_id: session.user.id,
    user_email: session.user.email,
    category,
    comment: comment ?? null,
  });

  if (error) {
    console.error("Flag insert error:", error);
    return NextResponse.json({ error: "Failed to save flag" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}