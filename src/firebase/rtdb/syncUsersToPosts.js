import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'

/**
 * Sync username and avatar updates from users to related posts.
 * Logs each planned update and applies batch updates.
 * Returns number of updates applied.
 */
export async function syncUsersToPosts() {
  console.log('Starting syncUsersToPosts', uid)
  let users = {}
  if (uid) {
    const userSnap = await get(ref(rtdb, `/users/${uid}`))
    if (userSnap.exists()) {
      users[uid] = userSnap.val()
    }
  } else {
    const usersSnap = await get(ref(rtdb, '/users'))
    users = usersSnap.exists() ? usersSnap.val() : {}
  }
  const postsSnap = await get(ref(rtdb, '/posts'))
  const posts = postsSnap.exists() ? postsSnap.val() : {}
  const updates = {}
  for (const [userId, user] of Object.entries(users)) {
    const pub = user.public || {}
    const username = pub.username
    const avatarUrl = pub.avatarUrl
    if (!username && !avatarUrl) continue
    for (const [postId, post] of Object.entries(posts)) {
      if (post.authorUid === userId) {
        const prevU = post.username
        const prevA = post.avatar
        if (username && username !== prevU) {
          updates[`posts/${postId}/username`] = username
          console.log(`Will update ${postId}.username: ${prevU} → ${username}`)
        }
        if (avatarUrl && avatarUrl !== prevA) {
          updates[`posts/${postId}/avatar`] = avatarUrl
          console.log(`Will update ${postId}.avatar: ${prevA} → ${avatarUrl}`)
        }
      }
    }
  }
  const count = Object.keys(updates).length
  if (count === 0) {
    console.log('No post updates needed')
    return 0
  }
  await update(ref(rtdb), updates)
  console.log(`Applied ${count} updates to posts`)
  return count
}
