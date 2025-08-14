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

  const sender = { name: 'No Reply', addr: 'no-reply@coldcall.app' }
  const content = `Verify your email

Your verification code is: ${code}

If you didn't request this, please ignore this email`
  try {
    const res = await fetch('https://email2.coldcall.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, recipient: email, subject: 'Your Verification Code', content })
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('coldcall send error:', text)
      throw new Error('Failed to send verification email')
    }
    return { success: true, code }
  } catch (error) {
    console.error('coldcall send error:', error)
    throw new Error('Failed to send verification email')
  }
}
