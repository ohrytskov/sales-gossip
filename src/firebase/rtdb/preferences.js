import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'
import { NOTIFICATION_KEYS } from './helpers'

export { NOTIFICATION_KEYS }

export async function getNotifications(uid) {
  if (!uid) return null
  try {
    const snap = await get(ref(rtdb, `users/${uid}/preferences/notifications/activity`))
    return snap && snap.exists() ? snap.val() : null
  } catch (e) {
    console.error('Failed to load notifications for', uid, e)
    return null
  }
}

export async function setNotifications(uid, activityObj) {
  if (!uid) throw new Error('Missing uid')
  const updates = {}
  updates[`users/${uid}/preferences/notifications/activity`] = activityObj
  updates[`users/${uid}/preferences/notifications/updatedAt`] = Date.now()
  return update(ref(rtdb), updates)
}

