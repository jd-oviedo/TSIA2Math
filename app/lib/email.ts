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

// Where a link in an email points. Hardcoded rather than read from the
// environment, matching the join link below: these are sent from server code
// that has no request to derive an origin from, and a preview deployment must
// never mail out a link to itself.
export const APP_ORIGIN = "https://app.unpackmath.com";

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
  const joinUrl = `${APP_ORIGIN}/login`;

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
// resolveProfileId tried the client_reference_id, then the Stripe customer id,
// then the checkout email against auth.users, and none of them found a row.
//
// WHAT THIS EMAIL SAYS CHANGED WITH PART 2, AND THE OLD WORDING WOULD NOW BE A
// LIE. It used to state flatly that no entitlement was written and the buyer had
// nothing, because that was true: the branch alerted, returned 200, and dropped
// the purchase. The webhook now captures the purchase into pending_entitlements
// first, so in the ordinary case the buyer is owed something recoverable and a
// self-service link exists. Saying otherwise would send a person chasing a
// refund by hand for a purchase that is already safe.
//
// So `capture` is required rather than optional, and every branch of it prints
// different copy. The two that still need a human are called out in red; the two
// that do not are not.
//
// THE CLAIM LINK IN THIS EMAIL IS LOAD BEARING TWICE OVER. It is the only
// delivery path for a buyer whose checkout email is not a Google address, and
// until unpackmath-home's /success passes the session id through it is the only
// delivery path for anyone at all.
//
// Sentry does not see the console line either: sentry.server.config.ts
// configures no console-capture integration. That is why this is an email and a
// Sentry capture rather than a better log line.
export type UnmatchedCheckoutCapture =
  /** Held in pending_entitlements. The buyer can claim it. */
  | "recorded"
  /** A redelivery of an event already captured. Nothing new to do. */
  | "duplicate"
  /** The Payment Link is unknown, so no plan could be named and nothing could
   *  be stored. plan is NOT NULL on that table for the same reason
   *  profiles_plan_pairing_check exists. A human has to resolve this one. */
  | "unrecognised-link"
  /** The insert itself failed. Stripe is being asked to retry, but if the
   *  retries run out this purchase is gone. */
  | "failed";

