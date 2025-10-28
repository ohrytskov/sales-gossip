// components/home/FeedPost.jsx
import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { unescape as unescapeHtml } from 'html-escaper';
import { formatTimeAgo } from '@/utils/formatTimeAgo';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function FeedPost({
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
}) {
    const [showMore, setShowMore] = useState(false)
    const [showComments, setShowComments] = useState((comments || []).length > 0)
    const [isLogoVisible, setIsLogoVisible] = useState(true)

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

    return (
        <div className="w-[684px] bg-white border-x border-b border-gray-200">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <img src={avatar} alt={username} className="w-12 h-12 rounded-full border border-gray-200" />
                    <div>
                        <div className="text-base font-medium text-slate-900">{username}</div>
                        <div className="text-sm text-slate-600">{formatTimeAgo(timestamp)}</div>
                    </div>
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
                        }`}
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

                    <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-gray-100 rounded-full">
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
                </div>
            </div>
            <div className="px-4">
                <h2 className="text-xl font-medium text-slate-900 font-['Inter'] leading-7 mb-2">{title}</h2>
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
                <div className="px-6 pb-4">

                    <div className="flex items-center text-gray-600 text-sm font-medium font-['Inter'] gap-[7px] mb-[17px]">
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

                    {comments.map(({ id, user, text, time }) => (
                        <div key={id} className="flex items-start gap-4 mb-8">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-6 h-6 rounded-full"
                            />
                            <div className="flex flex-col gap-4">
                                {/* name · time row */}
                                <div className="flex items-center gap-2">
                                    <div className="justify-start text-slate-900 text-sm font-medium font-['Inter'] leading-snug">
                                        {user.name}
                                    </div>
                                    <div data-svg-wrapper>
                                        <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="2" cy="2" r="2" fill="#64647C" />
                                        </svg>
                                    </div>
                                    <div className="justify-start text-gray-500 text-sm font-normal font-['Inter'] leading-snug">
                                        {time}
                                    </div>
                                </div>
                                {/* comment text */}
                                <div className="justify-start text-indigo-950 text-sm font-normal font-['Inter'] leading-snug">
                                    {text}
                                </div>
                                {/* actions row */}
                                <div className="flex items-center gap-2">
                                    <div data-svg-wrapper className="relative">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_140_658)">
                                                <path d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65599 4.54372 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_140_658">
                                                    <rect width="20" height="20" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div className="justify-start text-gray-500 text-sm font-normal font-['Inter']">
                                        Like
                                    </div>
                                    <div data-svg-wrapper>
                                        <svg width="2" height="22" viewBox="0 0 2 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L1 21" stroke="#B7B7C2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div data-svg-wrapper className="relative">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_140_669)">
                                                <path d="M3.33301 10.0003C3.33301 10.2213 3.42081 10.4333 3.57709 10.5896C3.73337 10.7459 3.94533 10.8337 4.16634 10.8337C4.38735 10.8337 4.59932 10.7459 4.7556 10.5896C4.91188 10.4333 4.99967 10.2213 4.99967 10.0003C4.99967 9.77931 4.91188 9.56735 4.7556 9.41107C4.59932 9.25479 4.38735 9.16699 4.16634 9.16699C3.94533 9.16699 3.73337 9.25479 3.57709 9.41107C3.42081 9.56735 3.33301 9.77931 3.33301 10.0003Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9.16699 10.0003C9.16699 10.2213 9.25479 10.4333 9.41107 10.5896C9.56735 10.7459 9.77931 10.8337 10.0003 10.8337C10.2213 10.8337 10.4333 10.7459 10.5896 10.5896C10.7459 10.4333 10.8337 10.2213 10.8337 10.0003C10.8337 9.77931 10.7459 9.56735 10.5896 9.41107C10.4333 9.25479 10.2213 9.16699 10.0003 9.16699C9.77931 9.16699 9.56735 9.25479 9.41107 9.41107C9.25479 9.56735 9.16699 9.77931 9.16699 10.0003Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M15 10.0003C15 10.2213 15.0878 10.4333 15.2441 10.5896C15.4004 10.7459 15.6123 10.8337 15.8333 10.8337C16.0543 10.8337 16.2663 10.7459 16.4226 10.5896C16.5789 10.4333 16.6667 10.2213 16.6667 10.0003C16.6667 9.77931 16.5789 9.56735 16.4226 9.41107C16.2663 9.25479 16.0543 9.16699 15.8333 9.16699C15.6123 9.16699 15.4004 9.25479 15.2441 9.41107C15.0878 9.56735 15 9.77931 15 10.0003Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_140_669">
                                                    <rect width="20" height="20" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="py-2 rounded-[40px] inline-flex justify-center items-center gap-2">
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx={12} cy={12} r={12} fill="#E8E8EB" />
                            <g transform="translate(4 4)" clipPath="url(#clip0)">
                                <path
                                    d="M7.6665 2.5V10.1667"
                                    stroke="#0A0A19"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M10.3333 7.5L7.66667 10.1667L5 7.5M10.3333 10.8333L7.66667 13.5L5 10.8333"
                                    stroke="#0A0A19"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0">
                                    <rect width={16} height={16} fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <div className="justify-start text-slate-950 text-sm font-medium font-['Inter']">Load more comments</div>
                    </div>
                </div>
            )}
        </div>
    );
}
