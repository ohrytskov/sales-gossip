import { rtdb } from '@/firebase/config'
import { ref, get, set } from 'firebase/database'
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

