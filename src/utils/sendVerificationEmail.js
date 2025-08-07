import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a verification email with a 6-digit code.
 * In test mode, it skips the actual send and logs the code.
 *
 * @param {string} email - Recipient email address.
 * @param {object} [options] - Options object.
 * @param {boolean} [options.test=false] - When true, skips sending and logs the code.
 * @returns {Promise<{ success: boolean, code: string }>}
 */
export async function sendVerificationEmail(email, { test = false } = {}) {
  const code = generateCode();
  // TODO: store `code` for later verification (e.g., in database or cache)
  if (test) {
    console.log(
      `[sendVerificationEmail] Test mode enabled. Generated code for ${email}: ${code}`
    );
    return { success: true, code };
  }

  const sesClient = new SESClient({ region: process.env.AWS_REGION });
  const params = {
    Source: process.env.SES_FROM_ADDRESS,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Your Verification Code' },
      Body: {
        Html: {
          Data: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #111827; text-align: center;">Verify your email</h2>
              <p style="color: #6b7280; text-align: center;">
                Enter the 6-digit code below to complete your signup.
              </p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 24px 0;">
                ${code}
              </div>
              <p style="color: #6b7280; text-align: center; font-size: 14px;">
                If you didn't request this, please ignore this email.
              </p>
            </div>
          `,
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    return { success: true, code };
  } catch (error) {
    console.error('SES send error:', error);
    throw new Error('Failed to send verification email');
  }
}
