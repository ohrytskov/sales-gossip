import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'
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

function uniquePeople(value) {
  return Array.from(new Set(normalizePeopleList(value)))
}

export async function syncUserStats() {
  console.log('Starting syncUserStats')

  const [usersSnap, postsSnap] = await Promise.all([
    get(ref(rtdb, '/users')),
    get(ref(rtdb, '/posts'))
  ])

  if (!usersSnap.exists()) {
    console.log('No users found')
    return 0
  }

  const users = usersSnap.val()
  const posts = postsSnap.exists() ? postsSnap.val() : {}

  const canonicalUsers = {}
  Object.entries(users).forEach(([maybeUid, value]) => {
    const uid = value?.uid || maybeUid
    if (!uid) return
    canonicalUsers[uid] = value
  })

  console.log(
    `Found ${Object.keys(canonicalUsers).length} users and ${
      Object.keys(posts).length
    } posts`
  )

  const postCounts = {}
  Object.values(posts).forEach(post => {
    const authorUid = post?.authorUid
    if (!authorUid) return
    postCounts[authorUid] = (postCounts[authorUid] || 0) + 1
  })

  const followersMap = {}
  const followingCounts = {}
  const updates = {}

  Object.entries(canonicalUsers).forEach(([uid, user]) => {
    const username = user?.public?.username || user?.displayName || 'unknown'
    const followingPeople = uniquePeople(user?.following?.people)
    const existingTargets = followingPeople.filter(targetUid => Boolean(canonicalUsers[targetUid]))
    const missingTargets = followingPeople.filter(targetUid => targetUid && !canonicalUsers[targetUid])

    followingCounts[uid] = existingTargets.length
    existingTargets.forEach(targetUid => {
      followersMap[targetUid] = (followersMap[targetUid] || 0) + 1
    })

    if (missingTargets.length) {
      console.log(
        `User ${uid} (${username}) references missing users: ${missingTargets.join(', ')}`
      )
      updates[`${userPath(uid)}/following/people`] = existingTargets
    }
  })

  let diffCount = 0

  Object.entries(canonicalUsers).forEach(([uid, user]) => {
    const username = user?.public?.username || user?.displayName || 'unknown'
    const currentPosts = user?.public?.postsCount ?? 0
    const currentFollowers = user?.public?.followersCount ?? 0
    const recalculatedPosts = postCounts[uid] || 0
    const recalculatedFollowers = followersMap[uid] || 0
    const followingCount = followingCounts[uid] || 0

    const userMessages = []

    if (currentPosts !== recalculatedPosts) {
      updates[`${userPath(uid)}/public/postsCount`] = recalculatedPosts
      userMessages.push(`posts ${currentPosts} → ${recalculatedPosts}`)
    } else {
      userMessages.push(`posts ${currentPosts}`)
    }

    if (currentFollowers !== recalculatedFollowers) {
      updates[`${userPath(uid)}/public/followersCount`] = recalculatedFollowers
      userMessages.push(`followers ${currentFollowers} → ${recalculatedFollowers}`)
    } else {
      userMessages.push(`followers ${currentFollowers}`)
    }

    userMessages.push(`following ${followingCount}`)

    console.log(`User ${uid} (${username}): ${userMessages.join(', ')}`)

    if (currentPosts !== recalculatedPosts || currentFollowers !== recalculatedFollowers) {
      diffCount += 1
    }
  })

  if (!Object.keys(updates).length) {
    console.log('No user stat changes required')
    return 0
  }

  await update(ref(rtdb), updates)
  console.log(`Applied ${Object.keys(updates).length} stat updates across ${diffCount} users`)
  return Object.keys(updates).length
}
