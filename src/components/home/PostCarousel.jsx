// components/home/PostCarousel.jsx
import { useMemo, useRef } from 'react'
import PostCard from './PostCard'
import useRtdbDataKey from '@/hooks/useRtdbData'

const parseDateMs = (value) => {
  if (!value) return 0
  if (typeof value === 'number') return value
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getCreatedAtMs = (post) => {
  if (!post) return 0
  return parseDateMs(post.createdAt) || parseDateMs(post.timestamp)
}

const hasMedia = (post) => {
  if (!post) return false
  const mediaUrl = typeof post.mediaUrl === 'string' ? post.mediaUrl.trim() : ''
  if (mediaUrl) return true
  const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls : []
  return mediaUrls.some((url) => typeof url === 'string' && url.trim())
}

const normalizePosts = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') return Object.values(value).filter(Boolean)
  return []
}

export default function PostCarousel({ posts: fallbackPosts }) {
  const scrollRef = useRef(null)
  const { data: postsData } = useRtdbDataKey('posts')

  const posts = useMemo(() => {
    const sourcePosts =
      fallbackPosts && fallbackPosts.length > 0 ? fallbackPosts : normalizePosts(postsData)
    if (!sourcePosts.length) return []
    const sorted = [...sourcePosts].sort((a, b) => {
      const mediaDiff = Number(hasMedia(b)) - Number(hasMedia(a))
      if (mediaDiff !== 0) return mediaDiff
      const createdDiff = getCreatedAtMs(b) - getCreatedAtMs(a)
      if (createdDiff !== 0) return createdDiff
      return (b.likes || 0) - (a.likes || 0)
    })
    return sorted
  }, [fallbackPosts, postsData])

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -424 : 424,
      behavior: 'smooth',
    })
  }

  const handlePostClick = (postId) => {
    const element = document.getElementById(`post-${postId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (!posts.length) {
    return null
  }

  return (
    <section className="relative bg-zinc-100 py-10">
      <div className="mx-auto">
        <h2 className="text-xl font-medium text-slate-900 mb-6 font-['Inter'] leading-7 ml-[142px]">
          Featured Posts & News
        </h2>

        <div className="relative">
          {/* Left fade (above cards) */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-32
                       bg-gradient-to-r from-zinc-100 to-white/0 z-20"
          />

          {/* Right fade (above cards) */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-32
                       bg-gradient-to-l from-zinc-100 to-white/0 z-20"
          />

          {/* Scrollable cards container */}
          <div
            ref={scrollRef}
            className="relative z-10 flex gap-[24px] overflow-x-auto scrollbar-none px-2"
          >
            {posts.map((post, idx) => (
              <PostCard 
                key={`${post?.id ?? 'p'}-${idx}`} 
                post={post} 
                onClick={() => post?.id && handlePostClick(post.id)}
              />
            ))}
          </div>

          {/* Left nav arrow (above fades) */}
          <button
            onClick={() => scroll('left')}
            className="absolute top-1/3 left-[24px] -translate-y-1/2
                       p-0 bg-white rounded-full shadow-lg z-30"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" transform="matrix(-1 0 0 1 40 0)" fill="white" />
              <g clipPath="url(#clip0_484_6562)">
                <path d="M27 20H13" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 26L13 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 14L13 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_484_6562">
                  <rect width="24" height="24" fill="white" transform="matrix(-1 0 0 1 32 8)" />
                </clipPath>
              </defs>
            </svg>
          </button>

          {/* Right nav arrow (above fades) */}
          <button
            onClick={() => scroll('right')}
            className="absolute top-1/3 right-[24px] -translate-y-1/2
                       p-0 bg-white rounded-full shadow-lg z-30"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="white" />
              <g clipPath="url(#clip0_484_6556)">
                <path d="M13 20H27" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 26L27 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 14L27 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_484_6556">
                  <rect width="24" height="24" fill="white" transform="translate(8 8)" />
                </clipPath>
              </defs>
            </svg>

          </button>
        </div>
      </div>
    </section>
  )
}
