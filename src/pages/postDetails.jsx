import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { unescape as unescapeHtml } from 'html-escaper'
import Header from '@/components/Header'
import FeedPost from '@/components/home/FeedPost'
import useRtdbDataKey from '@/hooks/useRtdbData'
import { useAuth } from '@/hooks/useAuth'
import { useFollow } from '@/hooks/useFollow'
import { toggleLike, addComment } from '@/firebase/rtdb/posts'
import { getUser } from '@/firebase/rtdb/users'
import { formatTimeAgo } from '@/utils/formatTimeAgo'
import Toast from '@/components/Toast'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function PostDetails() {
  const router = useRouter()
  const { postId } = router.query
  const { user } = useAuth()
  const { data: postsData } = useRtdbDataKey('posts')
  const { followingPeople, toggleFollow, isFollowing, isLoadingFollow } = useFollow()
  const [isLoadingLike, setIsLoadingLike] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const post = postId && postsData ? postsData[postId] : null

  const handleLike = async () => {
    if (!user?.uid || !postId) return
    
    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        setToastMessage('Your account has been banned and you cannot like posts.')
        setShowToast(true)
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      setToastMessage('Error checking account status. Please try again.')
      setShowToast(true)
      return
    }
    
    try {
      setIsLoadingLike(true)
      await toggleLike(postId, user.uid)
    } catch (err) {
      console.error('Error toggling like:', err)
    } finally {
      setIsLoadingLike(false)
    }
  }

  const handleComment = async (id, text) => {
    if (!user?.uid || !id || !text?.trim()) return
    try {
      await addComment(id, user.uid, {
        text: text.trim(),
        username: user.displayName || 'Anonymous',
        avatar: user.photoURL || '/default-avatar.png',
      })
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  if (!router.isReady) {
    return (
      <div className="bg-[#f7f7fb] min-h-screen">
        <Header />
        <main className="max-w-3xl mx-auto flex flex-col items-center px-6 py-12">
          <div className="text-[#64647c]">Loading...</div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="bg-[#f7f7fb] min-h-screen">
        <Header />
        <main className="max-w-3xl mx-auto flex flex-col items-center px-6 py-12">
          <div className="text-[#64647c]">Post not found</div>
        </main>
      </div>
    )
  }

  const postsList = postsData
    ? Object.entries(postsData).map(([id, data]) => ({ id, ...(data || {}) }))
    : []

  const postTags = Array.isArray(post.tags) ? post.tags : []

  const authorName = post?.username || post?.author || post?.authorName || 'Anonymous'
  const authorAvatar = post?.avatar || post?.authorAvatar || '/default-avatar.png'
  const canFollowAuthor = !!post.authorUid

  const otherFromAuthor = postsList
    .filter((item) => item.id !== postId && item.authorUid === post.authorUid)
    .slice(0, 3)

  const taggedSimilar = postsList
    .filter(
      (item) =>
        item.id !== postId &&
        item.authorUid !== post.authorUid &&
        postTags.length > 0 &&
        Array.isArray(item.tags) &&
        item.tags.some((tag) => postTags.includes(tag))
    )
    .slice(0, 3)

  const fallbackSimilar = taggedSimilar.length < 3
    ? postsList
        .filter(
          (item) =>
            item.id !== postId &&
            item.authorUid !== post.authorUid &&
            !taggedSimilar.find((similar) => similar.id === item.id)
        )
        .slice(0, 3 - taggedSimilar.length)
    : []

  const sidebarSimilar = [...taggedSimilar, ...fallbackSimilar].slice(0, 3)

  const SidebarCard = ({ item, variant = 'default', mediaOnRight = false, showAuthorMeta = false }) => {
    const media = item.mediaUrl || item.image || item.coverImage
    const initials = item.title ? item.title.slice(0, 1).toUpperCase() : 'S'
    const mediaCount = Array.isArray(item.mediaUrls)
      ? item.mediaUrls.length
      : Array.isArray(item.media)
        ? item.media.length
        : item.mediaCount || 0
    const timeValue = item.timestamp || item.time || item.createdAt
    const timeAgo = timeValue ? formatTimeAgo(timeValue) : ''
    const compactTimeAgo = timeAgo
      ? timeAgo
          .replace(' days', 'd')
          .replace(' day', 'd')
          .replace(' weeks', 'w')
          .replace(' week', 'w')
          .replace(' months', 'mo')
          .replace(' month', 'mo')
          .replace(' years', 'y')
          .replace(' year', 'y')
      : ''
    const authorDisplay = item.username || item.author || item.authorName || 'SalesGossip'
    const authorAvatar = item.avatar || item.authorAvatar || '/default-avatar.png'

    const renderMediaBadge = () => {
      if (!media) return null
      const duration = item.videoDuration || item.duration
      const galleryTotal = mediaCount > 1 ? mediaCount : null
      if (!duration && !galleryTotal) return null

      return (
        <div className="absolute right-2 bottom-2 bg-[rgba(16,17,42,0.7)] text-white text-[12px] rounded-md px-2 py-1 flex items-center gap-1">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-white">
            <path d="M4 6.5c0-1.1.9-2 2-2h6.5c1.1 0 2 .9 2 2v2.3l3.1-2.3c.7-.5 1.4 0 1.4.8v8.4c0 .8-.7 1.3-1.4.8L14.5 12v5.5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2z" />
          </svg>
          <span className="leading-none">{duration || galleryTotal}</span>
        </div>
      )
    }

    const cardBg = variant === 'muted'
      ? ''
      : 'bg-white border-[#e8e8eb] hover:border-[#aa336a]/40 transition-colors'

    const visual = media ? (
      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
        <img src={media} alt={item.title || 'Post preview'} className="w-full h-full object-cover" />
        {renderMediaBadge()}
      </div>
    ) : (
      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[#b7b7c2] flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#9495a5]">
          <path d="M5 6.5C5 5.39543 5.89543 4.5 7 4.5H14C15.1046 4.5 16 5.39543 16 6.5V9.8L19.1 7.7C19.7667 7.23333 20.7 7.71667 20.7 8.5V15.5C20.7 16.2833 19.7667 16.7667 19.1 16.3L16 14.2V17.5C16 18.6046 15.1046 19.5 14 19.5H7C5.89543 19.5 5 18.6046 5 17.5V6.5Z" fill="currentColor" />
        </svg>
      </div>
    )

    const likesLabel = `${item.likes || 0} likes`
    const commentsLabel = `${item.commentsCount || 0} comments`

    if (variant === 'muted') {
      return (
        <Link
          href={`/postDetails?postId=${encodeURIComponent(item.id)}`}
          className="flex w-full gap-3 items-start py-4 border-b border-[#e8e8eb] last:border-b-0"
        >
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {showAuthorMeta && (
              <div className="flex items-center gap-2 text-[14px] text-[#10112a]">
                <div className="w-6 h-6 rounded-full bg-[#e8e8eb] overflow-hidden">
                  <img src={authorAvatar} alt={authorDisplay} className="w-full h-full object-cover" />
                </div>
                <span className="font-medium truncate">{authorDisplay}</span>
                {compactTimeAgo && (
                  <>
                    <span className="inline-block h-1 w-1 rounded-full bg-[#b7b7c2]" aria-hidden />
                    <span className="text-[#64647c]">{compactTimeAgo}</span>
                  </>
                )}
              </div>
            )}
            <p
              className="text-[16px] font-semibold text-[#10112a] leading-6 overflow-hidden"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
            >
              {item.title || 'Untitled gossip'}
            </p>
            {showAuthorMeta ? (
              <div className="flex items-center gap-2 text-[14px] text-[#64647c]">
                {item.companyName && (
                  <div className="inline-flex items-center gap-2 text-[#10112a] font-medium">
                    {item.companyLogo ? (
                      <img
                        src={item.companyLogo}
                        alt={item.companyName}
                        className="w-5 h-5 rounded-full border border-[#e8e8eb] object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#e8e8eb] text-[10px] text-[#64647c] flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <span className="truncate">{item.companyName}</span>
                  </div>
                )}
                {item.companyName && <span className="inline-block h-1 w-1 rounded-full bg-[#b7b7c2]" aria-hidden />}
                <span className="whitespace-nowrap">{likesLabel}</span>
                <span className="inline-block h-1 w-1 rounded-full bg-[#b7b7c2]" aria-hidden />
                <span className="whitespace-nowrap">{commentsLabel}</span>
              </div>
            ) : (
              <>
                {(item.companyName || item.username) && (
                  <div className="flex items-center gap-2 text-[14px] font-medium text-[#10112a]">
                    {item.companyLogo ? (
                      <img
                        src={item.companyLogo}
                        alt={item.companyName || item.username}
                        className="w-5 h-5 rounded-full border border-[#e8e8eb] object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#e8e8eb] text-[10px] text-[#64647c] flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <span className="truncate">{item.companyName || item.username || 'SalesGossip'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[14px] text-[#64647c]">
                  <span>{likesLabel}</span>
                  <span className="inline-block h-1 w-1 rounded-full bg-[#b7b7c2]" aria-hidden />
                  <span>{commentsLabel}</span>
                  {compactTimeAgo && (
                    <>
                      <span className="inline-block h-1 w-1 rounded-full bg-[#b7b7c2]" aria-hidden />
                      <span>{compactTimeAgo}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          {mediaOnRight && visual}
        </Link>
      )
    }

    return (
      <Link
        href={`/postDetails?postId=${encodeURIComponent(item.id)}`}
        className={`flex w-full gap-3 items-start ${
          variant === 'muted' ? 'py-3 border-b border-[#e8e8eb] last:border-b-0' : 'p-3 rounded-2xl border'
        } ${cardBg}`}
      >
        {!mediaOnRight && visual}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#9495a5] mb-2">
            <div className="w-6 h-6 rounded-full border border-[#e8e8eb] overflow-hidden">
              <img src={item.avatar || '/default-avatar.png'} alt={item.username || 'User'} className="w-full h-full object-cover" />
            </div>
            <span className="text-[#10112a] font-medium truncate">{item.username || 'SalesGossip'}</span>
          </div>
          <p className="text-sm text-[#10112a] font-semibold leading-5 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.title || 'Untitled gossip'}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {item.companyName && (
              <div className="inline-flex items-center gap-2">
                {item.companyLogo && (
                  <img
                    src={item.companyLogo}
                    alt={item.companyName}
                    className="w-4 h-4 rounded-full border border-[#e8e8eb]"
                  />
                )}
                <span className="text-xs font-medium text-[#10112a]">
                  {item.companyName}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-[#64647c]">
              <span className="text-[#9495a5]">{item.likes || 0} likes</span>
              <span className="text-[#9495a5]">· {item.commentsCount || 0} comments</span>
              {timeAgo && (
                <span className="text-[#9495a5]">
                  · {timeAgo}
                </span>
              )}
            </div>
          </div>
        </div>
        {mediaOnRight && visual}
      </Link>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <main className="max-w-[1180px] mx-auto flex flex-col lg:flex-row gap-6 px-4 lg:px-6 py-10">
        <div className="flex-1 min-w-0 relative">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute -left-12 lg:-left-14 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#b7b7c2] bg-white hover:bg-[#f7f7fb]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6663 7.5C12.9425 7.5 13.1663 7.72386 13.1663 8C13.1663 8.27614 12.9425 8.5 12.6663 8.5H3.33301C3.05687 8.5 2.83301 8.27614 2.83301 8C2.83301 7.72386 3.05687 7.5 3.33301 7.5H12.6663Z" fill="#9B2E60" />
              <path d="M2.97945 7.64645C3.17472 7.45118 3.49122 7.45118 3.68649 7.64645L7.68649 11.6464C7.88175 11.8417 7.88175 12.1582 7.68649 12.3535C7.49122 12.5487 7.17472 12.5487 6.97945 12.3535L2.97945 8.35348C2.78419 8.15822 2.78419 7.84171 2.78419 7.64645Z" fill="#9B2E60" />
              <path d="M6.97945 3.64645C7.17472 3.45118 7.49122 3.45118 7.68649 3.64645C7.88175 3.84171 7.88175 4.15822 7.68649 4.35348L3.68649 8.35348C3.49122 8.54874 3.17472 8.54874 2.97945 8.35348C2.78419 8.15822 2.78419 7.84171 2.78419 7.64645L6.97945 3.64645Z" fill="#9B2E60" />
            </svg>
          </button>
          <FeedPost
            post={post}
            {...post}
            id={postId}
            comments={post.comments ? Object.values(post.comments) : []}
            isFollowed={isFollowing(post.authorUid)}
            isLoadingFollow={isLoadingFollow(post.authorUid)}
            isFollowActionPending={isLoadingFollow(post.authorUid)}
            onFollow={() => toggleFollow(post.authorUid)}
            isLiked={post.likedBy?.[user?.uid] === true}
            isLoadingLike={isLoadingLike}
            onLike={handleLike}
            onComment={handleComment}
            width={760}
            isDetail
          />
        </div>

        <aside className="w-full lg:w-[389px] flex flex-col gap-6 items-end">
          {otherFromAuthor.length > 0 && (
            <section className="bg-[#eff3fe] rounded-2xl p-4 w-full lg:w-[389px]" data-name="Featured Posts & News" data-node-id="278:3661">
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-semibold text-[#64647c] uppercase tracking-[0.08em]" data-node-id="278:3662">
                  Other gossips from
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#e8e8eb] overflow-hidden">
                {authorAvatar && (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span className="text-[14px] font-medium text-[#10112a] truncate">
                {authorName}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#b7b7c2]" />
              {canFollowAuthor && (
                <button
                  type="button"
                  onClick={() => toggleFollow(post.authorUid)}
                  disabled={!post.authorUid || isLoadingFollow(post.authorUid) || user?.uid === post.authorUid}
                  className="text-[12px] font-semibold text-[#aa336a] hover:opacity-90 disabled:opacity-60"
                >
                  {isFollowing(post.authorUid) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-0">
            {otherFromAuthor.map((item) => (
              <SidebarCard key={item.id} item={item} variant="muted" mediaOnRight />
            ))}
          </div>
        </section>
          )}

          <section className="border border-[#b7b7c2] rounded-2xl p-4 bg-transparent w-full lg:w-[389px]">
            <p className="text-[12px] font-semibold text-[#64647c] uppercase tracking-[0.08em]">MORE GOSSIPS LIKE THIS</p>
            <div className="mt-3 flex flex-col gap-0">
              {(sidebarSimilar.length > 0 ? sidebarSimilar : postsList.slice(0, 3)).map((item) => (
                <SidebarCard key={item.id} item={item} variant="muted" mediaOnRight showAuthorMeta />
              ))}
            </div>
          </section>
        </aside>
      </main>

      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </div>
  )
}
