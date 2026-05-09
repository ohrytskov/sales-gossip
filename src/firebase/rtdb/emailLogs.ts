import { rtdb } from '@/firebase/config'
import { ref, get, update, query, orderByChild, limitToLast } from 'firebase/database'
import { getUser } from './users'

function emailLogsPath() {
  return 'emailLogs'
}

function emailLogPath(emailLogId) {
  return `${emailLogsPath()}/${emailLogId}`
}

/**
 * Email log entry structure:
 * {
 *   id: string,
 *   type: 'verification' | 'contact' | 'reset_email' | 'general',
 *   recipient: string,
 *   sender: string,
 *   subject: string,
 *   content: string,
 *   status: 'sent' | 'failed' | 'test_mode',
 *   timestamp: ISO string,
 *   userId?: string, // optional - link to user account
 *   username?: string, // optional - username for easier research
 *   metadata?: object // additional context like error messages, IP, etc.
 * }
 */

/**
 * Log an email attempt to RTDB
 * @param {Object} params
 * @param {string} params.type - Type of email ('verification', 'contact', 'reset_email', 'general')
 * @param {string} params.recipient - Email recipient
 * @param {string} params.sender - Email sender
 * @param {string} params.subject - Email subject
 * @param {string} params.content - Email content
 * @param {string} params.status - Email status ('sent', 'failed', 'test_mode')
 * @param {string} [params.userId] - Associated user ID (optional)
 * @param {string} [params.username] - Associated username for easier research (optional)
 * @param {object} [params.metadata] - Additional metadata (optional)
 * @returns {Promise<Object>} The created email log entry
 */
export async function logEmail({
  type,
  recipient,
  sender,
  subject,
  content,
  status,
  userId,
  username,
  metadata = {}
}) {
  if (!type || !recipient || !sender || !subject || !status) {
    throw new Error('Missing required email log parameters')
  }

  const emailLogId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const timestamp = new Date().toISOString()

  // If username is not provided but userId is, try to fetch username
  let finalUsername = username
  if (!finalUsername && userId) {
    finalUsername = await getUsernameFromUserId(userId)
  }

  const emailLog = {
    id: emailLogId,
    type,
    recipient,
    sender,
    subject,
    content: content.substring(0, 1000), // Limit content to 1000 chars for storage
    status,
    timestamp,
    userId: userId || null,
    username: finalUsername || null,
    metadata
  }

  const updates = {}
  updates[emailLogPath(emailLogId)] = emailLog

  await update(ref(rtdb), updates)

  return emailLog
}

/**
 * Get email logs with optional filtering
 * @param {Object} options
 * @param {string} [options.type] - Filter by email type
 * @param {string} [options.recipient] - Filter by recipient
 * @param {string} [options.userId] - Filter by user ID
 * @param {string} [options.status] - Filter by status
 * @param {number} [options.limit=100] - Max number of logs to retrieve
 * @returns {Promise<Array>} Array of email logs
 */
export async function getEmailLogs({ type, recipient, userId, status, limit = 100 } = {}) {
  try {
    const logsRef = ref(rtdb, emailLogsPath())
    const logsQuery = query(
      logsRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    )

    const snap = await get(logsQuery)

    if (!snap || !snap.exists()) return []

    let logs = Object.values(snap.val())

    // Apply filters
    if (type) {
      logs = logs.filter(log => log.type === type)
    }
    if (recipient) {
      logs = logs.filter(log => log.recipient === recipient)
    }
    if (userId) {
      logs = logs.filter(log => log.userId === userId)
    }
    if (status) {
      logs = logs.filter(log => log.status === status)
    }

    // Sort by timestamp descending (newest first)
    return logs.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  } catch (e) {
    console.error('Failed to get email logs', e)
    return []
  }
}

/**
 * Get email logs for a specific user
 * @param {string} userId - User ID
 * @param {number} [limit=50] - Max number of logs to retrieve
 * @returns {Promise<Array>} Array of email logs for the user
 */
export async function getUserEmailLogs(userId, limit = 50) {
  return getEmailLogs({ userId, limit })
}

/**
 * Get email logs by type
 * @param {string} type - Email type ('verification', 'contact', 'reset_email', 'general')
 * @param {number} [limit=50] - Max number of logs to retrieve
 * @returns {Promise<Array>} Array of email logs of the specified type
 */
export async function getEmailLogsByType(type, limit = 50) {
  return getEmailLogs({ type, limit })
}

/**
 * Get email logs by status
 * @param {string} status - Email status ('sent', 'failed', 'test_mode')
 * @param {number} [limit=50] - Max number of logs to retrieve
 * @returns {Promise<Array>} Array of email logs with the specified status
 */
export async function getEmailLogsByStatus(status, limit = 50) {
  return getEmailLogs({ status, limit })
}

/**
 * Get username from userId (helper function)
 * @param {string} userId - User ID to get username for
 * @returns {Promise<string|null>} Username or null if not found
 */
async function getUsernameFromUserId(userId) {
  if (!userId) return null
  try {
    const user = await getUser(userId)
    return user?.public?.username || null
  } catch (e) {
    console.error('Failed to get username for userId:', userId, e)
    return null
  }
}

/**
 * Get email statistics
 * @returns {Promise<Object>} Email statistics object
 */
export async function getEmailStats() {
  try {
    const snap = await get(ref(rtdb, emailLogsPath()))

    if (!snap || !snap.exists()) {
      return {
        total: 0,
        sent: 0,
        failed: 0,
        test_mode: 0,
        byType: {},
        recent: []
      }
    }

    const logs = Object.values(snap.val())
    const stats = {
      total: logs.length,
      sent: logs.filter(log => log.status === 'sent').length,
      failed: logs.filter(log => log.status === 'failed').length,
      test_mode: logs.filter(log => log.status === 'test_mode').length,
      byType: {},
      recent: logs.slice(-10).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }

    // Count by type
    logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
    })

    return stats
  } catch (e) {
    console.error('Failed to get email stats', e)
    return {
      total: 0,
      sent: 0,
      failed: 0,
      test_mode: 0,
      byType: {},
      recent: []
    }
  }
}