import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    from: "UnpackMath <juan@unpackmath.com>",
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