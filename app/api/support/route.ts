import { NextResponse } from "next/server";
import { getProfile } from "../../lib/auth";
import { createAdminClient } from "../../lib/supabase-admin";
import { sendSupportRequest } from "../../lib/email";
import { supportRateLimit, safeLimit, rateLimitHeaders } from "../../lib/rate-limit";

// Support requests from the Help modal.
//
// Screenshots go to a private storage bucket and travel to support as a signed
// link in the email body, rather than as a raw attachment: it keeps the message
// small, and the object stays behind a URL that expires.
//
// Bucket provisioning lives in sql/support_uploads.sql. If it has not been run
// the upload fails and the request still sends, reporting image_uploaded:false,
// because losing the screenshot is a much better outcome than losing the report.

const BUCKET = "support-uploads";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile || !profile.email) {
    return NextResponse.json({ error: "You must be signed in to contact support." }, { status: 401 });
  }

  const { success, reset } = await safeLimit(supportRateLimit, profile.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many support requests. Try again in a few minutes." },
      { status: 429, headers: rateLimitHeaders(reset) }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();

  if (!subject || subject.length > 200) {
    return NextResponse.json({ error: "Subject is required, and must be under 200 characters." }, { status: 400 });
  }
  if (!body || body.length > 5000) {
    return NextResponse.json({ error: "Message is required, and must be under 5000 characters." }, { status: 400 });
  }

  const image = form.get("image");
  let imageUrl: string | null = null;
  let imageUploaded: boolean | null = null;

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files can be attached." }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "That image is over 5MB." }, { status: 400 });
    }

    imageUploaded = false;
    const admin = createAdminClient();
    // Filename comes from the browser, so it is rebuilt rather than trusted:
    // the extension is derived from the MIME type and the rest is a timestamp
    // under a folder keyed on the sender.
    const ext = image.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "png";
    const path = `${profile.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      console.error("[support] screenshot upload failed:", uploadError.message);
    } else {
      const { data: signed, error: signError } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (signError || !signed) {
        console.error("[support] signed url failed:", signError?.message);
      } else {
        imageUrl = signed.signedUrl;
        imageUploaded = true;
      }
    }
  }

  try {
    await sendSupportRequest({ fromEmail: profile.email, subject, body, imageUrl });
  } catch (err) {
    console.error("[support] send failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not send your message. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, image_uploaded: imageUploaded });
}
