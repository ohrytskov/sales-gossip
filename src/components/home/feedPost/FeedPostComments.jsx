import { useState } from 'react'
import Link from 'next/link'
import CommentDropdown from '@/components/CommentDropdown'
import { formatTimeAgo } from '@/utils/formatTimeAgo'
import { deleteComment, toggleCommentLike } from '@/firebase/rtdb/posts'
import { getUser } from '@/firebase/rtdb/users'
import { sendReport } from '@/firebase/rtdb/reports'

export default function FeedPostComments({ postId, username, comments = [], user, onComment, isDetail = false, showToastMessage }) {
  const [showAllComments, setShowAllComments] = useState(Boolean(isDetail))
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [isReportingComment, setIsReportingComment] = useState(null)
  const [loadingCommentLikeState, setLoadingCommentLikeState] = useState(null)

  const shouldShowAllComments = isDetail || showAllComments
  const visibleComments = shouldShowAllComments ? comments : comments.slice(-3)
  const canLoadMoreComments = !shouldShowAllComments && comments.length > 3

  const toast = (message) => {
    if (typeof showToastMessage === 'function') showToastMessage(message)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmittingComment || !onComment) return

    try {
      const userData = await getUser(user?.uid)
      if (userData?.public?.isBanned) {
        toast('Your account has been banned and you cannot comment.')
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      toast('Error checking account status. Please try again.')
      return
    }

    setIsSubmittingComment(true)
    try {
      await onComment(postId, commentText.trim())
      setCommentText('')
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleQuickReaction = async (reactionText) => {
    if (isSubmittingComment || !onComment) return

    try {
      const userData = await getUser(user?.uid)
      if (userData?.public?.isBanned) {
        toast('Your account has been banned and you cannot comment.')
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      toast('Error checking account status. Please try again.')
      return
    }

    setIsSubmittingComment(true)
    try {
      await onComment(postId, reactionText)
    } catch (err) {
      console.error('Error submitting quick reaction:', err)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReportComment = async (commentId) => {
    if (!user) {
      toast('You must be logged in to report comments')
      return
    }

    const comment = comments.find((c) => c.id === commentId)
    if (!comment) {
      console.error('Comment not found:', commentId)
      return
    }

    setIsReportingComment(commentId)

    try {
      const result = await sendReport({
        type: 'comment',
        reporterUid: user.uid,
        reporterUsername: user.displayName || 'Anonymous',
        targetId: commentId,
        targetUsername: comment.username || 'Unknown User',
        reason: 'Reported via comment dropdown',
        details: `Comment text: "${comment.text || 'No text'}"`,
        url: `${window.location.origin}/post/${postId}#comment-${commentId}`,
      })

      if (result.success) {
        toast(`Comment reported successfully. Sent to ${result.sentCount} moderator(s).`)
      } else {
        toast('Failed to send report. Please try again later.')
      }
    } catch (error) {
      console.error('Failed to report comment:', error)
      toast('Failed to send report. Please try again later.')
    } finally {
      setIsReportingComment(null)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const userData = await getUser(user?.uid)
      if (userData?.public?.isBanned) {
        toast('Your account has been banned and you cannot delete comments.')
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      toast('Error checking account status. Please try again.')
      return
    }

    try {
      await deleteComment(postId, commentId)
      console.log('Comment deleted:', commentId)
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  const handleCommentLike = async (commentId) => {
    if (!user?.uid) {
      toast('You must be logged in to like comments')
      return
    }
    if (loadingCommentLikeState === commentId) return

    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        toast('Your account has been banned and you cannot like comments.')
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      toast('Error checking account status. Please try again.')
      return
    }

    try {
      setLoadingCommentLikeState(commentId)
      await toggleCommentLike(postId, commentId, user.uid)
    } catch (err) {
      console.error('Error toggling comment like:', err)
      toast('Failed to like comment')
    } finally {
      setLoadingCommentLikeState(null)
    }
  }

  return (
    <div className="px-4 pb-4">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleQuickReaction(`Thanks for sharing this, ${username}`)}
          disabled={isSubmittingComment}
          className="px-3 py-2 border border-[#64647c] rounded-[40px] text-[#64647c] text-sm font-medium font-['Inter'] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Thanks for sharing this, {username}
        </button>
        <button
          onClick={() => handleQuickReaction(`Love this, ${username}`)}
          disabled={isSubmittingComment}
          className="px-3 py-2 border border-[#64647c] rounded-[40px] text-[#64647c] text-sm font-medium font-['Inter'] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Love this, {username}
        </button>
        <button
          onClick={() => handleQuickReaction('Insightful')}
          disabled={isSubmittingComment}
          className="px-3 py-2 border border-[#64647c] rounded-[40px] text-[#64647c] text-sm font-medium font-['Inter'] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Insightful
        </button>
        <button
          onClick={() => handleQuickReaction(`Well put, ${username}`)}
          disabled={isSubmittingComment}
          className="px-3 py-2 border border-[#64647c] rounded-[40px] text-[#64647c] text-sm font-medium font-['Inter'] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Well put, {username}
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Add a comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && commentText.trim() && !isSubmittingComment) {
              handleSubmitComment()
            }
          }}
          disabled={isSubmittingComment}
          className="w-full h-12 px-4 py-3 bg-[#f2f2f4] rounded-full text-[#64647c] text-base font-['Inter'] placeholder-[#64647c] outline-none focus:ring-2 focus:ring-pink-700 transition-all disabled:opacity-60"
        />
        <button
          onClick={handleSubmitComment}
          disabled={!commentText.trim() || isSubmittingComment}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmittingComment ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="#64647c" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#64647c" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" fill="#64647c" />
              <path d="M8 12H16M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center text-[#454662] text-sm font-medium font-['Inter'] gap-2 mb-4">
        <span>Most relevant</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_140_807)">
            <path
              d="M15.0001 7.5C15.7101 7.5 16.081 8.32167 15.6526 8.8525L15.5893 8.9225L10.5893 13.9225C10.4458 14.066 10.2549 14.1522 10.0524 14.1649C9.84984 14.1776 9.64963 14.116 9.48929 13.9917L9.41096 13.9225L4.41096 8.9225L4.34179 8.84417L4.29679 8.78L4.25179 8.7L4.23762 8.67L4.21512 8.61417L4.18846 8.52417L4.18012 8.48L4.17179 8.43L4.16846 8.3825V8.28417L4.17262 8.23583L4.18012 8.18583L4.18846 8.1425L4.21512 8.0525L4.23762 7.99667L4.29596 7.88667L4.35012 7.81167L4.41096 7.74417L4.48929 7.675L4.55346 7.63L4.63346 7.585L4.66346 7.57083L4.71929 7.54833L4.80929 7.52167L4.85346 7.51333L4.90346 7.505L4.95096 7.50167L15.0001 7.5Z"
              fill="#454662"
            />
          </g>
          <defs>
            <clipPath id="clip0_140_807">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {visibleComments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-3 mb-8">
          {comment.userId ? (
            <Link href={`/profile?id=${encodeURIComponent(comment.userId)}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src={comment.avatar || comment.user?.avatar || '/images/feed/avatar1.svg'}
                alt={comment.username || comment.user?.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/images/feed/avatar1.svg'
                }}
              />
            </Link>
          ) : (
            <img
              src={comment.avatar || comment.user?.avatar || '/images/feed/avatar1.svg'}
              alt={comment.username || comment.user?.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/feed/avatar1.svg'
              }}
            />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {comment.userId ? (
                <Link
                  href={`/profile?id=${encodeURIComponent(comment.userId)}`}
                  className="text-[#10112a] text-sm font-medium font-['Inter'] leading-snug hover:text-pink-600 transition-colors"
                >
                  {comment.username || comment.user?.name}
                </Link>
              ) : (
                <span className="text-[#10112a] text-sm font-medium font-['Inter'] leading-snug">
                  {comment.username || comment.user?.name}
                </span>
              )}
              <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2" cy="2" r="2" fill="#64647C" />
              </svg>
              <span className="text-[#64647c] text-sm font-normal font-['Inter'] leading-snug">
                {formatTimeAgo(comment.timestamp || comment.time)}
              </span>
            </div>

            <div className="text-[#17183b] text-sm font-normal font-['Inter'] leading-snug mb-3">{comment.text}</div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCommentLike(comment.id)}
                disabled={loadingCommentLikeState === comment.id}
                className={`flex items-center gap-2 transition-colors ${
                  comment.likedBy?.[user?.uid] === true ? 'text-[#AA336A] hover:text-[#AA336A]/80' : 'text-[#64647c] hover:text-[#10112a]'
                } ${loadingCommentLikeState === comment.id ? 'opacity-60' : ''}`}
              >
                {loadingCommentLikeState === comment.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_140_658)">
                      <path
                        d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65599 4.54372 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={comment.likedBy?.[user?.uid] === true ? 'currentColor' : 'none'}
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_140_658">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
                <span className="text-sm font-normal font-['Inter']">{comment.likes > 0 ? `${comment.likes} likes` : 'Like'}</span>
              </button>

              <div className="w-px h-5 bg-[#b7b7c2]" />

              <div className="relative">
                <button
                  onClick={() => setOpenDropdownId(openDropdownId === comment.id ? null : comment.id)}
                  className="text-[#64647c] hover:text-[#10112a] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_140_669)">
                      <path
                        d="M3.33301 10.0003C3.33301 10.2213 3.42081 10.4333 3.57709 10.5896C3.73337 10.7459 3.94533 10.8337 4.16634 10.8337C4.38735 10.8337 4.59932 10.7459 4.7556 10.5896C4.91188 10.4333 4.99967 10.2213 4.99967 10.0003C4.99967 9.77931 4.91188 9.56735 4.7556 9.41107C4.59932 9.25479 4.38735 9.16699 4.16634 9.16699C3.94533 9.16699 3.73337 9.25479 3.57709 9.41107C3.42081 9.56735 3.33301 9.77931 3.33301 10.0003Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.16699 10.0003C9.16699 10.2213 9.25479 10.4333 9.41107 10.5896C9.56735 10.7459 9.77931 10.8337 10.0003 10.8337C10.2213 10.8337 10.4333 10.7459 10.5896 10.5896C10.7459 10.4333 10.8337 10.2213 10.8337 10.0003C10.8337 9.77931 10.7459 9.56735 10.5896 9.41107C10.4333 9.25479 10.2213 9.16699 10.0003 9.16699C9.77931 9.16699 9.56735 9.25479 9.41107 9.41107C9.25479 9.56735 9.16699 9.77931 9.16699 10.0003Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 10.0003C15 10.2213 15.0878 10.4333 15.2441 10.5896C15.4004 10.7459 15.6123 10.8337 15.8333 10.8337C16.0543 10.8337 16.2663 10.7459 16.4226 10.5896C16.5789 10.4333 16.6667 10.2213 16.6667 10.0003C16.6667 9.77931 16.5789 9.56735 16.4226 9.41107C16.2663 9.25479 16.0543 9.16699 15.8333 9.16699C15.6123 9.16699 15.4004 9.25479 15.2441 9.41107C15.0878 9.56735 15 9.77931 15 10.0003Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_140_669">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                <CommentDropdown
                  isOpen={openDropdownId === comment.id}
                  onClose={() => setOpenDropdownId(null)}
                  onReport={() => handleReportComment(comment.id)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  isReporting={isReportingComment === comment.id}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={`flex items-center gap-2 py-2 transition-opacity ${
          canLoadMoreComments ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'
        }`}
        onClick={() => {
          if (!canLoadMoreComments) return
          setShowAllComments(true)
        }}
        disabled={!canLoadMoreComments}
        title={canLoadMoreComments ? '' : 'All comments are visible'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#E8E8EB" />
          <g transform="translate(4 4)" clipPath="url(#clip0)">
            <path d="M7.6665 2.5V10.1667" stroke="#0A0A19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M10.3333 7.5L7.66667 10.1667L5 7.5M10.3333 10.8333L7.66667 13.5L5 10.8333"
              stroke="#0A0A19"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-slate-950 text-sm font-medium font-['Inter']">Load more comments</span>
      </button>
    </div>
  )
}
