import { rtdb } from '@/firebase/config'
import { ref, get, update, query, orderByChild, limitToLast } from 'firebase/database'
import { getUser } from './users'

function feedbackRootPath() {
  return 'feedback'
}

function feedbackItemPath(feedbackId) {
  return `${feedbackRootPath()}/${feedbackId}`
}

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

export async function logFeedback({
  message,
  userId,
  username,
  email,
  url,
  userAgent,
  metadata = {}
}) {
  const trimmedMessage = message?.trim()
  if (!trimmedMessage) {
    throw new Error('Missing feedback message')
  }

  const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const timestamp = new Date().toISOString()

  let finalUsername = username
  if (!finalUsername && userId) {
    finalUsername = await getUsernameFromUserId(userId)
  }

  const feedback = {
    id: feedbackId,
    message: trimmedMessage.substring(0, 2000),
    timestamp,
    userId: userId || null,
    username: finalUsername || null,
    email: email || null,
    url: url || null,
    userAgent: userAgent || null,
    metadata
  }

  const updates = {}
  updates[feedbackItemPath(feedbackId)] = feedback

  await update(ref(rtdb), updates)

  return feedback
}

export async function getFeedback({ limit = 200 } = {}) {
  try {
    const feedbackRef = ref(rtdb, feedbackRootPath())
    const feedbackQuery = query(feedbackRef, orderByChild('timestamp'), limitToLast(limit))

    const snap = await get(feedbackQuery)
    if (!snap || !snap.exists()) return []

    const entries = Object.values(snap.val())
    return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  } catch (e) {
    console.error('Failed to get feedback', e)
    return []
  }
}

