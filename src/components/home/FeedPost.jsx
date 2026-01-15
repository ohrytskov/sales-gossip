// components/home/FeedPost.jsx
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { unescape as unescapeHtml } from 'html-escaper';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import CommentDropdown from '@/components/CommentDropdown';
import Toast from '@/components/Toast'
import CreatePostModal from '@/components/CreatePostModal'
import { deleteComment, deletePost, toggleCommentLike } from '@/firebase/rtdb/posts';
import { useAuth } from '@/hooks/useAuth';
import { getUser } from '@/firebase/rtdb/users';
import { sendReport } from '@/firebase/rtdb/reports';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
    const [commentText, setCommentText] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [openDropdownId, setOpenDropdownId] = useState(null)
    const [isReportingComment, setIsReportingComment] = useState(null)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [isDeletingPost, setIsDeletingPost] = useState(false)
    const [loadingCommentLikeState, setLoadingCommentLikeState] = useState(null)
    const menuRef = useRef(null)
    const canManagePost = Boolean(user && authorUid && user.uid === authorUid)

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
        
        // Check if user is banned
        try {
            const userData = await getUser(user.uid)
            if (userData?.public?.isBanned) {
                showToastMessage('Your account has been banned and you cannot edit posts.')
                return
            }
        } catch (error) {
            console.error('Error checking user ban status:', error)
            showToastMessage('Error checking account status. Please try again.')
            return
        }
        
        setIsMenuOpen(false)
        setShowEditModal(true)
    }

    const handleDeletePost = async () => {
        if (!canManagePost) {
            showToastMessage('Only the author can delete this post')
            return
        }
        
        // Check if user is banned
        try {
            const userData = await getUser(user.uid)
            if (userData?.public?.isBanned) {
                showToastMessage('Your account has been banned and you cannot delete posts.')
                return
            }
        } catch (error) {
            console.error('Error checking user ban status:', error)
            showToastMessage('Error checking account status. Please try again.')
            return
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

    const handleSubmitComment = async () => {
        if (!commentText.trim() || isSubmittingComment || !onComment) return

        // Check if user is banned
        try {
            const userData = await getUser(user?.uid)
            if (userData?.public?.isBanned) {
                showToastMessage('Your account has been banned and you cannot comment.')
                return
            }
        } catch (error) {
            console.error('Error checking user ban status:', error)
            showToastMessage('Error checking account status. Please try again.')
            return
        }

        setIsSubmittingComment(true)
        try {
            await onComment(id, commentText.trim())
            setCommentText('')
        } catch (err) {
            console.error('Error submitting comment:', err)
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleQuickReaction = async (reactionText) => {
        if (isSubmittingComment || !onComment) return

        // Check if user is banned
        try {
            const userData = await getUser(user?.uid)
            if (userData?.public?.isBanned) {
                showToastMessage('Your account has been banned and you cannot comment.')
                return
            }
        } catch (error) {
            console.error('Error checking user ban status:', error)
            showToastMessage('Error checking account status. Please try again.')
            return
        }

        setIsSubmittingComment(true)
        try {
            await onComment(id, reactionText)
        } catch (err) {
            console.error('Error submitting quick reaction:', err)
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleReportComment = async (commentId) => {
        if (!user) {
            showToastMessage('You must be logged in to report comments')
            return
        }

        const comment = comments.find(c => c.id === commentId)
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
                url: `${window.location.origin}/post/${id}#comment-${commentId}`
            })

            if (result.success) {
                showToastMessage(`Comment reported successfully. Sent to ${result.sentCount} moderator(s).`)
            } else {
                showToastMessage('Failed to send report. Please try again later.')
            }
        } catch (error) {
            console.error('Failed to report comment:', error)
            showToastMessage('Failed to send report. Please try again later.')
        } finally {
            setIsReportingComment(null)
        }
    }

    const handleDeleteComment = async (commentId) => {
        // Check if user is banned
        try {
            const userData = await getUser(user?.uid)
            if (userData?.public?.isBanned) {
                showToastMessage('Your account has been banned and you cannot delete comments.')
                return
            }
        } catch (error) {
            console.error('Error checking user ban status:', error)
            showToastMessage('Error checking account status. Please try again.')
            return
        }
        
        try {
            await deleteComment(id, commentId)
            console.log('Comment deleted:', commentId)
        } catch (err) {
            console.error('Error deleting comment:', err)
        }
    }

    const handleCommentLike = async (commentId) => {
        if (!user?.uid) {
            showToastMessage('You must be logged in to like comments')
            return
        }
        if (loadingCommentLikeState === commentId) return

        // Check if user is banned
        try {
            const userData = await getUser(user.uid)
            if (userData?.public?.isBanned) {
                showToastMessage('Your account has been banned and you cannot like comments.')
                return
            }
        } catch (error) {
            console.error('Error checking user ban status:', error)
            showToastMessage('Error checking account status. Please try again.')
            return
        }

        // Prevent self-liking
        const comment = comments.find(c => c.id === commentId)
        if (comment && comment.userId === user.uid) {
            //showToastMessage('You cannot like your own comment')
            //return
        }

        try {
            setLoadingCommentLikeState(commentId)
            await toggleCommentLike(id, commentId, user.uid)
        } catch (err) {
            console.error('Error toggling comment like:', err)
            showToastMessage('Failed to like comment')
        } finally {
            setLoadingCommentLikeState(null)
        }
    }

    // render media: support YouTube, Vimeo, video files, and images
    const renderMedia = () => {
        if (!mediaUrl) return null
        const ytMatch = mediaUrl.match(/(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
        if (ytMatch && ytMatch[1]) {
            const id = ytMatch[1]
            return (
                <div className="mx-auto w-full">
                    <iframe
                        className="w-full"
                        height="360"
                        src={`https://www.youtube.com/embed/${id}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )
        }
        const vimeoMatch = mediaUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
        if (vimeoMatch && vimeoMatch[1]) {
            const id = vimeoMatch[1]
            return (
                <div className="mx-auto w-full">
                    <iframe
                        className="w-full"
                        height="360"
                        src={`https://player.vimeo.com/video/${id}`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )
        }
        if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl)) {
            return <video src={mediaUrl} controls className="w-full h-auto mx-auto" />
        }
        return <img src={mediaUrl} className="mx-auto" alt={title || 'media'} />
    }

    const cardBorder = isDetail ? '' : 'border-x border-b border-gray-200'

    return (
        <div id={`post-${id}`} className={`w-[${width}px] bg-white ${cardBorder}`}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {authorUid ? (
                        <Link href={`/profile?id=${encodeURIComponent(authorUid)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src={avatar} alt={username} className="w-12 h-12 rounded-full border border-gray-200" />
                            <div>
                                <div className="text-base font-medium text-slate-900">{username}</div>
                                <div className="text-sm text-slate-600">{formatTimeAgo(timestamp)}</div>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <img src={avatar} alt={username} className="w-12 h-12 rounded-full border border-gray-200" />
                            <div>
                                <div className="text-base font-medium text-slate-900">{username}</div>
                                <div className="text-sm text-slate-600">{formatTimeAgo(timestamp)}</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onFollow}
                        disabled={!authorUid}
                        className={`h-8 px-4 py-2 rounded-full inline-flex items-center justify-center gap-2 font-['Inter'] leading-none text-xs font-semibold transition-all ${
                            isFollowActionPending
                                ? 'bg-gray-300 text-gray-600 opacity-60 cursor-pointer'
                                : isFollowed
                                ? 'bg-white border border-[#b7b7c2] text-[#aa336a] hover:bg-gray-50 cursor-pointer'
                                : 'bg-pink-700 text-white hover:bg-pink-800 cursor-pointer'
                        } ${isProfilePage ? 'opacity-0 pointer-events-none' : ''}`}
                        title={!authorUid ? 'Author UID missing' : ''}
                    >
                        {isLoadingFollow ? (
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                                </svg>
                                <span>...</span>
                            </div>
                        ) : isFollowed ? (
                            <div>Following</div>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_9795_1260)">
                                        <path d="M7.5 12.6668V3.3335C7.5 3.05735 7.72386 2.8335 8 2.8335C8.27614 2.8335 8.5 3.05735 8.5 3.3335V12.6668C8.5 12.943 8.27614 13.1668 8 13.1668C7.72386 13.1668 7.5 12.943 7.5 12.6668Z" fill="white" />
                                        <path d="M12.6666 7.5C12.9427 7.5 13.1666 7.72386 13.1666 8C13.1666 8.27614 12.9427 8.5 12.6666 8.5H3.33325C3.05711 8.5 2.83325 8.27614 2.83325 8C2.83325 7.72386 3.05711 7.5 3.33325 7.5H12.6666Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_9795_1260">
                                            <rect width="16" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div>Follow</div>
                            </>
                        )}
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-gray-100 rounded-full"
                            aria-haspopup="true"
                            aria-expanded={isMenuOpen}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_484_6574)">
                                    <path d="M4 12C4 12.2652 4.10536 12.5196 4.29289 12.7071C4.48043 12.8946 4.73478 13 5 13C5.26522 13 5.51957 12.8946 5.70711 12.7071C5.89464 12.5196 6 12.2652 6 12C6 11.7348 5.89464 11.4804 5.70711 11.2929C5.51957 11.1054 5.26522 11 5 11C4.73478 11 4.48043 11.1054 4.29289 11.2929C4.10536 11.4804 4 11.7348 4 12Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M11 12C11 12.2652 11.1054 12.5196 11.2929 12.7071C11.4804 12.8946 11.7348 13 12 13C12.2652 13 12.5196 12.8946 12.7071 12.7071C12.8946 12.5196 13 12.2652 13 12C13 11.7348 12.8946 11.4804 12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11C11.7348 11 11.4804 11.1054 11.2929 11.2929C11.1054 11.4804 11 11.7348 11 12Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M18 12C18 12.2652 18.1054 12.5196 18.2929 12.7071C18.4804 12.8946 18.7348 13 19 13C19.2652 13 19.5196 12.8946 19.7071 12.7071C19.8946 12.5196 20 12.2652 20 12C20 11.7348 19.8946 11.4804 19.7071 11.2929C19.5196 11.1054 19.2652 11 19 11C18.7348 11 18.4804 11.1054 18.2929 11.2929C18.1054 11.4804 18 11.7348 18 12Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_484_6574">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </button>
                        {isMenuOpen && (
                            <div
                                data-layer="Menu"
                            className="Menu size- p-4 absolute right-0 top-full mt-2 bg-white rounded-lg shadow-[0px_0px_16px_0px_rgba(16,17,42,0.08)] inline-flex flex-col justify-center items-start gap-0 z-10 w-[116px] h-[72px]"
                                role="menu"
                            >
                                <button
                                    type="button"
                                    onClick={handleEditPost}
                                    className={`Frame48097069 self-stretch inline-flex justify-start items-center gap-2 px-0 py-2 ${!canManagePost ? 'opacity-60' : ''}`}
                                    aria-disabled={!canManagePost}
                                >
                                    <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_359_18385)">
                                                <path d="M2.66602 13.3342H5.33268L12.3327 6.33419C12.5078 6.15909 12.6467 5.95122 12.7414 5.72245C12.8362 5.49367 12.885 5.24848 12.885 5.00085C12.885 4.75323 12.8362 4.50803 12.7414 4.27926C12.6467 4.05048 12.5078 3.84262 12.3327 3.66752C12.1576 3.49242 11.9497 3.35353 11.7209 3.25877C11.4922 3.16401 11.247 3.11523 10.9993 3.11523C10.7517 3.11523 10.5065 3.16401 10.2778 3.25877C10.049 3.35353 9.84111 3.49242 9.66602 3.66752L2.66602 10.6675V13.3342Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9 4.33398L11.6667 7.00065" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_359_18385">
                                                    <rect width="16" height="16" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                    <span className="Username justify-start text-[#10112a] text-sm font-medium font-['Inter'] leading-[22px] whitespace-nowrap">
                                        Edit post
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeletePost}
                                    className={`Frame48097070 self-stretch inline-flex justify-start items-center gap-2 px-0 py-2 ${(!canManagePost || isDeletingPost) ? 'opacity-60' : ''}`}
                                    aria-disabled={!canManagePost || isDeletingPost}
                                >
                                    <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_359_18391)">
                                                <path d="M2.66602 4.66602H13.3327" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M6.66602 7.33398V11.334" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9.33398 7.33398V11.334" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M3.33398 4.66602L4.00065 12.666C4.00065 13.0196 4.14113 13.3588 4.39118 13.6088C4.64122 13.8589 4.98036 13.9993 5.33398 13.9993H10.6673C11.0209 13.9993 11.3601 13.8589 11.6101 13.6088C11.8602 13.3588 12.0007 13.0196 12.0007 12.666L12.6673 4.66602" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M6 4.66667V2.66667C6 2.48986 6.07024 2.32029 6.19526 2.19526C6.32029 2.07024 6.48986 2 6.66667 2H9.33333C9.51014 2 9.67971 2.07024 9.80474 2.19526C9.92976 2.32029 10 2.48986 10 2.66667V4.66667" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_359_18391">
                                                    <rect width="16" height="16" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                    <span className="Username justify-start text-[#10112a] text-sm font-medium font-['Inter'] leading-[22px] whitespace-nowrap">
                                        {isDeletingPost ? 'Deleting...' : 'Delete'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="px-4">
                {isDetail ? (
                    <h2 className="text-xl font-medium text-slate-900 font-['Inter'] leading-7 mb-2">{title}</h2>
                ) : (
                    <Link href={`/postDetails?postId=${encodeURIComponent(id)}`}>
                        <h2 className="text-xl font-medium text-slate-900 font-['Inter'] leading-7 mb-2 hover:underline">{title}</h2>
                    </Link>
                )}
                <div className="text-sm text-slate-900 leading-snug font-medium font-['Inter'] mb-2">
                    <ReactQuill
                        className="create-post-quill"
                        theme="snow"
                        readOnly
                        modules={{ toolbar: false }}
                        value={unescapeHtml(excerpt)}
                    />
                    {moreLink && (
                        <span onClick={() => setShowMore(!showMore)} className="text-slate-900 text-sm font-semibold font-['Inter'] leading-snug cursor-pointer">
                            {showMore ? 'less' : 'more'}
                        </span>
                    )}
                </div>
                <div className="inline-flex items-center gap-4 mb-4">
                    {companyLogo && isLogoVisible && (
                        <img
                            src={companyLogo}
                            alt={companyName}
                            className="w-6 h-6 rounded-full border border-gray-200"
                            onError={() => setIsLogoVisible(false)}
                        />
                    )}

                    <div className="-ml-3 text-slate-900 text-sm font-medium font-['Inter']">
                        {companyName}
                    </div>

                    {/* Vertical line */}
                    <div className="w-px h-6 bg-zinc-100" />

                    {tags.map((tag) => (
                        <div
                            key={tag}
                            className="h-6 px-3 py-1 bg-zinc-100 rounded-lg flex items-center justify-center gap-2"
                        >
                            <span className="text-slate-900 text-xs font-normal font-['Inter'] leading-tight">
                                #{tag}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
            {mediaUrl && (
                <div className="w-full">
                    {renderMedia()}
                </div>
            )}
            <div className="flex items-center justify-between px-4 py-6 text-sm text-slate-700">
                <div className="flex items-center gap-4">
                    {/* Likes Button */}
                    <button
                        onClick={onLike}
                        disabled={isLoadingLike}
                        className={`px-3 py-2 rounded-[40px] inline-flex justify-center items-center gap-2 transition-all ${
                            isLiked
                                ? 'bg-red-50 cursor-pointer'
                                : 'bg-red-50 cursor-pointer hover:bg-red-100'
                        } ${isLoadingLike ? 'opacity-60' : ''}`}
                    >
                        <div data-svg-wrapper className="relative">
                            {isLoadingLike ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                                    <circle cx="12" cy="12" r="10" stroke="#AA336A" strokeWidth="2" fill="none" opacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#AA336A" strokeWidth="2" fill="none" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_140_642)">
                                        <path d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65598 4.54373 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821" fill={isLiked ? "#AA336A" : "none"} />
                                        <path d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65599 4.54372 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821" stroke="#AA336A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_140_642">
                                            <rect width="20" height="20" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            )}
                        </div>
                        <div className="justify-start text-pink-700 text-sm font-medium font-['Inter']">{likes} likes</div>
                    </button>
                    {/* Comments Button */}
                    <div onClick={() => setShowComments(!showComments)} className="px-3 py-2 bg-red-50 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-red-50 inline-flex justify-center items-center gap-2 cursor-pointer">
                        <div data-svg-wrapper className="relative">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_140_647)">
                                    <path d="M2.5 16.6674L3.58333 13.4174C1.64667 10.5532 2.395 6.85741 5.33333 4.77241C8.27167 2.68825 12.4917 2.85908 15.2042 5.17241C17.9167 7.48658 18.2833 11.2274 16.0617 13.9232C13.84 16.6191 9.71583 17.4357 6.41667 15.8341L2.5 16.6674Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_140_647">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="justify-start text-slate-900 text-sm font-medium font-['Inter']">{commentsCount} comments</div>
                    </div>
                    {/* Share Button */}
                    <div className="px-3 py-2 bg-red-50 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-red-50 inline-flex justify-center items-center gap-2">
                        <div data-svg-wrapper className="relative">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_140_652)">
                                    <path d="M10.8335 3.33398V6.66732C5.35432 7.52398 3.31682 12.324 2.50016 16.6673C2.46932 16.839 6.98682 11.699 10.8335 11.6673V15.0007L17.5002 9.16732L10.8335 3.33398Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_140_652">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="justify-start text-slate-900 text-sm font-medium font-['Inter']">Share</div>
                    </div>
                </div>
            </div>
            {showComments && (
                <div className="px-4 pb-4">
                    {/* Quick Reaction Tags */}
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

                    {/* Comment Input */}
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
                                <path d="M15.0001 7.5C15.7101 7.5 16.081 8.32167 15.6526 8.8525L15.5893 8.9225L10.5893 13.9225C10.4458 14.066 10.2549 14.1522 10.0524 14.1649C9.84984 14.1776 9.64963 14.116 9.48929 13.9917L9.41096 13.9225L4.41096 8.9225L4.34179 8.84417L4.29679 8.78L4.25179 8.7L4.23762 8.67L4.21512 8.61417L4.18846 8.52417L4.18012 8.48L4.17179 8.43L4.16846 8.3825V8.28417L4.17262 8.23583L4.18012 8.18583L4.18846 8.1425L4.21512 8.0525L4.23762 7.99667L4.29596 7.88667L4.35012 7.81167L4.41096 7.74417L4.48929 7.675L4.55346 7.63L4.63346 7.585L4.66346 7.57083L4.71929 7.54833L4.80929 7.52167L4.85346 7.51333L4.90346 7.505L4.95096 7.50167L15.0001 7.5Z" fill="#454662" />
                            </g>
                            <defs>
                                <clipPath id="clip0_140_807">
                                    <rect width="20" height="20" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>

                    {comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3 mb-8">
                            {comment.userId ? (
                                <Link href={`/profile?id=${encodeURIComponent(comment.userId)}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                                    <img
                                        src={comment.avatar || comment.user?.avatar}
                                        alt={comment.username || comment.user?.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                </Link>
                            ) : (
                                <img
                                    src={comment.avatar || comment.user?.avatar}
                                    alt={comment.username || comment.user?.name}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                            )}
                            <div className="flex-1">
                                {/* name · time row */}
                                <div className="flex items-center gap-2 mb-1">
                                    {comment.userId ? (
                                        <Link href={`/profile?id=${encodeURIComponent(comment.userId)}`} className="text-[#10112a] text-sm font-medium font-['Inter'] leading-snug hover:text-pink-600 transition-colors">
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
                                {/* comment text */}
                                <div className="text-[#17183b] text-sm font-normal font-['Inter'] leading-snug mb-3">
                                    {comment.text}
                                </div>
                                {/* actions row */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleCommentLike(comment.id)}
                                        disabled={loadingCommentLikeState === comment.id}
                                        className={`flex items-center gap-2 transition-colors ${
                                            comment.likedBy?.[user?.uid] === true
                                                ? 'text-[#AA336A] hover:text-[#AA336A]/80'
                                                : 'text-[#64647c] hover:text-[#10112a]'
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
                                                    <path d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65599 4.54372 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={comment.likedBy?.[user?.uid] === true ? "currentColor" : "none"} />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_140_658">
                                                        <rect width="20" height="20" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        )}
                                        <span className="text-sm font-normal font-['Inter']">
                                            {comment.likes > 0 ? `${comment.likes} likes` : 'Like'}
                                        </span>
                                    </button>
                                    <div className="w-px h-5 bg-[#b7b7c2]" />
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenDropdownId(openDropdownId === comment.id ? null : comment.id)}
                                            className="text-[#64647c] hover:text-[#10112a] transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0_140_669)">
                                                    <path d="M3.33301 10.0003C3.33301 10.2213 3.42081 10.4333 3.57709 10.5896C3.73337 10.7459 3.94533 10.8337 4.16634 10.8337C4.38735 10.8337 4.59932 10.7459 4.7556 10.5896C4.91188 10.4333 4.99967 10.2213 4.99967 10.0003C4.99967 9.77931 4.91188 9.56735 4.7556 9.41107C4.59932 9.25479 4.38735 9.16699 4.16634 9.16699C3.94533 9.16699 3.73337 9.25479 3.57709 9.41107C3.42081 9.56735 3.33301 9.77931 3.33301 10.0003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9.16699 10.0003C9.16699 10.2213 9.25479 10.4333 9.41107 10.5896C9.56735 10.7459 9.77931 10.8337 10.0003 10.8337C10.2213 10.8337 10.4333 10.7459 10.5896 10.5896C10.7459 10.4333 10.8337 10.2213 10.8337 10.0003C10.8337 9.77931 10.7459 9.56735 10.5896 9.41107C10.4333 9.25479 10.2213 9.16699 10.0003 9.16699C9.77931 9.16699 9.56735 9.25479 9.41107 9.41107C9.25479 9.56735 9.16699 9.77931 9.16699 10.0003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M15 10.0003C15 10.2213 15.0878 10.4333 15.2441 10.5896C15.4004 10.7459 15.6123 10.8337 15.8333 10.8337C16.0543 10.8337 16.2663 10.7459 16.4226 10.5896C16.5789 10.4333 16.6667 10.2213 16.6667 10.0003C16.6667 9.77931 16.5789 9.56735 16.4226 9.41107C16.2663 9.25479 16.0543 9.16699 15.8333 9.16699C15.6123 9.16699 15.4004 9.25479 15.2441 9.41107C15.0878 9.56735 15 9.77931 15 10.0003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

                    <button className="flex items-center gap-2 py-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#E8E8EB" />
                            <g transform="translate(4 4)" clipPath="url(#clip0)">
                                <path
                                    d="M7.6665 2.5V10.1667"
                                    stroke="#0A0A19"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
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
            )}
            <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
            <CreatePostModal open={showEditModal} onClose={() => setShowEditModal(false)} post={post} />
        </div>
    );
}
