import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const SUPPORT_INBOX = "support@unpackmath.com";

// Where a crisis alert goes when the student has no teacher. Roughly half the
// student base is self-serve, and teacher_notifications.teacher_id is
// `not null references auth.users(id)`, so those students structurally cannot be
// recorded there. This is the destination for them.
export const CRISIS_INBOX = "juan@unpackmath.com";

// Operational alerts that need a person, as distinct from the crisis path above.
// The same address today; kept as its own constant because the two have
// different urgency and different readers, and merging them would make it
// impossible to route one elsewhere later without touching the other.
export const OPS_INBOX = "juan@unpackmath.com";

// Teacher-authored copy goes into an HTML email, so it is escaped rather than
// interpolated raw. Without this a subject line containing markup would render
// as markup in the support inbox.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Support request from the Help modal.
//
// Sent from the no-reply sender because that is the verified domain sender,
// with the teacher set as reply-to so answering in the support inbox goes
// straight back to them rather than into a black hole.
export async function sendSupportRequest({
  fromEmail,
  subject,
  body,
  imageUrl,
}: {
  fromEmail: string;
  subject: string;
  body: string;
  imageUrl: string | null;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0; padding:0; background:#f5f5f3;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3; padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e0dfd8;">
                <tr>
                  <td style="background:#0f1e35; padding:20px 28px;">
                    <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#C68A2F;">UnpackMath support</p>
                    <h1 style="margin:6px 0 0; font-size:18px; font-weight:700; color:#ffffff;">${escapeHtml(subject)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">From</p>
                    <p style="margin:0 0 20px; font-size:14px; color:#0f1e35; font-weight:600;">${escapeHtml(fromEmail)}</p>

                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">Message</p>
                    <p style="margin:0; font-size:14px; color:#3a3a3a; line-height:1.65; white-space:pre-wrap;">${escapeHtml(body)}</p>

                    ${
                      imageUrl
                        ? `<p style="margin:22px 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">Screenshot</p>
                           <p style="margin:0; font-size:14px;"><a href="${imageUrl}" style="color:#C68A2F;">View attached screenshot</a></p>
                           <p style="margin:6px 0 0; font-size:12px; color:#8a8983;">Link expires in 30 days.</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: SUPPORT_INBOX,
    replyTo: fromEmail,
    subject: `[Support] ${subject}`,
    html,
  });

  if (error) {
    console.error("[email] failed to send support request:", error);
    throw new Error(error.message);
  }
}

export async function sendTeacherInvite({
  toEmail,
  teacherEmail,
  className,
  joinCode,
}: {
  toEmail: string;
  teacherEmail: string;
  className: string;
  joinCode: string;
}) {
  const joinUrl = `https://app.unpackmath.com/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0; padding:0; background:#f5f5f3; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:16px; overflow:hidden; border: 1px solid #e0dfd8;">

                <!-- Header -->
                <tr>
                  <td style="background:#0f1e35; padding: 28px 32px; text-align:center;">
                    <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#C68A2F;">UnpackMath</p>
                    <h1 style="margin:8px 0 0; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">You've been invited to a class</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin:0 0 16px; font-size:15px; color:#3a3a3a; line-height:1.6;">
                      <strong>${teacherEmail}</strong> has invited you to join <strong>${className}</strong> on UnpackMath -- a free TSIA2 math prep platform.
                    </p>
                    <p style="margin:0 0 24px; font-size:15px; color:#3a3a3a; line-height:1.6;">
                      Sign in with Google, then enter your class join code to get started.
                    </p>

                    <!-- Join code box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="background:#f5f5f3; border:1px solid #e0dfd8; border-radius:10px; padding:16px 20px; text-align:center;">
                          <p style="margin:0 0 4px; font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.1em;">Your class join code</p>
                          <p style="margin:0; font-size:28px; font-weight:800; font-family:monospace; letter-spacing:0.18em; color:#0f1e35;">${joinCode}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${joinUrl}" style="display:inline-block; background:#0f1e35; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:10px;">
                            Sign in to UnpackMath
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0; font-size:13px; color:#888; line-height:1.6;">
                      UnpackMath is a free TSIA2 adaptive math practice platform. No credit card required for students.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f5f5f3; border-top:1px solid #e0dfd8; padding:16px 32px; text-align:center;">
                    <p style="margin:0; font-size:11px; color:#aaa;">
                      Sent by UnpackMath &middot; JDOM LLC &middot;
                      <a href="https://www.unpackmath.com" style="color:#aaa;">unpackmath.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: toEmail,
    subject: `You've been invited to ${className} on UnpackMath`,
    html,
  });

  console.log("[email] resend response data:", JSON.stringify(data));
  console.log("[email] resend response error:", JSON.stringify(error));

  if (error) {
    console.error("[email] failed to send invite:", error);
    throw new Error(error.message);
}}


// A GUMU session stopped because the crisis screen fired.
//
// ONE FUNCTION, TWO RECIPIENTS, ONE BEHAVIOUR. The teacher gets this when the
// student has one; juan@unpackmath.com gets it when they do not. Both are sent
// immediately, because a digest cannot serve a crisis: a disclosure at 9pm
// reaches a teacher the next morning at best.
//
// WHY EMAIL AT ALL, when teacher_notifications exists. Because nothing reads
// that table. It is written in exactly one place and read in none: there is no
// dashboard query, no listing, no unread badge, and the index built for "the
// teacher dashboard's unread-first listing" (sql/gumu_tables.sql) serves a
// listing that was never built. Every row inserted today reaches nobody. The row
// is still written, because it is the durable record and the right home once a
// UI exists, but email is the only channel that reaches a person.
//
// THE STUDENT'S MESSAGE IS NOT INCLUDED, and that is a decision rather than an
// omission. A teacher does not need the words to act: they need to know which
// student, and when, so they can go and find them, which is the thing a teacher
// can actually do. Including a minor's disclosure of distress verbatim in an
// inbox that can be forwarded is a much larger step, and whether it is
// appropriate is one of the open questions with the school counselor. It is a
// one-line change here if that answer comes back differently.
export async function sendCrisisAlert({
  toEmail,
  studentEmail,
  studentId,
  topicId,
  hasTeacher,
}: {
  toEmail: string;
  studentEmail: string | null;
  studentId: string;
  topicId: string;
  hasTeacher: boolean;
}) {
  const who = studentEmail ? escapeHtml(studentEmail) : `student ${escapeHtml(studentId)}`;
  const when = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const guidance = hasTeacher
    ? "You are receiving this because this student is in one of your classes."
    : "You are receiving this because this student is not enrolled in any class, so there is no teacher to tell.";

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0; padding:0; background:#f5f5f3;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3; padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e0dfd8;">
                <tr>
                  <td style="background:#0f1e35; padding:20px 28px;">
                    <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#C68A2F;">UnpackMath</p>
                    <h1 style="margin:6px 0 0; font-size:18px; font-weight:700; color:#ffffff;">A student may need support</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 20px; font-size:14px; color:#3a3a3a; line-height:1.65;">
                      A tutoring session was stopped automatically because of something the student typed. They have been shown the 988 Suicide and Crisis Lifeline and the Crisis Text Line, and the session was closed.
                    </p>

                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">Student</p>
                    <p style="margin:0 0 18px; font-size:14px; color:#0f1e35; font-weight:600;">${who}</p>

                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">When</p>
                    <p style="margin:0 0 18px; font-size:14px; color:#3a3a3a;">${escapeHtml(when)} (Central)</p>

                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">Topic</p>
                    <p style="margin:0 0 22px; font-size:14px; color:#3a3a3a;">${escapeHtml(topicId)}</p>

                    <p style="margin:0 0 14px; font-size:13px; color:#8a8983; line-height:1.6;">
                      ${escapeHtml(guidance)}
                    </p>
                    <p style="margin:0; font-size:13px; color:#8a8983; line-height:1.6;">
                      What the student wrote is not included in this email. The student has not been told that anyone was notified.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // Throws like the others, so the caller can decide. The caller here catches:
  // a failed alert must never break the response that is showing a student a
  // crisis line.
  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: toEmail,
    subject: "A student may need support",
    html,
  });

  if (error) {
    console.error("[email] failed to send crisis alert:", error);
    throw new Error(error.message);
  }
}


