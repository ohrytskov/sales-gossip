import { rtdb } from '@/firebase/config'
import { ref, get } from 'firebase/database'
import { sendEmail } from '@/utils/sendEmail'

/**
 * @typedef {string[]} ReportEmailsArray
 * Array of email addresses that receive moderation reports.
 * Each email should be a valid email address string.
 * Example: ["moderator@corpgossip.com", "admin@corpgossip.com"]
 */

/**
 * Get the list of email addresses that should receive reports
 * @returns {Promise<ReportEmailsArray>} Array of validated email addresses
 */
export async function getReportEmails() {
  try {
    const snap = await get(ref(rtdb, 'reportToEmails'))
    if (!snap || !snap.exists()) {
      console.warn('No report emails configured in RTDB at /reportToEmails')
      return []
    }

    const emails = snap.val()
    if (!Array.isArray(emails)) {
      console.warn('Report emails in RTDB is not an array:', emails)
      return []
    }

    // Filter out any invalid emails
    return emails.filter(email => email && typeof email === 'string' && email.includes('@'))
  } catch (error) {
    console.error('Failed to get report emails from RTDB:', error)
    return []
  }
}

/**
 * Send a report to all configured email addresses
 * @param {Object} reportData
 * @param {string} reportData.type - Type of report ('comment' | 'user' | 'post')
 * @param {string} reportData.reporterUid - UID of the user making the report
 * @param {string} reportData.reporterUsername - Username of the reporter
 * @param {string} reportData.targetId - ID of the item being reported
 * @param {string} reportData.targetUsername - Username of the reported user (if applicable)
 * @param {string} reportData.reason - Reason for the report (optional)
 * @param {string} reportData.details - Additional details about the report
 * @param {string} reportData.url - URL where the reported content can be found
 * @returns {Promise<Object>} Report result with success/failure counts
 */
export async function sendReport({
  type,
  reporterUid,
  reporterUsername,
  targetId,
  targetUsername,
  reason = 'No reason provided',
  details,
  url
}) {
  try {
    const reportEmails = await getReportEmails()

    if (reportEmails.length === 0) {
      console.warn('No report emails configured - cannot send report')
      return {
        success: false,
        error: 'No report emails configured',
        sentCount: 0,
        totalCount: 0
      }
    }

    // Create the report email content
    const subject = `SalesGossip Report: ${type.charAt(0).toUpperCase() + type.slice(1)} Report`

    const emailContent = `
A ${type} has been reported on SalesGossip.

Report Details:
- Type: ${type}
- Reported by: ${reporterUsername || 'Anonymous'} (${reporterUid})
- Target: ${targetUsername ? `${targetUsername} (${targetId})` : targetId}
- Reason: ${reason}
- URL: ${url}
- Additional Details: ${details || 'None provided'}

Please review this report and take appropriate action.

This is an automated message from SalesGossip reporting system.
    `.trim()

    // Send email to each configured address
    // Log From and To addresses for each report email
    const results = await Promise.allSettled(
      reportEmails.map(email => {
        console.log(`Report email: From no-reply@corpgossip.com -> To ${email}`)
        return sendEmail(email, subject, emailContent, { userId: reporterUid })
      })
    )

    const sentCount = results.filter(result => result.status === 'fulfilled').length
    const failedCount = results.filter(result => result.status === 'rejected').length

    console.log(`Report sent to ${sentCount}/${reportEmails.length} email addresses`)

    if (failedCount > 0) {
      console.error(`Failed to send report to ${failedCount} email addresses:`,
        results.filter(r => r.status === 'rejected').map(r => r.reason)
      )
    }

    return {
      success: sentCount > 0,
      sentCount,
      totalCount: reportEmails.length,
      failedCount
    }

  } catch (error) {
    console.error('Failed to send report:', error)
    return {
      success: false,
      error: error.message,
      sentCount: 0,
      totalCount: 0
    }
  }
}
