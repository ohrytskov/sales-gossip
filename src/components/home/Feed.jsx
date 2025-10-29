// components/home/Feed.jsx
import { useState, useEffect } from 'react'
import FeedPost from './FeedPost'
import FeedFilterBar from './FeedFilterBar'
import useRtdbDataKey from '@/hooks/useRtdbData'
import { useAuth } from '@/hooks/useAuth'
import { getFollowing, addFollowPerson, removeFollowPerson } from '@/firebase/rtdb/users'
import { toggleLike, addComment } from '@/firebase/rtdb/posts'

// Parse an ISO timestamp (createdAt or timestamp) into milliseconds
// We expect `createdAt` to be an ISO datetime string; no heuristics/fallbacks
function getCreatedAtMs(post) {
  const val = (post && (post.createdAt || post.timestamp)) || ''
  const parsed = Date.parse(val)
  return isNaN(parsed) ? 0 : parsed
}

export default function Feed() {
  const { user } = useAuth()
  //const { data: sampleFeed } = useRtdbDataKey('sampleFeed')
  const { data: sampleFeed } = useRtdbDataKey('posts')
  const [followingPeople, setFollowingPeople] = useState([])
  const [loadingFollowState, setLoadingFollowState] = useState(null)
  const [loadingLikeState, setLoadingLikeState] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('New')

  // Load current user's following list on mount
  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?.uid) return
      try {
        const following = await getFollowing(user.uid)
        setFollowingPeople(following?.people ?? [])
      } catch (err) {
        console.error('Error loading following list:', err)
      }
    }
    loadFollowing()
  }, [user?.uid])

  const handleFollow = async (authorUid, postId) => {
    if (!user?.uid) {
      console.warn('User not logged in')
      return
    }
    if (loadingFollowState?.uid === authorUid) return
    try {
      setLoadingFollowState({ uid: authorUid, postId })
      await addFollowPerson(user.uid, authorUid)
      setFollowingPeople((prev) => {
        if (prev.includes(authorUid)) return prev
        return [...prev, authorUid]
      })
    } catch (err) {
      console.error('Error following user:', err)
    } finally {
      setLoadingFollowState(null)
    }
  }

  const handleUnfollow = async (authorUid, postId) => {
    if (!user?.uid) {
      console.warn('User not logged in')
      return
    }
    if (loadingFollowState?.uid === authorUid) return
    try {
      setLoadingFollowState({ uid: authorUid, postId })
      await removeFollowPerson(user.uid, authorUid)
      setFollowingPeople((prev) => prev.filter((uid) => uid !== authorUid))
    } catch (err) {
      console.error('Error unfollowing user:', err)
    } finally {
      setLoadingFollowState(null)
    }
  }

  const toggleFollow = (authorUid, postId) => {
    if (!user?.uid) {
      console.warn('User not logged in - cannot follow/unfollow')
      return
    }
    if (!authorUid) {
      console.warn('Missing author uid - cannot follow/unfollow')
      return
    }
    if (loadingFollowState?.uid === authorUid) return
    if (followingPeople.includes(authorUid)) {
      handleUnfollow(authorUid, postId)
    } else {
      handleFollow(authorUid, postId)
    }
  }

  const handleLike = async (postId) => {
    if (!user?.uid) {
      console.warn('User not logged in')
      return
    }
    if (loadingLikeState === postId) return
    try {
      setLoadingLikeState(postId)
      await toggleLike(postId, user.uid)
    } catch (err) {
      console.error('Error toggling like:', err)
    } finally {
      setLoadingLikeState(null)
    }
  }

  const handleComment = async (postId, text) => {
    if (!user?.uid) {
      console.warn('User not logged in')
      return
    }
    try {
      await addComment(postId, user.uid, {
        text,
        username: user.displayName || 'Anonymous',
        avatar: user.photoURL || '/default-avatar.png',
      })
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  // derive list of all tags and filter posts by selected tags
  //const feed = sampleFeed || []
  const feed = sampleFeed ? Object.values(sampleFeed) : [];

  const availableTags = Array.from(new Set(feed.flatMap((post) => post.tags || [])));
  const filteredPosts = feed.filter(
    (post) =>
      selectedTags.length === 0 ||
      (post.tags || []).some((tag) => selectedTags.includes(tag))
  );
  // sort posts according to selected sort option

  const sortedPosts = [...filteredPosts]
  if (sortBy === 'New') {
    // newest first (desc)
    sortedPosts.sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a))
  } else if (sortBy === 'Top') {
    sortedPosts.sort((a, b) => b.likes - a.likes)
  } else if (sortBy === 'Rising') {
    sortedPosts.sort((a, b) => b.commentsCount - a.commentsCount)
  }

  return (
    <div className="flex flex-col ">
      <FeedFilterBar
        availableTags={availableTags}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {sortedPosts.map((post) => (
        <FeedPost
          key={post.id}
          {...post}
          comments={post.comments ? Object.values(post.comments) : []}
          isFollowed={followingPeople.includes(post.authorUid)}
          isLoadingFollow={loadingFollowState?.postId === post.id}
          isFollowActionPending={loadingFollowState?.uid === post.authorUid}
          onFollow={() => toggleFollow(post.authorUid, post.id)}
          isLiked={post.likedBy?.[user?.uid] === true}
          isLoadingLike={loadingLikeState === post.id}
          onLike={() => handleLike(post.id)}
          onComment={handleComment}
        />
      ))}

      {/* Rounded footer */}
      <div className="w-[684px] h-4 relative bg-white border border-t-0 mt-[-1px] mb-10 border-gray-200 rounded-bl-2xl rounded-br-2xl" />
    </div>
  );
}