// A completed checkout that could not be matched to any account.
//
// THE MONEY WAS TAKEN AND NOTHING WAS WRITTEN. resolveProfileId tried the
// client_reference_id, then the Stripe customer id, then the checkout email
// against auth.users, and none of them found a row. The handler still returns
// 200, deliberately, so Stripe stops retrying an event that will not resolve on
// its own; that makes this email the only thing that tells a human it happened.
//
// Until now the only trace was one console.error line in Vercel's runtime logs,
// which have limited retention and which nothing alerts on. Sentry does not see
// it either: sentry.server.config.ts configures no console-capture integration.
// So we could not answer whether this had ever fired, which is why the fix is an
// email and a Sentry capture rather than a better log line.
export async function sendUnmatchedCheckoutAlert({
  checkoutSessionId,
  email,
  paymentLinkId,
  productLabel,
  amountTotal,
  currency,
  hadClientReferenceId,
}: {
  checkoutSessionId: string | null;
  email: string | null;
  paymentLinkId: string | null;
  productLabel: string | null;
  amountTotal: number | null;
  currency: string | null;
  hadClientReferenceId: boolean;
}) {
  const money =
    amountTotal != null
      ? `${(amountTotal / 100).toFixed(2)} ${(currency ?? "usd").toUpperCase()}`
      : "unknown";

  // Whether the buyer came through /upgrade at all. /upgrade sets
  // client_reference_id, so its absence means a direct buy.stripe.com link,
  // which is the path with no account association by construction.
  const route = hadClientReferenceId
    ? "through /upgrade (client_reference_id was set, but no profile has that id)"
    : "a direct buy.stripe.com link (no client_reference_id)";

  const row = (label: string, value: string) => `
    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">${escapeHtml(label)}</p>
    <p style="margin:0 0 18px; font-size:14px; color:#0f1e35; font-weight:600; font-family:ui-monospace,Menlo,monospace;">${escapeHtml(value)}</p>`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0; padding:0; background:#f5f5f3;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3; padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e0dfd8;">
                <tr>
                  <td style="background:#7a1f1f; padding:20px 28px;">
                    <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#f0c9c9;">UnpackMath</p>
                    <h1 style="margin:6px 0 0; font-size:18px; font-weight:700; color:#ffffff;">A payment was taken and no account was found</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 22px; font-size:14px; color:#3a3a3a; line-height:1.65;">
                      Stripe completed this checkout and the webhook could not match it to any account, so <strong>no entitlement was written</strong>. The buyer has paid and has nothing. Stripe was acknowledged, so it will not retry.
                    </p>
                    ${row("Checkout email", email ?? "(none on the session)")}
                    ${row("Product", productLabel ?? `unrecognised link ${paymentLinkId ?? "(none)"}`)}
                    ${row("Amount", money)}
                    ${row("Checkout session", checkoutSessionId ?? "(unknown)")}
                    ${row("Payment link", paymentLinkId ?? "(none)")}
                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">How they bought</p>
                    <p style="margin:0 0 22px; font-size:14px; color:#3a3a3a; line-height:1.6;">${escapeHtml(route)}</p>
                    <p style="margin:0; font-size:13px; color:#8a8983; line-height:1.6;">
                      Most likely they paid with an email they have never signed into the app with. Resolving it by hand means finding or creating their account and applying the entitlement for the product above.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: OPS_INBOX,
    subject: `Payment taken, no account matched${email ? `: ${email}` : ""}`,
    html,
  });

  if (error) {
    console.error("[email] failed to send unmatched-checkout alert:", error);
    throw new Error(error.message);
  }
}
