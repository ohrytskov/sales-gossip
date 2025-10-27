import { rtdb } from '@/firebase/config'
import { ref, get, set, update } from 'firebase/database'
import { userPath } from './helpers'

function normalizePeopleList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') {
    const entries = Object.entries(value)
    const numeric = entries.every(([key]) => /^\d+$/.test(key))
    if (numeric) {
      return entries
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, uid]) => uid)
        .filter(Boolean)
    }
    return entries
      .filter(([, flag]) => Boolean(flag))
      .map(([uid]) => uid)
  }
  return []
}

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
  if (!snap || !snap.exists()) return null
  const val = snap.val()
  return {
    ...val,
    people: normalizePeopleList(val?.people)
  }
}

export async function setFollowing(uid, payload) {
  if (!uid) throw new Error('Missing uid')
  const normalized = {
    ...(payload || {}),
    people: normalizePeopleList(payload?.people)
  }
  return set(ref(rtdb, `${userPath(uid)}/following`), normalized)
}

export async function addFollowPerson(currentUid, targetUid) {
  if (!currentUid || !targetUid) throw new Error('Missing uid')

  // Get current following list
  const following = await getFollowing(currentUid)
  const peopleSet = new Set(normalizePeopleList(following?.people))

  if (peopleSet.has(targetUid)) {
    return
  }

  peopleSet.add(targetUid)

  // Add if not already following
  await setFollowing(currentUid, {
    ...(following || {}),
    people: Array.from(peopleSet),
    updatedAt: Date.now()
  })

  // Increment target user's followersCount
  await incrementFollowersCount(targetUid)
}

export async function removeFollowPerson(currentUid, targetUid) {
  if (!currentUid || !targetUid) throw new Error('Missing uid')

  // Get current following list
  const following = await getFollowing(currentUid)
  const peopleSet = new Set(normalizePeopleList(following?.people))

  if (!peopleSet.has(targetUid)) {
    return
  }

  // Remove if following
  peopleSet.delete(targetUid)

  // Update current user's following list
  await setFollowing(currentUid, {
    ...(following || {}),
    people: Array.from(peopleSet),
    updatedAt: Date.now()
  })

  // Decrement target user's followersCount
  await decrementFollowersCount(targetUid)
}

export async function incrementFollowersCount(uid) {
  if (!uid) throw new Error('Missing uid')
  const user = await getUser(uid)
  const currentCount = user?.public?.followersCount || 0
  return update(ref(rtdb, `${userPath(uid)}/public`), {
    followersCount: currentCount + 1
  })
}

export async function decrementFollowersCount(uid) {
  if (!uid) throw new Error('Missing uid')
  const user = await getUser(uid)
  const currentCount = user?.public?.followersCount || 0
  return update(ref(rtdb, `${userPath(uid)}/public`), {
    followersCount: Math.max(0, currentCount - 1)
  })
}
