import { rtdb } from '@/firebase/config'
import { ref, get, set, update, increment } from 'firebase/database'
import { userPath } from './helpers'
import { createNotification } from './notifications'

function normalizePeopleList(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const numeric = entries.every(([key]) => /^\d+$/.test(key))
    if (numeric) {
      return entries
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, uid]) => uid as string)
        .filter(Boolean)
    }
    return entries
      .filter(([, flag]) => Boolean(flag))
      .map(([uid]) => uid)
  }
  return []
}

export async function getUser(uid: string): Promise<Record<string, any> | null> {
  if (!uid) return null
  const snap = await get(ref(rtdb, userPath(uid)))
  return snap && snap.exists() ? (snap.val() as Record<string, any>) : null
}

export async function createUserRecord(uid: string, userRecord: Record<string, any>) {
  if (!uid) throw new Error('Missing uid')
  return set(ref(rtdb, userPath(uid)), {
    ...(userRecord || {}),
    uid
  })
}

export async function updateUserPublic(uid: string, publicPatch: Record<string, any>) {
  if (!uid) throw new Error('Missing uid')
  return update(ref(rtdb, `${userPath(uid)}/public`), publicPatch)
}

export async function getFollowing(uid: string): Promise<Record<string, any> | null> {
  if (!uid) return null
  const snap = await get(ref(rtdb, `${userPath(uid)}/following`))
  if (!snap || !snap.exists()) return null
  const val = (snap.val() as Record<string, any>)
  return {
    ...val,
    people: normalizePeopleList(val?.people)
  }
}

export async function setFollowing(uid: string, payload: Record<string, any>) {
  if (!uid) throw new Error('Missing uid')
  const normalized = {
    ...(payload || {}),
    people: normalizePeopleList(payload?.people)
  }
  return set(ref(rtdb, `${userPath(uid)}/following`), normalized)
}

export async function addFollowPerson(currentUid: string, targetUid: string) {
  if (!currentUid || !targetUid) throw new Error('Missing uid')
  if (currentUid === targetUid) throw new Error('Cannot follow yourself')

  const following = await getFollowing(currentUid)
  const peopleSet = new Set(normalizePeopleList(following?.people))

  if (peopleSet.has(targetUid)) {
    return
  }

  peopleSet.add(targetUid)

  const updates: Record<string, any> = {
    [`${userPath(currentUid)}/following/people`]: Array.from(peopleSet),
    [`${userPath(currentUid)}/following/updatedAt`]: Date.now(),
    [`${userPath(targetUid)}/public/followersCount`]: increment(1),
  }

  await update(ref(rtdb), updates)

  // Create notification for the followed user (best-effort, must not roll back the follow)
  try {
    const actor = await getUser(currentUid)
    await createNotification({
      recipientUid: targetUid,
      type: 'follow',
      actorUid: currentUid,
      actorUsername: actor?.public?.username || 'Someone',
      actorAvatar: actor?.public?.avatar || ''
    })
  } catch (error) {
    console.error('Failed to create follow notification:', error)
  }
}

export async function removeFollowPerson(currentUid: string, targetUid: string) {
  if (!currentUid || !targetUid) throw new Error('Missing uid')
  if (currentUid === targetUid) return

  const following = await getFollowing(currentUid)
  const peopleSet = new Set(normalizePeopleList(following?.people))

  if (!peopleSet.has(targetUid)) {
    return
  }

  peopleSet.delete(targetUid)

  const updates: Record<string, any> = {
    [`${userPath(currentUid)}/following/people`]: Array.from(peopleSet),
    [`${userPath(currentUid)}/following/updatedAt`]: Date.now(),
    [`${userPath(targetUid)}/public/followersCount`]: increment(-1),
  }

  await update(ref(rtdb), updates)
}

export async function incrementFollowersCount(uid: string) {
  if (!uid) throw new Error('Missing uid')
  return update(ref(rtdb, `${userPath(uid)}/public`), {
    followersCount: increment(1)
  })
}

export async function decrementFollowersCount(uid: string) {
  if (!uid) throw new Error('Missing uid')
  return update(ref(rtdb, `${userPath(uid)}/public`), {
    followersCount: increment(-1)
  })
}

export async function recalculateFollowersCount() {
  const snap = await get(ref(rtdb, '/users'))
  if (!snap || !snap.exists()) return
  const users = (snap.val() as Record<string, any>) || {}
  const followersMap = {}

  Object.values(users).forEach(user => {
    const followingPeople = normalizePeopleList(user?.following?.people)
    followingPeople.forEach(uid => {
      if (!uid) return
      followersMap[uid] = (followersMap[uid] || 0) + 1
    })
  })

  const updates = {}
  Object.entries(users).forEach(([maybeUid, user]: [string, any]) => {
    const uid = user?.uid || maybeUid
    if (!uid) return
    updates[`${userPath(uid)}/public/followersCount`] = followersMap[uid] || 0
  })

  if (!Object.keys(updates).length) return
  return update(ref(rtdb), updates)
}
