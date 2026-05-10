import { rtdb } from '@/firebase/config'
import { ref, get, update, push, increment } from 'firebase/database'
import { createNotification } from './notifications'
import { getUser } from './users'
import { removePostFromCompany } from './companies'

function postPath(postId: string): string {
  return `posts/${postId}`
}

export async function getPost(postId: string): Promise<Record<string, any> | null> {
  if (!postId) return null
  const snap = await get(ref(rtdb, postPath(postId)))
  return snap && snap.exists() ? (snap.val() as Record<string, any>) : null
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  if (!postId || !userId) throw new Error('Missing postId or userId')

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const likedBy = post.likedBy || {}
  const userHasLiked = likedBy[userId] === true

  const updates: Record<string, any> = {}

  if (userHasLiked) {
    updates[`${postPath(postId)}/likes`] = increment(-1)
    updates[`${postPath(postId)}/likedBy/${userId}`] = null
  } else {
    updates[`${postPath(postId)}/likes`] = increment(1)
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

export async function toggleCommentLike(postId: string, commentId: string, userId: string): Promise<boolean> {
  if (!postId || !commentId || !userId) throw new Error('Missing postId, commentId, or userId')

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const comment = post.comments?.[commentId]
  if (!comment) throw new Error('Comment not found')

  const likedBy = comment.likedBy || {}
  const userHasLiked = likedBy[userId] === true

  const updates: Record<string, any> = {}

  if (userHasLiked) {
    updates[`${postPath(postId)}/comments/${commentId}/likes`] = increment(-1)
    updates[`${postPath(postId)}/comments/${commentId}/likedBy/${userId}`] = null
  } else {
    updates[`${postPath(postId)}/comments/${commentId}/likes`] = increment(1)
    updates[`${postPath(postId)}/comments/${commentId}/likedBy/${userId}`] = true
  }

  await update(ref(rtdb), updates)

  // Create notification for comment author when someone likes their comment
  if (!userHasLiked && comment.userId) {
    try {
      const actor = await getUser(userId)
      await createNotification({
        recipientUid: comment.userId,
        type: 'comment_like',
        actorUid: userId,
        actorUsername: actor?.public?.username || 'Someone',
        actorAvatar: actor?.public?.avatar || '',
        postId,
        postTitle: post.title || post.excerpt || 'your post',
        commentText: comment.text
      })
    } catch (error) {
      console.error('Failed to create comment like notification:', error)
      // Don't fail the like action if notification creation fails
    }
  }

  return !userHasLiked
}

export async function getUserLikedPosts(userId: string): Promise<string[]> {
  if (!userId) return []

  const postsSnap = await get(ref(rtdb, 'posts'))
  if (!postsSnap.exists()) return []

  const posts = postsSnap.val() as Record<string, any>
  const likedPostIds: string[] = []

  Object.entries(posts).forEach(([postId, post]: [string, any]) => {
    if (post.likedBy && post.likedBy[userId] === true) {
      likedPostIds.push(postId)
    }
  })

  return likedPostIds
}

type CommentData = {
  text: string
  username: string
  avatar: string
}

export async function addComment(postId: string, userId: string, commentData: CommentData) {
  if (!postId || !userId || !commentData) {
    throw new Error('Missing required parameters')
  }

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const commentId = push(ref(rtdb, `${postPath(postId)}/comments`)).key
  if (!commentId) throw new Error('Failed to allocate comment id')
  const timestamp = new Date().toISOString()

  const comment = {
    id: commentId,
    userId,
    text: commentData.text,
    username: commentData.username,
    avatar: commentData.avatar,
    timestamp,
  }

  const updates: Record<string, any> = {}
  updates[`${postPath(postId)}/comments/${commentId}`] = comment
  updates[`${postPath(postId)}/commentsCount`] = increment(1)

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

export async function getComments(postId: string): Promise<Array<Record<string, any>>> {
  if (!postId) return []

  const post = await getPost(postId)
  if (!post || !post.comments) return []

  return Object.values(post.comments as Record<string, Record<string, any>>)
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  if (!postId || !commentId) {
    throw new Error('Missing postId or commentId')
  }

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')
  if (!post.comments?.[commentId]) return

  const updates: Record<string, any> = {}
  updates[`${postPath(postId)}/comments/${commentId}`] = null
  updates[`${postPath(postId)}/commentsCount`] = increment(-1)

  await update(ref(rtdb), updates)
}

export async function deletePost(postId: string): Promise<void> {
  if (!postId) {
    throw new Error('Missing postId')
  }

  const post = await getPost(postId)
  if (!post) throw new Error('Post not found')

  const updates = {}
  updates[postPath(postId)] = null
  await update(ref(rtdb), updates)

  if (post.companyId) {
    try {
      await removePostFromCompany(post.companyId, postId)
    } catch (err) {
      console.error('Failed to remove post from company index:', err)
    }
  }
}
