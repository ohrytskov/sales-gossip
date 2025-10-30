import { rtdb } from '@/firebase/config'
import { ref, get, update, query, orderByChild, limitToLast } from 'firebase/database'
import { getNotifications as getUserNotificationPreferences } from './preferences'

function notificationsPath(uid) {
  return `notifications/${uid}`
}

function notificationPath(uid, notificationId) {
  return `${notificationsPath(uid)}/${notificationId}`
}

/**
 * Create a notification for a user
 * @param {Object} params
 * @param {string} params.recipientUid - User who will receive the notification
 * @param {string} params.type - Type of notification (like, comment, follow)
 * @param {string} params.actorUid - User who performed the action
 * @param {string} params.actorUsername - Username of actor
 * @param {string} params.actorAvatar - Avatar URL of actor
 * @param {string} [params.postId] - Post ID (for like/comment notifications)
 * @param {string} [params.postTitle] - Post title (for like/comment notifications)
 * @param {string} [params.commentText] - Comment text (for comment notifications)
 */
export async function createNotification({
  recipientUid,
  type,
  actorUid,
  actorUsername,
  actorAvatar,
  postId,
  postTitle,
  commentText
}) {
  if (!recipientUid || !type || !actorUid) {
    throw new Error('Missing required notification parameters')
  }

  // Don't notify users about their own actions
  if (recipientUid === actorUid) {
    //return null
  }

  // Check if user has this notification type enabled
  const preferences = await getUserNotificationPreferences(recipientUid)
  const preferenceMap = {
    like: 'likes',
    comment: 'comments',
    follow: 'newFollowers'
  }

  const preferenceKey = preferenceMap[type]
  if (preferences && preferences[preferenceKey] === false) {
    // User has disabled this notification type
    return null
  }

  const notificationId = Date.now().toString()
  const timestamp = new Date().toISOString()

  const notification = {
    id: notificationId,
    type,
    actorUid,
    actorUsername,
    actorAvatar,
    timestamp,
    read: false
  }

  if (postId) notification.postId = postId
  if (postTitle) notification.postTitle = postTitle
  if (commentText) notification.commentText = commentText

  const updates = {}
  updates[notificationPath(recipientUid, notificationId)] = notification

  await update(ref(rtdb), updates)

  return notification
}

/**
 * Get all notifications for a user
 * @param {string} uid - User ID
 * @param {number} [limit=50] - Max number of notifications to retrieve
 * @returns {Promise<Array>} Array of notifications
 */
export async function getUserNotifications(uid, limit = 50) {
  if (!uid) return []

  try {
    const notificationsRef = ref(rtdb, notificationsPath(uid))
    const notificationsQuery = query(
      notificationsRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    )

    const snap = await get(notificationsQuery)

    if (!snap || !snap.exists()) return []

    const notifications = Object.values(snap.val())

    // Sort by timestamp descending (newest first)
    return notifications.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  } catch (e) {
    console.error('Failed to get notifications for', uid, e)
    return []
  }
}

/**
 * Get count of unread notifications for a user
 * @param {string} uid - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadCount(uid) {
  if (!uid) return 0

  try {
    const snap = await get(ref(rtdb, notificationsPath(uid)))

    if (!snap || !snap.exists()) return 0

    const notifications = Object.values(snap.val())
    return notifications.filter(n => !n.read).length
  } catch (e) {
    console.error('Failed to get unread count for', uid, e)
    return 0
  }
}

/**
 * Mark a notification as read
 * @param {string} uid - User ID
 * @param {string} notificationId - Notification ID
 */
export async function markAsRead(uid, notificationId) {
  if (!uid || !notificationId) {
    throw new Error('Missing uid or notificationId')
  }

  const updates = {}
  updates[`${notificationPath(uid, notificationId)}/read`] = true

  await update(ref(rtdb), updates)
}

/**
 * Mark all notifications as read for a user
 * @param {string} uid - User ID
 */
export async function markAllAsRead(uid) {
  if (!uid) throw new Error('Missing uid')

  try {
    const snap = await get(ref(rtdb, notificationsPath(uid)))

    if (!snap || !snap.exists()) return

    const notifications = snap.val()
    const updates = {}

    Object.keys(notifications).forEach(notificationId => {
      if (!notifications[notificationId].read) {
        updates[`${notificationPath(uid, notificationId)}/read`] = true
      }
    })

    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates)
    }
  } catch (e) {
    console.error('Failed to mark all as read for', uid, e)
  }
}

/**
 * Delete a notification
 * @param {string} uid - User ID
 * @param {string} notificationId - Notification ID
 */
export async function deleteNotification(uid, notificationId) {
  if (!uid || !notificationId) {
    throw new Error('Missing uid or notificationId')
  }

  const updates = {}
  updates[notificationPath(uid, notificationId)] = null

  await update(ref(rtdb), updates)
}