export async function sendUnmatchedCheckoutAlert({
  checkoutSessionId,
  email,
  paymentLinkId,
  productLabel,
  amountTotal,
  currency,
  hadClientReferenceId,
  capture,
}: {
  checkoutSessionId: string | null;
  email: string | null;
  paymentLinkId: string | null;
  productLabel: string | null;
  amountTotal: number | null;
  currency: string | null;
  hadClientReferenceId: boolean;
  capture: UnmatchedCheckoutCapture;
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

  // Only meaningful when something was actually stored under this session id.
  const claimUrl =
    checkoutSessionId && (capture === "recorded" || capture === "duplicate")
      ? `${APP_ORIGIN}/claim?checkout_session_id=${encodeURIComponent(checkoutSessionId)}`
      : null;

  const needsAHuman = capture === "unrecognised-link" || capture === "failed";

  const HEADINGS: Record<UnmatchedCheckoutCapture, string> = {
    recorded: "A payment matched no account, and is being held for them",
    duplicate: "A payment matched no account (already held)",
    "unrecognised-link": "A payment was taken and could not be held",
    failed: "A payment was taken and could not be held",
  };

  const LEADS: Record<UnmatchedCheckoutCapture, string> = {
    recorded:
      "Stripe completed this checkout and the webhook could not match it to any account, " +
      "so <strong>no entitlement was written to anyone</strong>. The purchase is not lost: " +
      "it is held in <code>pending_entitlements</code> and the link below hands it to " +
      "whoever signs in with it. Send that link to the buyer. If their checkout email is a " +
      "Google address they can also just sign in, and it will be applied automatically.",
    duplicate:
      "Stripe redelivered a checkout that was already captured. No second copy was stored " +
      "and nothing has changed. The claim link below is the same one as before; the row is " +
      "either still waiting or already claimed.",
    "unrecognised-link":
      "Stripe completed this checkout, the webhook could not match it to any account, " +
      "<strong>and it could not name the product either</strong> — the Payment Link below " +
      "is not in <code>app/lib/products.ts</code>. With no plan there is nothing valid to " +
      "store, so <strong>nothing was written and nothing is being held</strong>. " +
      "This one needs you: add the link to the product map, then apply the entitlement by " +
      "hand or insert the pending row yourself.",
    failed:
      "Stripe completed this checkout, the webhook could not match it to any account, " +
      "<strong>and storing it failed</strong>. The handler returned 500 so Stripe will " +
      "retry, and a retry that succeeds will send a different version of this email. " +
      "If the retry window runs out first, this purchase is gone and only this message " +
      "records it.",
  };

  const banner = needsAHuman ? "#7a1f1f" : "#3d5a3d";
  const bannerText = needsAHuman ? "#f0c9c9" : "#cfe3cf";

  const row = (label: string, value: string) => `
    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">${escapeHtml(label)}</p>
    <p style="margin:0 0 18px; font-size:14px; color:#0f1e35; font-weight:600; font-family:ui-monospace,Menlo,monospace;">${escapeHtml(value)}</p>`;

  // Deliberately a bare printed URL rather than an anchor. It is pasted into a
  // message to a buyer far more often than it is clicked here, and a mail client
  // that shortens the visible text of a link would make it unpastable.
  const claimBlock = claimUrl
    ? `
    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">Claim link — send this to the buyer</p>
    <p style="margin:0 0 22px; font-size:13px; color:#0f1e35; font-weight:600; font-family:ui-monospace,Menlo,monospace; word-break:break-all;">${escapeHtml(claimUrl)}</p>`
    : "";

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
                  <td style="background:${banner}; padding:20px 28px;">
                    <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:${bannerText};">UnpackMath</p>
                    <h1 style="margin:6px 0 0; font-size:18px; font-weight:700; color:#ffffff;">${escapeHtml(HEADINGS[capture])}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 22px; font-size:14px; color:#3a3a3a; line-height:1.65;">
                      ${LEADS[capture]}
                    </p>
                    ${claimBlock}
                    ${row("Checkout email", email ?? "(none on the session)")}
                    ${row("Product", productLabel ?? `unrecognised link ${paymentLinkId ?? "(none)"}`)}
                    ${row("Amount", money)}
                    ${row("Checkout session", checkoutSessionId ?? "(unknown)")}
                    ${row("Payment link", paymentLinkId ?? "(none)")}
                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a8983;">How they bought</p>
                    <p style="margin:0 0 22px; font-size:14px; color:#3a3a3a; line-height:1.6;">${escapeHtml(route)}</p>
                    <p style="margin:0; font-size:13px; color:#8a8983; line-height:1.6;">
                      Most likely they paid with an email they have never signed into the app with, or one that is not a Google address at all. Sign-in is Google-only, so a non-Google checkout email can never become an account on its own — the claim link is the only self-service path for that buyer.
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

  const SUBJECTS: Record<UnmatchedCheckoutCapture, string> = {
    recorded: "Payment held for claim, no account matched",
    duplicate: "Payment already held for claim, no account matched",
    "unrecognised-link": "Payment taken, NOT held: unrecognised payment link",
    failed: "Payment taken, NOT held: capture failed",
  };

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: OPS_INBOX,
    subject: `${SUBJECTS[capture]}${email ? `: ${email}` : ""}`,
    html,
  });

  if (error) {
    console.error("[email] failed to send unmatched-checkout alert:", error);
    throw new Error(error.message);
  }
}


// ---------------------------------------------------------------------------
// Buyer lifecycle emails — the $1 trial flow
// ---------------------------------------------------------------------------

// Where "update your card" and "manage" links land: the portal redirect at
// app/teacher/billing/route.ts. Card collection is Stripe's job.
const BILLING_URL = `${APP_ORIGIN}/teacher/billing`;
// Where a CANCEL link lands: the in-app cancel screen with the Core
// save-offer. Deliberately not the portal — portal cancellation is disabled in
// the Stripe dashboard so an email-initiated cancel cannot bypass the offer.
const CANCEL_URL = `${APP_ORIGIN}/teacher/cancel`;
const DASHBOARD_URL = `${APP_ORIGIN}/teacher`;

