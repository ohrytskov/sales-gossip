import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'
import { createNotification } from './notifications'
import { getUser } from './users'

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

  // Create notification for post author when someone likes their post
  if (!userHasLiked && post.authorUid) {
    try {
      const actor = await getUser(userId)
      await createNotification({
        recipientUid: post.authorUid,
        type: 'like',
        actorUid: userId,
        actorUsername: actor?.public?.username || 'Someone',
        actorAvatar: actor?.public?.avatar || '',
        postId,
        postTitle: post.title || post.excerpt || 'your post'
      })
    } catch (error) {
      console.error('Failed to create like notification:', error)
      // Don't fail the like action if notification creation fails
    }
  }

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

export async function addComment(postId, userId, commentData) {
  if (!postId || !userId || !commentData) {
    throw new Error('Missing required parameters')
  }

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const commentId = Date.now().toString()
  const timestamp = new Date().toISOString()

  const comment = {
    id: commentId,
    userId,
    text: commentData.text,
    username: commentData.username,
    avatar: commentData.avatar,
    timestamp,
  }

  const commentsCount = post.commentsCount || 0
  const updates = {}
  updates[`${postPath(postId)}/comments/${commentId}`] = comment
  updates[`${postPath(postId)}/commentsCount`] = commentsCount + 1

  await update(ref(rtdb), updates)

  // Create notification for post author when someone comments
  if (post.authorUid) {
    try {
      await createNotification({
        recipientUid: post.authorUid,
        type: 'comment',
        actorUid: userId,
        actorUsername: commentData.username,
        actorAvatar: commentData.avatar,
        postId,
        postTitle: post.title || post.excerpt || 'your post',
        commentText: commentData.text
      })
    } catch (error) {
      console.error('Failed to create comment notification:', error)
      // Don't fail the comment action if notification creation fails
    }
  }

  return comment
}

export async function getComments(postId) {
  if (!postId) return []

  const post = await getPost(postId)
  if (!post || !post.comments) return []

  return Object.values(post.comments)
}

export async function deleteComment(postId, commentId) {
  if (!postId || !commentId) {
    throw new Error('Missing postId or commentId')
  }

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const commentsCount = post.commentsCount || 0
  const updates = {}
  updates[`${postPath(postId)}/comments/${commentId}`] = null
  updates[`${postPath(postId)}/commentsCount`] = Math.max(0, commentsCount - 1)

  await update(ref(rtdb), updates)
}
