import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'
import { NOTIFICATION_KEYS } from './helpers'

export { NOTIFICATION_KEYS }

export async function getNotifications(uid: string): Promise<Record<string, any> | null> {
  if (!uid) return null
  try {
    const snap = await get(ref(rtdb, `users/${uid}/preferences/notifications/activity`))
    return snap && snap.exists() ? (snap.val() as Record<string, any>) : null
  } catch (e) {
    console.error('Failed to load notifications for', uid, e)
    return null
  }
}

export async function setNotifications(uid: string, activityObj: Record<string, any>) {
  if (!uid) throw new Error('Missing uid')
  const updates: Record<string, any> = {}
  updates[`users/${uid}/preferences/notifications/activity`] = activityObj
  updates[`users/${uid}/preferences/notifications/updatedAt`] = Date.now()
  return update(ref(rtdb), updates)
}

