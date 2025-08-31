import { rtdb } from '@/firebase/config'
import { ref, get, set, update } from 'firebase/database'
import { userPath } from './helpers'

export async function getUser(uid) {
  if (!uid) return null
  const snap = await get(ref(rtdb, userPath(uid)))
  return snap && snap.exists() ? snap.val() : null
}

export async function createUserRecord(uid, userRecord) {
  if (!uid) throw new Error('Missing uid')
  return set(ref(rtdb, userPath(uid)), userRecord)
}

export async function updateUserPublic(uid, publicPatch) {
  if (!uid) throw new Error('Missing uid')
  return update(ref(rtdb, `${userPath(uid)}/public`), publicPatch)
}

export async function getFollowing(uid) {
  if (!uid) return null
  const snap = await get(ref(rtdb, `${userPath(uid)}/following`))
  return snap && snap.exists() ? snap.val() : null
}

export async function setFollowing(uid, payload) {
  if (!uid) throw new Error('Missing uid')
  return set(ref(rtdb, `${userPath(uid)}/following`), payload)
}

