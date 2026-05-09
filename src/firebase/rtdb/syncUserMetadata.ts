import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'

/**
 * Sync user metadata - populate missing meta objects for users
 * Fixes users that don't have createdAt, lastLoginAt, provider, role fields
 * Returns number of users updated
 */
export async function syncUserMetadata() {
  console.log('Starting syncUserMetadata')

  // Get all users
  const usersSnap = await get(ref(rtdb, '/users'))
  if (!usersSnap.exists()) {
    console.log('No users found')
    return 0
  }

  const users = usersSnap.val()
  console.log(`Found ${Object.keys(users).length} users to check`)

  // Get all posts to calculate user activity
  const postsSnap = await get(ref(rtdb, '/posts'))
  const posts = postsSnap.exists() ? postsSnap.val() : {}

  const updates = {}
  let updateCount = 0

  for (const [userId, user] of Object.entries(users)) {
    const userMeta = user.meta || {}

    // Check if user is missing required meta fields
    const needsMeta = !userMeta.createdAt || !userMeta.lastLoginAt || !userMeta.provider || !userMeta.role

    if (needsMeta) {
      console.log(`User ${userId} (${user.public?.username || 'unknown'}) missing metadata`)

      // Calculate timestamps from user's posts
      const userPosts = Object.values(posts).filter(post => post.authorUid === userId)
      const postTimestamps = userPosts.map(post => new Date(post.createdAt).getTime()).filter(Boolean)

      const earliestPost = postTimestamps.length > 0 ? Math.min(...postTimestamps) : null
      const latestPost = postTimestamps.length > 0 ? Math.max(...postTimestamps) : null

      // Set reasonable defaults
      const now = Date.now()

      const metaUpdate = {
        createdAt: userMeta.createdAt || earliestPost || (now - 86400000), // 1 day ago if no posts
        lastLoginAt: userMeta.lastLoginAt || latestPost || earliestPost || now,
        provider: userMeta.provider || 'password', // Default to password auth
        role: userMeta.role || 'user' // Default to regular user
      }

      updates[`users/${userId}/meta`] = metaUpdate
      updateCount++

      console.log(`Will update ${userId} meta:`, metaUpdate)
    }
  }

  if (updateCount === 0) {
    console.log('No user metadata updates needed')
    return 0
  }

  await update(ref(rtdb), updates)
  console.log(`Applied ${updateCount} user metadata updates`)

  return updateCount
}