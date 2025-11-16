
import { logEmail } from '@/firebase/rtdb/emailLogs'

/**
 * Sends a general email.
 * In test mode, it skips the actual send and logs the email details.
 *
 * @param {string} recipient - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} content - Email content.
 * @param {object} [options] - Options object.
 * @param {boolean} [options.test=false] - When true, skips sending and logs the email.
 * @param {string} [options.userId] - Associated user ID for logging (optional).
 * @returns {Promise<{ success: boolean }>}
 */
export async function sendEmail(recipient, subject, content, { test = false, userId } = {}) {
  const sender = { name: 'No Reply', addr: 'no-reply@sales-gossip.com' }

  if (test) {
    console.log(
      `[sendEmail] Test mode enabled. Would send email to ${recipient} with subject "${subject}" and content: ${content}`
    )

    // Log test mode email
    try {
      await logEmail({
        type: 'general',
        recipient,
        sender: sender.addr,
        subject,
        content,
        status: 'test_mode',
        userId,
        metadata: { testMode: true }
      })
    } catch (logError) {
      console.error('Failed to log test email:', logError)
    }

    return { success: true }
  }

  try {
    const res = await fetch('https://api.sales-gossip.com/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, recipient, subject, content })
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('send error:', text)
      throw new Error('Failed to send email')
    }

    // Log successful email send
    try {
      await logEmail({
        type: 'general',
        recipient,
        sender: sender.addr,
        subject,
        content,
        status: 'sent',
        userId,
        metadata: { apiResponseStatus: res.status }
      })
    } catch (logError) {
      console.error('Failed to log successful email:', logError)
    }

    return { success: true }
  } catch (error) {
    console.error('send error:', error)

    // Log failed email attempt
    try {
      await logEmail({
        type: 'general',
        recipient,
        sender: sender.addr,
        subject,
        content,
        status: 'failed',
        userId,
        metadata: { error: error.message }
      })
    } catch (logError) {
      console.error('Failed to log failed email:', logError)
    }

    throw new Error('Failed to send email')
  }
}