import { logEmail } from '@/firebase/rtdb/emailLogs'

// using coldcall endpoint instead of AWS SES

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
 * @param {string} [options.userId] - Associated user ID for logging (optional).
 * @returns {Promise<{ success: boolean, code: string }>}
 */
export async function sendVerificationEmail(email, { test = false, userId } = {}) {
  const code = generateCode();
  // TODO: store `code` for later verification (e.g., in database or cache)

  const sender = { name: 'No Reply', addr: 'no-reply@sales-gossip.com' }
  const content = `Verify your email

Your verification code is: ${code}

If you didn't request this, please ignore this email`

  if (test) {
    console.log(
      `[sendVerificationEmail] Test mode enabled. Generated code for ${email}: ${code}`
    );

    // Log test mode verification email
    try {
      await logEmail({
        type: 'verification',
        recipient: email,
        sender: sender.addr,
        subject: 'Your Verification Code',
        content,
        status: 'test_mode',
        userId,
        metadata: { verificationCode: code, testMode: true }
      })
    } catch (logError) {
      console.error('Failed to log test verification email:', logError)
    }

    return { success: true, code };
  }

  try {
    const res = await fetch('https://api.sales-gossip.com/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, recipient: email, subject: 'Your Verification Code', content })
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('coldcall send error:', text)
      throw new Error('Failed to send verification email')
    }

    // Log successful verification email
    try {
      await logEmail({
        type: 'verification',
        recipient: email,
        sender: sender.addr,
        subject: 'Your Verification Code',
        content,
        status: 'sent',
        userId,
        metadata: { verificationCode: code, apiResponseStatus: res.status }
      })
    } catch (logError) {
      console.error('Failed to log successful verification email:', logError)
    }

    return { success: true, code }
  } catch (error) {
    console.error('coldcall send error:', error)

    // Log failed verification email attempt
    try {
      await logEmail({
        type: 'verification',
        recipient: email,
        sender: sender.addr,
        subject: 'Your Verification Code',
        content,
        status: 'failed',
        userId,
        metadata: { verificationCode: code, error: error.message }
      })
    } catch (logError) {
      console.error('Failed to log failed verification email:', logError)
    }

    throw new Error('Failed to send verification email')
  }
}