// Shared scaffold for the four trial senders below and the tripwire reminder at
// the bottom of this file, and ONLY those. The older senders each carry their
// own copy of this table layout; refactoring working emails onto a new helper
// is deliberately not part of the trial build.
function buyerEmailHtml({
  heading,
  preheader,
  paragraphsHtml,
  cta,
  afterCtaHtml = [],
  footNote,
}: {
  heading: string;
  /** Inbox preview text. Rendered invisibly ahead of the body. */
  preheader?: string;
  /** Already-safe HTML. Callers escape any user-derived value they interpolate. */
  paragraphsHtml: string[];
  cta?: { label: string; url: string; secondary?: { label: string; url: string } };
  /** Already-safe HTML paragraphs rendered AFTER the button. */
  afterCtaHtml?: string[];
  footNote?: string;
}): string {
  const paragraph = (p: string) =>
    `<p style="margin:0 0 16px; font-size:14px; color:#3a3a3a; line-height:1.65;">${p}</p>`;
  const body = paragraphsHtml.map(paragraph).join("\n");
  const after = afterCtaHtml.map(paragraph).join("\n");

  const preheaderBlock = preheader
    ? `<div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f5f5f3; opacity:0;">${escapeHtml(preheader)}</div>`
    : "";

  const ctaBlock = cta
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      <tr>
        <td align="center">
          <a href="${cta.url}" style="display:inline-block; background:#0f1e35; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:13px 30px; border-radius:10px;">
            ${escapeHtml(cta.label)}
          </a>
          ${
            cta.secondary
              ? `<span style="display:inline-block; margin-left:14px; font-size:14px;"><a href="${cta.secondary.url}" style="color:#C68A2F; font-weight:600;">${escapeHtml(cta.secondary.label)}</a></span>`
              : ""
          }
        </td>
      </tr>
    </table>`
    : "";

  const foot = footNote
    ? `<p style="margin:0; font-size:13px; color:#8a8983; line-height:1.6;">${footNote}</p>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0; padding:0; background:#f5f5f3;">
        ${preheaderBlock}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3; padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e0dfd8;">
                <tr>
                  <td style="background:#0f1e35; padding:20px 28px;">
                    <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#C68A2F;">UnpackMath</p>
                    <h1 style="margin:6px 0 0; font-size:18px; font-weight:700; color:#ffffff;">${escapeHtml(heading)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    ${body}
                    ${ctaBlock}
                    ${after}
                    ${foot}
                  </td>
                </tr>
                <tr>
                  <td style="background:#f5f5f3; border-top:1px solid #e0dfd8; padding:16px 28px; text-align:center;">
                    <p style="margin:0; font-size:11px; color:#aaa;">
                      Sent by UnpackMath &middot;
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
}

// Dates in buyer emails are Central, like the crisis alert: the audience is
// Texas teachers and a UTC date can be off by a day at the boundary that
// matters most here, which is "when will I be charged".
function emailDate(d: Date): string {
  return d.toLocaleDateString("en-US", { timeZone: "America/Chicago", dateStyle: "long" });
}

function usd(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

// All four senders throw on a Resend error, like every sender in this file.
// Whether a throw is allowed to change the webhook's response differs PER
// EVENT and is decided at the call site in app/api/stripe/webhook/route.ts:
// the trial-ending reminder propagates (a 500 makes Stripe retry, and delivery
// beats a rare duplicate for the compliance email); the other three are
// caught and logged there, deliberately.

export async function sendTrialSignupReceipt({
  toEmail,
  firstName,
  trialEndsAt,
}: {
  toEmail: string;
  firstName: string;
  trialEndsAt: Date;
}) {
  const name = escapeHtml(firstName);
  const html = buyerEmailHtml({
    heading: "Your 7-day Teacher Pro trial is live",
    paragraphsHtml: [
      `Hey ${name}, your 7-day Teacher Pro trial is live. You paid <strong>$1</strong> today.`,
      `On <strong>${escapeHtml(emailDate(trialEndsAt))}</strong> we'll charge $30/month to keep it going, ` +
        `and you can cancel anytime before then, right from your dashboard.`,
    ],
    cta: { label: "Set up your first class", url: DASHBOARD_URL },
    footNote: "If anything looks off, just reply to this email.",
  });

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: toEmail,
    replyTo: SUPPORT_INBOX,
    subject: "You're in. Your UnpackMath trial started.",
    html,
  });

  if (error) {
    console.error("[email] failed to send trial signup receipt:", error);
    throw new Error(error.message);
  }
}

