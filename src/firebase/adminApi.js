import { auth } from '@/firebase/config'
import { logEmail } from '@/firebase/rtdb/emailLogs'

const BASE = 'https://us-central1-coldcall-48def.cloudfunctions.net/api'

async function post(path, payload) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken(true) : null;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function resetEmail(userId, newEmail) {
  try {
    const result = await post('/resetEmail', { userId, newEmail })

    // Log successful email reset
    try {
      await logEmail({
        type: 'reset_email',
        recipient: newEmail,
        sender: 'system@sales-gossip.com',
        subject: 'Email Address Changed',
        content: `Your email address has been changed. If you didn't request this change, please contact support.`,
        status: 'sent',
        userId,
        metadata: {
          previousEmail: 'unknown', // Could be enhanced to track previous email
          resetType: 'admin_reset'
        }
      })
    } catch (logError) {
      console.error('Failed to log email reset:', logError)
    }

    return result
  } catch (error) {
    // Log failed email reset attempt
    try {
      await logEmail({
        type: 'reset_email',
        recipient: newEmail,
        sender: 'system@sales-gossip.com',
        subject: 'Email Address Change Failed',
        content: `Attempted to change email address. If you didn't request this change, please contact support.`,
        status: 'failed',
        userId,
        metadata: {
          error: error.message,
          resetType: 'admin_reset'
        }
      })
    } catch (logError) {
      console.error('Failed to log failed email reset:', logError)
    }

    throw error
  }
}

export function resetPassword(userId, newPassword) {
  return post('/resetPassword', { userId, newPassword })
}

