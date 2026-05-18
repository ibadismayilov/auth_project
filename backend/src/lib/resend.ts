import { ErrorResponse, Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail: string = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const fromName: string = process.env.RESEND_FROM_NAME || "AUTH";

export async function sendUserEmail({
  userEmail,
  subject,
  htmlContent,
}: IEmailFormat): Promise<IEmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      // from: `${fromName} <${fromEmail}>`,
      from: 'onboarding@resend.dev',
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("An error occurred while sending the email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err as ErrorResponse};
  }
}