export async function sendTrialEndingReminder({
  toEmail,
  firstName,
  trialEndsAt,
}: {
  toEmail: string;
  firstName: string;
  trialEndsAt: Date;
}) {
  const name = escapeHtml(firstName);
  const html = buyerEmailHtml({
    heading: "3 days left on your trial",
    paragraphsHtml: [
      `Hey ${name}, quick heads up: your Teacher Pro trial ends ` +
        `<strong>${escapeHtml(emailDate(trialEndsAt))}</strong>.`,
      `Do nothing and we'll charge $30/month, and everything keeps running — ` +
        `your classes, your misconception grid, all of it.`,
      `Want to stop instead? <a href="${CANCEL_URL}" style="color:#C68A2F; font-weight:600;">Cancel in two clicks here</a>, no hard feelings.`,
    ],
    cta: { label: "Open your dashboard", url: DASHBOARD_URL },
  });

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: toEmail,
    replyTo: SUPPORT_INBOX,
    subject: "3 days left on your UnpackMath trial",
    html,
  });

  if (error) {
    console.error("[email] failed to send trial-ending reminder:", error);
    throw new Error(error.message);
  }
}

export async function sendConversionReceipt({
  toEmail,
  firstName,
  amountCents,
  planLabel,
  nextChargeAt,
}: {
  toEmail: string;
  firstName: string;
  amountCents: number;
  /** "Teacher Pro", or "Teacher Core" for a trial that took the save-offer. */
  planLabel: string;
  nextChargeAt: Date | null;
}) {
  const name = escapeHtml(firstName);
  const html = buyerEmailHtml({
    heading: `You're officially on ${planLabel}`,
    paragraphsHtml: [
      `Thanks ${name}. Your <strong>${escapeHtml(usd(amountCents))}/month ${escapeHtml(planLabel)}</strong> is active.` +
        (nextChargeAt ? ` Next charge is ${escapeHtml(emailDate(nextChargeAt))}.` : ""),
      `You can <a href="${CANCEL_URL}" style="color:#C68A2F; font-weight:600;">manage or cancel anytime here</a>.`,
    ],
    cta: { label: "Jump back in", url: DASHBOARD_URL },
  });

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: toEmail,
    replyTo: SUPPORT_INBOX,
    subject: `You're officially on ${planLabel}`,
    html,
  });

  if (error) {
    console.error("[email] failed to send conversion receipt:", error);
    throw new Error(error.message);
  }
}

