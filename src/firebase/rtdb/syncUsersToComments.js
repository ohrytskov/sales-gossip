import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'

/**
 * Sync username and avatar updates from users to related comments.
 * Logs each planned update and applies batch updates.
 * Returns number of updates applied.
 */
export async function syncUsersToComments(uid) {
console.log('Starting syncUsersToComments', uid)
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
      if (!post.comments) continue
      for (const [commentId, comment] of Object.entries(post.comments)) {
        if (comment.userId === userId) {
          const prevU = comment.username
          const prevA = comment.avatar
          if (username && username !== prevU) {
            updates[`posts/${postId}/comments/${commentId}/username`] = username
            console.log(`Will update ${postId}/${commentId}.username: ${prevU} → ${username}`)
          }
          if (avatarUrl && avatarUrl !== prevA) {
            updates[`posts/${postId}/comments/${commentId}/avatar`] = avatarUrl
            console.log(`Will update ${postId}/${commentId}.avatar: ${prevA} → ${avatarUrl}`)
          }
        }
      }
    }
  }
  const count = Object.keys(updates).length
  if (count === 0) {
    console.log('No comment updates needed')
    return 0
  }
  await update(ref(rtdb), updates)
  console.log(`Applied ${count} updates to comments`)
  return count
}
