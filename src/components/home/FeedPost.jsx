// components/home/FeedPost.jsx
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import Toast from '@/components/Toast'
import CreatePostModal from '@/components/CreatePostModal'
import FeedPostActions from '@/components/home/feedPost/FeedPostActions'
import FeedPostComments from '@/components/home/feedPost/FeedPostComments'
import FeedPostContent from '@/components/home/feedPost/FeedPostContent'
import FeedPostHeader from '@/components/home/feedPost/FeedPostHeader'
import FeedPostMedia from '@/components/home/feedPost/FeedPostMedia'
import { deletePost } from '@/firebase/rtdb/posts'
import { getUser } from '@/firebase/rtdb/users'
import { useAuth } from '@/hooks/useAuth'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function FeedPost({
  post = null,
  authorUid,
  avatar,
  username,
  timestamp,
  title,
  excerpt = '',
  moreLink,
  tags = [],
  mediaUrl,
  likes = 0,
  commentsCount = 0,
  shares,
  comments = [],
  onFollow,
  companyLogo = '',
  companyName = '',
  isFollowed = false,
  isLoadingFollow = false,
  isFollowActionPending = false,
  isLiked = false,
  isLoadingLike = false,
  onLike,
  onComment,
  id,
  width = 684,
  isProfilePage = false,
  isDetail = false,
}) {
  const { user } = useAuth()
  const [showMore, setShowMore] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const [isLogoVisible, setIsLogoVisible] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)
  const menuRef = useRef(null)

  const canManagePost = Boolean(user && authorUid && user.uid === authorUid)
  const cardBorder = isDetail ? '' : 'border-x border-b border-gray-200'
  const avatarSrc = avatar || '/images/feed/avatar1.svg'

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
  }

  useEffect(() => {
    if (!isMenuOpen) return
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isMenuOpen])

  const handleEditPost = async () => {
    if (!canManagePost) {
      showToastMessage('Only the author can edit this post')
      return
    }

    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        showToastMessage('Your account has been banned and you cannot edit posts.')
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
    }

    setIsMenuOpen(false)
    setShowEditModal(true)
  }

  const handleDeletePost = async () => {
    if (!canManagePost) {
      showToastMessage('Only the author can delete this post')
      return
    }

    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        showToastMessage('Your account has been banned and you cannot delete posts.')
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
    }

    if (!id || isDeletingPost) return
    setIsDeletingPost(true)
    try {
      await deletePost(id)
      showToastMessage('Post deleted')
    } catch (err) {
      console.error('Failed to delete post', err)
      showToastMessage('Failed to delete post')
    } finally {
      setIsDeletingPost(false)
      setIsMenuOpen(false)
    }
  }

  return (
    <div id={`post-${id}`} className={`w-[${width}px] bg-white ${cardBorder}`}>
      <FeedPostHeader
        authorUid={authorUid}
        avatarSrc={avatarSrc}
        username={username}
        timestamp={timestamp}
        onFollow={onFollow}
        isFollowActionPending={isFollowActionPending}
        isFollowed={isFollowed}
        isProfilePage={isProfilePage}
        isLoadingFollow={isLoadingFollow}
        menuRef={menuRef}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        canManagePost={canManagePost}
        isDeletingPost={isDeletingPost}
      />

      <FeedPostContent
        isDetail={isDetail}
        title={title}
        postId={id}
        excerpt={excerpt}
        moreLink={moreLink}
        showMore={showMore}
        onToggleShowMore={() => setShowMore((prev) => !prev)}
        ReactQuill={ReactQuill}
        tags={tags}
        companyLogo={companyLogo}
        companyName={companyName}
        isLogoVisible={isLogoVisible}
        onLogoError={() => setIsLogoVisible(false)}
      />

      {mediaUrl && (
        <div className="w-full">
          <FeedPostMedia mediaUrl={mediaUrl} title={title} />
        </div>
      )}

      <FeedPostActions
        onLike={onLike}
        isLoadingLike={isLoadingLike}
        isLiked={isLiked}
        likes={likes}
        commentsCount={commentsCount}
        onToggleComments={() => setShowComments((prev) => !prev)}
      />

      {showComments && (
        <FeedPostComments
          postId={id}
          username={username}
          comments={comments}
          user={user}
          onComment={onComment}
          isDetail={isDetail}
          showToastMessage={showToastMessage}
        />
      )}

      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
      <CreatePostModal open={showEditModal} onClose={() => setShowEditModal(false)} post={post} />
    </div>
  )
}

