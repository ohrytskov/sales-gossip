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

export default function CompactPost({ post }) {
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
    <article className="flex w-full min-h-[144px] items-center justify-between border-x border-b border-gray-200 bg-white px-6 py-6">
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
        <div className="relative ml-6 h-[96px] w-[166px] overflow-hidden rounded-[6px] flex-shrink-0">
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