export async function sendPaymentFailedNotice({
  toEmail,
  firstName,
  amountCents,
  planLabel,
}: {
  toEmail: string;
  firstName: string;
  amountCents: number;
  planLabel: string;
}) {
  const name = escapeHtml(firstName);
  const html = buyerEmailHtml({
    heading: "We couldn't process your payment",
    paragraphsHtml: [
      `Hey ${name}, your <strong>${escapeHtml(usd(amountCents))} ${escapeHtml(planLabel)}</strong> charge ` +
        `didn't go through — usually just a card expiry thing.`,
      `<a href="${BILLING_URL}" style="color:#C68A2F; font-weight:600;">Update your card here</a> to keep your classes running. We'll try again in a couple of days.`,
    ],
    cta: { label: "Update payment method", url: BILLING_URL },
  });

  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: toEmail,
    replyTo: SUPPORT_INBOX,
    subject: "We couldn't process your UnpackMath payment",
    html,
  });

  if (error) {
    console.error("[email] failed to send payment-failed notice:", error);
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// The $5 / 7-day tripwire reminder
// ---------------------------------------------------------------------------
//
// Sent by the daily cron in app/api/cron/tripwire-day6/route.ts, on the day
// before a pass ends. See app/lib/tripwire-reminder.ts for who gets which one.
//
// THE COPY IS VERBATIM AND LIVES IN ONE PLACE. Each template below is the exact
// text Juan approved, with {{merge_fields}} left in. Both the plain-text body
// and the HTML body are derived from the same string, so the two cannot drift,
// and the harness reads the same string to prove the right state got the right
// words. Do not "tidy" the wording here: the spelling of Mu, the sign-off and
// the line breaks are all deliberate.
//
// REPLY-TO IS A PERSON. The trial senders above reply to the support inbox;
// this one says "just reply to this email and I'll get you in myself", so it
// has to land with Mr. O rather than in a queue.

export const TRIPWIRE_REPLY_TO = "mr.o@unpackmath.com";

export type TripwireReminderState = "engaged" | "idle" | "never-claimed";

export const TRIPWIRE_REMINDER_COPY: Readonly<
  Record<TripwireReminderState, { subject: string; preheader: string; body: string }>
> = {
  engaged: {
    subject: "Tomorrow, the rest of your course locks",
    preheader: "Your progress stays saved. The lessons and Mu don't.",
    body: `Howdy {{first_name}},

Your 7-day pass ends {{expiry_date}}. Wanted to give you a heads up before it does, not after.

Everything you've already done stays on your account, your scores and your progress, all of it. But tomorrow the other 96 topics, the worked solutions, and Mu go back behind the lock.

In the last week you worked through {{topics_worked}} topics. That's real ground. The test doesn't care what you paid, it cares whether you've closed the gaps, and you were closing them.

If you want to keep going, Full Course keeps everything you have right now, Mu included, for a full year. If you just need to finish prepping and practicing, Practice Pass is the lighter option.

{{full_course_button}} {{practice_pass_link}}

Either way, log in before your pass ends so you don't lose your footing.

Mr. O`,
  },
  idle: {
    subject: "Tomorrow, the rest of your course locks",
    preheader: "Your progress stays saved. The lessons and Mu don't.",
    body: `Howdy {{first_name}},

Your 7-day pass ends {{expiry_date}}. Wanted to give you a heads up before it does, not after.

You set up your account but haven't started yet, and there's still time to. Right now you've got all 97 topics, the worked solutions, and Mu unlocked. Tomorrow the other 96 topics go back behind the lock.

Even one session before then tells you where you stand for the test. That's the whole point of the pass.

If you want to keep everything, Mu included, for a full year, that's Full Course. If you just need to prep and practice, Practice Pass is the lighter option.

{{full_course_button}} {{practice_pass_link}}

Log in before your pass ends so you don't lose the access you already paid for.

Mr. O`,
  },
  "never-claimed": {
    subject: "Your 7-day pass is unused, here is how to start it",
    preheader: "Log in with your checkout email to unlock everything.",
    body: `Howdy,

You bought a 7-day pass, but it looks like you haven't logged in yet, so the clock is running on access you haven't used.

Here's the fix: log in with the same email you used at checkout, and everything unlocks, all 97 topics, the worked solutions, and Mu. Your 7 days run through {{expiry_date}}.

{{claim_button}}

If the login gives you any trouble, just reply to this email and I'll get you in myself.

Mr. O`,
  },
};

// The two upgrade CTAs go through /upgrade rather than to the raw
// buy.stripe.com URLs on purpose: /upgrade signs the buyer in and attaches
// client_reference_id, which is what lets the webhook land the purchase on
// the right profile. A raw link from an email touches no route and can arrive
// with an email that matches nothing (see pending-entitlements.ts).
export const FULL_COURSE_UPGRADE_URL = `${APP_ORIGIN}/upgrade?plan=full-course`;
export const PRACTICE_PASS_UPGRADE_URL = `${APP_ORIGIN}/upgrade?plan=practice-pass`;

export function claimUrlFor(checkoutSessionId: string): string {
  return `${APP_ORIGIN}/claim?checkout_session_id=${encodeURIComponent(checkoutSessionId)}`;
}

// "September 9". Central, like every other buyer-facing date in this file.
export function tripwireExpiryDate(accessUntil: Date): string {
  return accessUntil.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
  });
}

