// components/home/Feed.jsx
import { useState } from 'react'
import FeedPost from './FeedPost'
import FeedFilterBar from './FeedFilterBar'
import QuickPost from './QuickPost'
import useRtdbDataKey from '@/hooks/useRtdbData'
import { useAuth } from '@/hooks/useAuth'
import { useFollow } from '@/hooks/useFollow'
import { toggleLike, addComment } from '@/firebase/rtdb/posts'

// Parse an ISO timestamp (createdAt or timestamp) into milliseconds
// We expect `createdAt` to be an ISO datetime string; no heuristics/fallbacks
function getCreatedAtMs(post) {
  const val = (post && (post.createdAt || post.timestamp)) || ''
  const parsed = Date.parse(val)
  return isNaN(parsed) ? 0 : parsed
}

export default function Feed({ authorUid, showQuickPost = true, showFilterBar = true }) {
  const { user } = useAuth()
  //const { data: sampleFeed } = useRtdbDataKey('sampleFeed')
  const { data: sampleFeed } = useRtdbDataKey('posts')
  const { followingPeople, toggleFollow, isFollowing, isLoadingFollow } = useFollow()
  const [loadingLikeState, setLoadingLikeState] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('New')


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

  // Filter by author if specified (for profile pages)
  const authorFilteredFeed = authorUid ? feed.filter(post => post?.authorUid === authorUid) : feed;

  const availableTags = Array.from(new Set(authorFilteredFeed.flatMap((post) => post.tags || [])));
  const filteredPosts = authorFilteredFeed.filter(
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
      {showQuickPost && (
        <>
          <QuickPost />
          <div className="h-8" />
        </>
      )}
      {showFilterBar && (
        <>
          <FeedFilterBar
            availableTags={availableTags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            sortBy={sortBy}
            onSortChange={setSortBy}
            width={authorUid ? 741 : 684}
            minimal={!!authorUid}
          />
        </>
      )}
      {sortedPosts.map((post) => (
        <FeedPost
          key={post.id}
          post={post}
          {...post}
          comments={post.comments ? Object.values(post.comments) : []}
          isFollowed={isFollowing(post.authorUid)}
          isLoadingFollow={isLoadingFollow(post.authorUid)}
          isFollowActionPending={isLoadingFollow(post.authorUid)}
          onFollow={() => toggleFollow(post.authorUid)}
          isLiked={post.likedBy?.[user?.uid] === true}
          isLoadingLike={loadingLikeState === post.id}
          onLike={() => handleLike(post.id)}
          onComment={handleComment}
          width={authorUid ? 741 : 684}
          isProfilePage={!!authorUid}
        />
      ))}

      {/* Rounded footer */}
      <div className={`w-[${authorUid ? 741 : 684}px] h-4 relative bg-white border border-t-0 mt-[-1px] mb-10 border-gray-200 rounded-bl-2xl rounded-br-2xl`} />
    </div>
  );
}
