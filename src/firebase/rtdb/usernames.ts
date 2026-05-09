import { rtdb } from '@/firebase/config'
import { ref, get, set, update } from 'firebase/database'
import { sanitize, usersByUsernamePath } from './helpers'

export async function checkUsernameUnique(name) {
  const key = sanitize(name)
  if (!key) return false
  try {
    const snap = await get(ref(rtdb, usersByUsernamePath(key)))
    return !snap.exists()
  } catch (e) {
    console.error('Failed to check username uniqueness:', e)
    return null
  }
}

export async function setUsernameMapping(name, uid) {
  const key = sanitize(name)
  if (!key) throw new Error('Invalid username')
  return set(ref(rtdb, usersByUsernamePath(key)), uid)
}

export async function removeUsernameMapping(name) {
  const key = sanitize(name)
  if (!key) return null
  return set(ref(rtdb, usersByUsernamePath(key)), null)
}

export async function saveUsername(uid, newUsername, oldUsername = null) {
  if (!uid) throw new Error('Missing uid')
  const key = sanitize(newUsername)
  if (!key) throw new Error('Invalid username')

  const updates = {}
  updates[usersByUsernamePath(key)] = uid
  updates[`users/${uid}/public/username`] = newUsername

  if (oldUsername) {
    const oldKey = sanitize(oldUsername)
    if (oldKey && oldKey !== key) updates[usersByUsernamePath(oldKey)] = null
  }

  return update(ref(rtdb), updates)
}
