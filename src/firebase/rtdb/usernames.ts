import { rtdb } from '@/firebase/config'
import { ref, get, set, update, runTransaction } from 'firebase/database'
import { sanitize, usersByUsernamePath } from './helpers'

export async function checkUsernameUnique(name: string): Promise<boolean | null> {
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

/**
 * Atomically claim a username for a uid. Returns true if the claim succeeded,
 * false if the key was already taken (or already owned by a different uid).
 * Uses runTransaction so two concurrent signups can't both win the same handle.
 */
export async function claimUsernameMapping(name: string, uid: string): Promise<boolean> {
  const key = sanitize(name)
  if (!key) throw new Error('Invalid username')
  const result = await runTransaction(
    ref(rtdb, usersByUsernamePath(key)),
    (current) => {
      if (current === null || current === undefined) return uid
      if (current === uid) return uid
      return // abort: someone else owns it
    },
  )
  return Boolean(result.committed) && result.snapshot.val() === uid
}

/**
 * @deprecated Use claimUsernameMapping for the create path; this helper does
 * not guard against races. Retained for callers that already verified uniqueness.
 */
export async function setUsernameMapping(name: string, uid: string) {
  const key = sanitize(name)
  if (!key) throw new Error('Invalid username')
  return set(ref(rtdb, usersByUsernamePath(key)), uid)
}

export async function removeUsernameMapping(name: string) {
  const key = sanitize(name)
  if (!key) return null
  return set(ref(rtdb, usersByUsernamePath(key)), null)
}

export async function saveUsername(uid: string, newUsername: string, oldUsername: string | null = null) {
  if (!uid) throw new Error('Missing uid')
  const key = sanitize(newUsername)
  if (!key) throw new Error('Invalid username')

  const claimed = await claimUsernameMapping(newUsername, uid)
  if (!claimed) {
    throw new Error('Username already taken')
  }

  const updates: Record<string, any> = {}
  updates[`users/${uid}/public/username`] = newUsername

  if (oldUsername) {
    const oldKey = sanitize(oldUsername)
    if (oldKey && oldKey !== key) updates[usersByUsernamePath(oldKey)] = null
  }

  return update(ref(rtdb), updates)
}
