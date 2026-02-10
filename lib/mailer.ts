// lib/mailer.ts

// This is a placeholder for your email sending service (e.g., Resend, Nodemailer)
// In a real application, you would integrate with a service here.

interface SendVerificationEmailProps {
  to: string;
  token: string;
  userName: string | null;
}

export async function sendVerificationEmail({
  to,
  token,
  userName,
}: SendVerificationEmailProps) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`; // Assuming a NextAuth.js callback route

  console.log(`
    --- Verification Email Placeholder ---
    To: ${to}
    Subject: Verify your email address
    
    Hello ${userName || "there"},

    Please verify your email address by clicking on the link below:
    ${verificationLink}

    This link will expire in [e.g., 24 hours].

    If you did not request this, please ignore this email.
    --- End Email Placeholder ---
  `);

  // In a real application, you would use an email service here:
  // try {
  //   await resend.emails.send({
  //     from: 'onboarding@yourdomain.com',
  //     to: to,
  //     subject: 'Verify your email address',
  //     html: `
  //       <p>Hello ${userName || "there"},</p>
  //       <p>Please verify your email address by clicking on the link below:</p>
  //       <p><a href="${verificationLink}">Verify Email</a></p>
  //       <p>This link will expire in 24 hours.</p>
  //       <p>If you did not request this, please ignore this email.</p>
  //     `,
  //   });
  //   console.log(`Verification email sent to ${to}`);
  // } catch (error) {
  //   console.error(`Failed to send verification email to ${to}:`, error);
  // }
}
