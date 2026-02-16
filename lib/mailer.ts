interface SendVerificationEmailProps {
  to: string;
  token: string;
  userName: string | null;
}

interface SendVerificationEmailResult {
  sent: boolean;
  provider: "resend" | "console";
}

export async function sendVerificationEmail({
  to,
  token,
  userName,
}: SendVerificationEmailProps): Promise<SendVerificationEmailResult> {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationLink = `${appUrl}/api/auth/verify-email?token=${token}`;
  const subject = "Verify your TicketHub account";
  const text = `Hello ${userName || "there"},\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nIf you did not request this, please ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p>Hello ${userName || "there"},</p>
      <p>Please verify your email by clicking the button below:</p>
      <p>
        <a href="${verificationLink}" style="display:inline-block;background:#111827;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail =
    process.env.RESEND_FROM_EMAIL || "TicketHub <onboarding@resend.dev>";

  if (!resendApiKey) {
    console.log(
      `RESEND_API_KEY not set. Verification email preview for ${to}: ${verificationLink}`,
    );
    return { sent: false, provider: "console" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send verification email: ${body}`);
  }

  return { sent: true, provider: "resend" };
}
