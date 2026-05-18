export const getVerificationEmailTemplate = (username: string, code: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Welcome, ${username}!</h2>
      <p style="color: #666; font-size: 16px;">To complete your registration, please use the following one-time verification code:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0070f3; margin: 20px 0; border-radius: 4px;">
        ${code}
      </div>
      <p style="color: #999; font-size: 12px;">This code is valid for 5 minutes. If you did not request this email, you can safely ignore it.</p>
    </div>
  `;
};
