
/**
 * Sends a general email.
 * In test mode, it skips the actual send and logs the email details.
 *
 * @param {string} recipient - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} content - Email content.
 * @param {object} [options] - Options object.
 * @param {boolean} [options.test=false] - When true, skips sending and logs the email.
 * @returns {Promise<{ success: boolean }>}
 */
export async function sendEmail(recipient, subject, content, { test = false } = {}) {
  if (test) {
    console.log(
      `[sendEmail] Test mode enabled. Would send email to ${recipient} with subject "${subject}" and content: ${content}`
    )
    return { success: true }
  }

  const sender = { name: 'No Reply', addr: 'no-reply@sales-gossip.com' }
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
    return { success: true }
  } catch (error) {
    console.error('send error:', error)
    throw new Error('Failed to send email')
  }
}