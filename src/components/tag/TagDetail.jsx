import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import useRtdbDataKey from '@/hooks/useRtdbData'

const getCreatedAtMs = (post) => {
  const raw = post && (post.createdAt || post.timestamp) ? post.createdAt || post.timestamp : ''
  const parsed = Date.parse(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatTimeAgo = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSeconds < 60) return 'just now'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'}`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`
  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'}`
}

const getInitials = (value) => {
  if (!value) return 'SG'
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const normalizeTag = (tag) => {
  if (!tag) return ''
  return tag.startsWith('#') ? tag : `#${tag}`
}

const TagPostCard = ({ post }) => {
  const username = post?.username || post?.author || post?.authorName || 'Anonymous'
  const avatar = post?.avatar || post?.authorAvatar || '/images/feed/avatar1.svg'
  const timestamp = post?.timestamp || post?.createdAt || ''
  const title = post?.title || post?.headline || ''
  const companyName = post?.companyName || post?.company || ''
  const companyLogo = post?.companyLogo || post?.companyAvatar || ''
  const mediaUrl = post?.mediaUrl || post?.image || post?.coverImage || ''
  const mediaDuration = post?.mediaDuration || post?.videoDuration || post?.duration || ''
  const tags = Array.isArray(post?.tags) ? post.tags.map(normalizeTag) : []

  const renderAvatar = () => {
    if (!avatar) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f2f2f4] text-[10px] font-semibold text-[#79244b]">
          {getInitials(username)}
        </div>
      )
    }
    return (
      <img
        src={avatar}
        alt={username}
        className="h-6 w-6 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/images/feed/avatar1.svg'
        }}
      />
    )
  }

  return (
    <article className="flex w-full min-h-[144px] items-center justify-between rounded-[12px] border border-[#e8e8eb] bg-white px-6 py-6">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          {renderAvatar()}
          <div className="flex items-center gap-2 text-sm leading-[22px] text-[#454662]">
            <span className="font-medium text-[#454662]">{username}</span>
            {timestamp ? (
              <>
                <span className="h-1 w-1 rounded-full bg-[#9495a5]" />
                <span>{formatTimeAgo(timestamp)}</span>
              </>
            ) : null}
          </div>
        </div>

        {title ? (
          <h3 className="text-[16px] font-medium leading-6 text-[#10112a] break-words">{title}</h3>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          {companyName ? (
            <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content] items-center gap-3">
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="row-start-1 h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="row-start-1 h-6 w-6 rounded-full bg-[#f2f2f4]" />
              )}
              <span className="row-start-1 ml-[28px] text-sm font-medium leading-[20px] text-[#10112a]">
                {companyName}
              </span>
            </div>
          ) : null}

          {companyName && tags.length > 0 ? <div className="h-6 w-px bg-[#e8e8eb]" /> : null}

          <div className="flex flex-wrap items-center gap-3">
            {(tags.length > 0 ? tags : []).map(tag => (
              <span
                key={tag}
                className="inline-flex h-6 items-center justify-center rounded-lg bg-[#f2f2f4] px-3 text-xs font-normal leading-5 text-[#10112a]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {mediaUrl ? (
        <div className="relative ml-6 h-[96px] w-[166px] overflow-hidden rounded-[6px]">
          <img src={mediaUrl} alt={title || 'Post media'} className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
          {mediaDuration ? (
            <div className="absolute bottom-2 left-1/2 flex h-5 -translate-x-1/2 items-center gap-1 rounded-[4px] bg-[rgba(16,17,42,0.7)] px-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.375 3.5L9.625 7L4.375 10.5V3.5Z" fill="white" />
              </svg>
              <span className="text-xs font-medium leading-[14px] text-white">{mediaDuration}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export default function TagDetail({ tagName }) {
  const router = useRouter()
  const normalizedTag = typeof tagName === 'string' ? tagName.trim().toLowerCase() : ''
  const tagLabel = tagName ? (tagName.startsWith('#') ? tagName : `#${tagName}`) : ''
  const [selectedSort, setSelectedSort] = useState('Best')
  const sortOptions = ['Best', 'New', 'Top', 'Rising']
  const { data: postsData } = useRtdbDataKey('posts')

  if (!normalizedTag) return null

  const posts = postsData ? Object.values(postsData) : []
  const filteredPosts = posts.filter(post => {
    const tags = post?.tags || []
    return tags.some(tag => tag.toLowerCase() === normalizedTag)
  })

  const sortedPosts = [...filteredPosts]
  if (selectedSort === 'Best') {
    sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  } else if (selectedSort === 'New') {
    sortedPosts.sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a))
  } else if (selectedSort === 'Top') {
    sortedPosts.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0))
  } else if (selectedSort === 'Rising') {
    sortedPosts.sort((a, b) => (b.shares || 0) - (a.shares || 0))
  }

  const computedCount = filteredPosts.length
  const relatedText = computedCount > 0
    ? `${computedCount} related ${computedCount === 1 ? 'post' : 'posts'}`
    : 'No posts yet'

  return (
    <div className="bg-white">
      <Header />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-[142px] pb-24 pt-[50px]">
        <section className="flex w-full max-w-[1156px] flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => router.back()} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#b7b7c2] bg-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.6663 7.5C12.9425 7.5 13.1663 7.72386 13.1663 8C13.1663 8.27614 12.9425 8.5 12.6663 8.5H3.33301C3.05687 8.5 2.83301 8.27614 2.83301 8C2.83301 7.72386 3.05687 7.5 3.33301 7.5H12.6663Z" fill="#9B2E60" />
                  <path d="M2.97945 7.64645C3.17472 7.45118 3.49122 7.45118 3.68649 7.64645L7.68649 11.6464C7.88175 11.8417 7.88175 12.1582 7.68649 12.3535C7.49122 12.5487 7.17472 12.5487 6.97945 12.3535L2.97945 8.35348C2.78419 8.15822 2.78419 7.84171 2.97945 7.64645Z" fill="#9B2E60" />
                  <path d="M6.97945 3.64645C7.17472 3.45118 7.49122 3.45118 7.68649 3.64645C7.88175 3.84171 7.88175 4.15822 7.68649 4.35348L3.68649 8.35348C3.49122 8.54874 3.17472 8.54874 2.97945 8.35348C2.78419 8.15822 2.78419 7.84171 2.97945 7.64645L6.97945 3.64645Z" fill="#9B2E60" />
                </svg>
              </button>
              {tagLabel ? (
                <span className="inline-flex h-8 items-center justify-center rounded-lg bg-[#e5e5ea] px-3 text-xl font-medium leading-7 text-[#10112a]">
                  {tagLabel}
                </span>
              ) : null}
              {relatedText ? (
                <span className="text-base font-normal leading-6 text-[#454662]">
                  {relatedText}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium leading-[22px] text-[#454662]">
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_311_6871)">
                    <path d="M2 6.50065L4.66667 3.83398M4.66667 3.83398L7.33333 6.50065M4.66667 3.83398V13.1673" stroke="#454662" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.0003 10.5007L11.3337 13.1673M11.3337 13.1673L8.66699 10.5007M11.3337 13.1673V3.83398" stroke="#454662" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_311_6871">
                      <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
                    </clipPath>
                  </defs>
                </svg>
                Sort by
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#e8e8eb] bg-white p-1">
                {sortOptions.map(option => {
                  const active = selectedSort === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedSort(option)}
                      className={`h-8 px-3 rounded-md flex items-center justify-center text-sm leading-[22px] transition-colors ${active ? 'bg-[#79244b] font-medium text-white' : 'font-normal text-[#10112a] hover:bg-[#f7e8ee]'}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {sortedPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {sortedPosts.map(post => (
                <TagPostCard key={post.id || post.slug || post.title} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[12px] border border-[#e8e8eb] bg-white px-6 py-10 text-center text-base text-[#454662]">
              No posts yet for this tag
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