export type TripwireReminderFields = {
  firstName?: string;
  expiryDate: string;
  topicsWorked?: number;
  /** Required for never-claimed; ignored otherwise. */
  claimUrl?: string;
};

export type TripwireReminderMessage = {
  state: TripwireReminderState;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const FULL_COURSE_LABEL = "Keep going with Full Course";
const PRACTICE_PASS_LABEL = "Or get Practice Pass";
const CLAIM_LABEL = "Log in and unlock your pass";

/**
 * Pure. Renders one state's copy into a ready-to-send message.
 *
 * The text body is the verbatim template with plain substitutions, buttons
 * becoming "label: url". The HTML body splits the same template on blank
 * lines: a paragraph that is only button tokens becomes the CTA row, every
 * other paragraph is escaped and then has its tokens filled with escaped
 * values. Merge values are substituted AFTER escaping so a first name with
 * markup in it cannot render as markup.
 */
export function renderTripwireReminder(
  state: TripwireReminderState,
  to: string,
  fields: TripwireReminderFields
): TripwireReminderMessage {
  const copy = TRIPWIRE_REMINDER_COPY[state];
  const firstName = (fields.firstName ?? "").trim() || "there";
  const topicsWorked = String(fields.topicsWorked ?? 0);
  if (state === "never-claimed" && !fields.claimUrl) {
    throw new Error("renderTripwireReminder: never-claimed needs a claimUrl");
  }
  const claimUrl = fields.claimUrl ?? "";

  const textValues: Record<string, string> = {
    first_name: firstName,
    expiry_date: fields.expiryDate,
    topics_worked: topicsWorked,
    full_course_button: `${FULL_COURSE_LABEL}: ${FULL_COURSE_UPGRADE_URL}`,
    practice_pass_link: `${PRACTICE_PASS_LABEL}: ${PRACTICE_PASS_UPGRADE_URL}`,
    claim_button: `${CLAIM_LABEL}: ${claimUrl}`,
  };
  const fill = (s: string, values: Record<string, string>) =>
    s.replace(/\{\{(\w+)\}\}/g, (m, key: string) => (key in values ? values[key] : m));

  const text = fill(copy.body, textValues);

  const htmlValues: Record<string, string> = {
    first_name: escapeHtml(firstName),
    expiry_date: `<strong>${escapeHtml(fields.expiryDate)}</strong>`,
    topics_worked: `<strong>${escapeHtml(topicsWorked)}</strong>`,
  };

  const paragraphs = copy.body.split(/\n\s*\n/);
  const before: string[] = [];
  const after: string[] = [];
  let cta: { label: string; url: string; secondary?: { label: string; url: string } } | undefined;
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (trimmed === "{{full_course_button}} {{practice_pass_link}}") {
      cta = {
        label: FULL_COURSE_LABEL,
        url: FULL_COURSE_UPGRADE_URL,
        secondary: { label: PRACTICE_PASS_LABEL, url: PRACTICE_PASS_UPGRADE_URL },
      };
      continue;
    }
    if (trimmed === "{{claim_button}}") {
      cta = { label: CLAIM_LABEL, url: claimUrl };
      continue;
    }
    (cta ? after : before).push(fill(escapeHtml(trimmed), htmlValues));
  }
  if (!cta) throw new Error(`renderTripwireReminder: ${state} template has no CTA paragraph`);

  const html = buyerEmailHtml({
    heading: copy.subject,
    preheader: copy.preheader,
    paragraphsHtml: before,
    cta,
    afterCtaHtml: after,
  });

  return { state, to, subject: copy.subject, text, html };
}

/** The only thing here that touches Resend. The cron injects it; the harness never does. */
export async function sendTripwireReminder(message: TripwireReminderMessage): Promise<void> {
  const { error } = await resend.emails.send({
    from: "UnpackMath <no-reply@unpackmath.com>",
    to: message.to,
    replyTo: TRIPWIRE_REPLY_TO,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  if (error) {
    console.error(`[email] failed to send tripwire ${message.state} reminder:`, error);
    throw new Error(error.message);
  }
}
