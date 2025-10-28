import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'

function postPath(postId) {
  return `posts/${postId}`
}

export async function getPost(postId) {
  if (!postId) return null
  const snap = await get(ref(rtdb, postPath(postId)))
  return snap && snap.exists() ? snap.val() : null
}

export async function toggleLike(postId, userId) {
  if (!postId || !userId) throw new Error('Missing postId or userId')

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const likes = post.likes || 0
  const likedBy = post.likedBy || {}
  const userHasLiked = likedBy[userId] === true

  const updates = {}

  if (userHasLiked) {
    // Unlike: decrement likes and remove user from likedBy
    updates[`${postPath(postId)}/likes`] = Math.max(0, likes - 1)
    updates[`${postPath(postId)}/likedBy/${userId}`] = null
  } else {
    // Like: increment likes and add user to likedBy
    updates[`${postPath(postId)}/likes`] = likes + 1
    updates[`${postPath(postId)}/likedBy/${userId}`] = true
  }

  await update(ref(rtdb), updates)

  return !userHasLiked
}

export async function getUserLikedPosts(userId) {
  if (!userId) return []

  const postsSnap = await get(ref(rtdb, 'posts'))
  if (!postsSnap.exists()) return []

  const posts = postsSnap.val()
  const likedPostIds = []

  Object.entries(posts).forEach(([postId, post]) => {
    if (post.likedBy && post.likedBy[userId] === true) {
      likedPostIds.push(postId)
    }
  })

  return likedPostIds
}
