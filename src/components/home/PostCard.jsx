// components/home/PostCard.jsx
import { unescape as unescapeHtml } from 'html-escaper'
import { getInitials } from '@/utils/getInitials'

const formatCount = (value) => {
  if (value == null) return '0'
  if (typeof value === 'string') return value
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '0'
  if (numeric >= 1000) {
    const shortened = numeric / 1000
    const display = shortened >= 10 ? Math.round(shortened) : Math.round(shortened * 10) / 10
    return `${display}k`
  }
  return `${numeric}`
}

const getCommentsAmount = (post) => {
  if (!post) return 0
  if (Number.isFinite(post.commentsCount)) return post.commentsCount
  if (Array.isArray(post.comments)) return post.comments.length
  if (post.comments && typeof post.comments === 'object') return Object.keys(post.comments).length
  return 0
}

export default function PostCard({ post = {}, onClick = null }) {
  const {
    bgImage,
    avatar,
    authorAvatar,
    mediaUrl,
    image,
    coverImage,
    companyLogo,
    companyAvatar,
    username,
    authorName,
    author,
    likes,
    excerpt,
    caption,
    title,
    sourceName,
    sourceLogo,
    companyName,
  } = post

  const displayName = username || authorName || author || 'Anonymous'
  const avatarUrl = authorAvatar || avatar || '/images/feed/avatar1.svg'
  const backgroundImage = mediaUrl || image || coverImage || bgImage || ''
  const renderedCaption = (() => {
    const candidate = title || excerpt || caption || ''
    return typeof candidate === 'string' && candidate.length ? unescapeHtml(candidate) : candidate
  })()
  const companyLabel = companyName || sourceName || ''
  const companyLogoSrc = companyLogo || companyAvatar || sourceLogo || ''
  const commentsAmount = getCommentsAmount(post)
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    <div className="flex-shrink-0 w-[400px]">
      <div
        className={`relative h-[220px] w-[400px] overflow-hidden rounded-2xl bg-zinc-200 shadow-[0_4px_12px_rgba(16,17,42,0.15)] ${onClick ? 'cursor-pointer hover:shadow-[0_6px_16px_rgba(16,17,42,0.2)] transition-shadow' : ''}`}
        style={backgroundStyle}
        onClick={onClick}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.1) 40%, rgba(7,7,29,0.85) 100%)',
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white/20 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.08em] text-white font-semibold">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-['Inter'] text-lg font-semibold text-white leading-tight">{displayName}</span>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/80 font-['Inter']">
                <span>{formatCount(likes)} likes</span>
                <span>•</span>
                <span>{formatCount(commentsAmount)} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderedCaption && (
        <p
          className="mt-5 text-base font-semibold leading-6 text-slate-900 font-['Inter']"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {renderedCaption}
        </p>
      )}

      {companyLabel && (
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 font-['Inter']">
          {companyLogoSrc ? (
            <img
              src={companyLogoSrc}
              alt={companyLabel}
              className="h-5 w-5 rounded-full border border-zinc-200 object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-zinc-200 flex-shrink-0" />
          )}
          <span className="font-medium text-slate-900">{companyLabel}</span>
        </div>
      )}
    </div>
  )
}
