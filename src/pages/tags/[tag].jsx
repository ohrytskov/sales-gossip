import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import FeedPost from '@/components/home/FeedPost'
import useRtdbDataKey from '@/hooks/useRtdbData'

const getCreatedAtMs = (post) => {
  const raw = post && (post.createdAt || post.timestamp) ? post.createdAt || post.timestamp : ''
  const parsed = Date.parse(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function TagPage() {
  const router = useRouter()
  const rawTag = router.query.tag
  const tagValue = typeof rawTag === 'string' ? rawTag.trim() : ''
  const normalizedTag = tagValue.toLowerCase()
  const tagLabel = tagValue ? (tagValue.startsWith('#') ? tagValue : `#${tagValue}`) : ''
  const [selectedSort, setSelectedSort] = useState('Best')
  const [followed, setFollowed] = useState({})
  const sortOptions = ['Best', 'New', 'Top', 'Rising']
  const { data: postsData } = useRtdbDataKey('posts')
  const posts = postsData ? Object.values(postsData) : []
  const filteredPosts = posts.filter(post => {
    if (!normalizedTag) return false
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

  const toggleFollow = (id) => {
    setFollowed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const computedCount = filteredPosts.length
  const relatedText = computedCount > 0
    ? `${computedCount} related ${computedCount === 1 ? 'post' : 'posts'}`
    : 'No posts yet'

  return (
    <div className="relative">
      <Header />
      <main className="max-w-[1440px] w-full mx-auto flex gap-16 px-[142px] pt-[52px] pb-12">
        <section className="flex flex-col w-[684px]">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
            <Link href="/tags" className="inline-block">
              <div data-layer="Primary Button" className="PrimaryButton size-8 px-3 py-2 bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2">
                <div data-svg-wrapper data-layer="Back" className="Back relative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_10214_2417)">
                      <path d="M12.6663 7.5C12.9425 7.5 13.1663 7.72386 13.1663 8C13.1663 8.27614 12.9425 8.5 12.6663 8.5H3.33301C3.05687 8.5 2.83301 8.27614 2.83301 8C2.83301 7.72386 3.05687 7.5 3.33301 7.5H12.6663Z" fill="#9B2E60" />
                      <path d="M2.97945 7.64645C3.17472 7.45118 3.49122 7.45118 3.68649 7.64645L7.68649 11.6464C7.88175 11.8417 7.88175 12.1582 7.68649 12.3535C7.49122 12.5487 7.17472 12.5487 6.97945 12.3535L2.97945 8.35348C2.78419 8.15822 2.78419 7.84171 2.97945 7.64645Z" fill="#9B2E60" />
                      <path d="M6.97945 3.64645C7.17472 3.45118 7.49122 3.45118 7.68649 3.64645C7.88175 3.84171 7.88175 4.15822 7.68649 4.35348L3.68649 8.35348C3.49122 8.54874 3.17472 8.54874 2.97945 8.35348C2.78419 8.15822 2.78419 7.84171 2.97945 7.64645L6.97945 3.64645Z" fill="#9B2E60" />
                    </g>
                    <defs>
                      <clipPath id="clip0_10214_2417">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
            </Link>
            {tagLabel || relatedText ? (
              <div className="flex items-center justify-between gap-4">
                {tagLabel ? (
                  <div data-layer="Tag" className="Tag size- px-3 py-1 bg-[#e5e5ea] rounded-lg inline-flex justify-center items-center gap-2">
                    <div data-layer="Dropdown text" className="DropdownText justify-start text-[#10112a] text-xl font-medium font-['Inter'] leading-7">
                      {tagLabel}
                    </div>
                  </div>
                ) : <span />}
                {relatedText ? (
                  <div data-layer="Post text" className="PostText justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal text-right">
                    {relatedText}
                  </div>
                ) : null}
              </div>
            ) : null}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div data-layer="Frame 48097075" className="Frame48097075 size- inline-flex justify-start items-center gap-2">
              <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_311_6871)">
                    <path d="M2 6.50065L4.66667 3.83398M4.66667 3.83398L7.33333 6.50065M4.66667 3.83398V13.1673" stroke="#454662" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14.0003 10.5007L11.3337 13.1673M11.3337 13.1673L8.66699 10.5007M11.3337 13.1673V3.83398" stroke="#454662" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_311_6871">
                      <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div data-layer="Sort by" className="SortBy justify-start text-[#454662] text-sm font-medium font-['Inter']">Sort by</div>
            </div>
            <div data-layer="Segmented" className="Segmented size- p-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e8e8eb] inline-flex justify-start items-center">
              {sortOptions.map(option => {
                const active = selectedSort === option
                return (
                  <button
                    key={option}
                    type="button"
                    data-layer="Menu"
                    data-property-1={active ? 'Selected - Without icon' : 'Default - Without icon'}
                    onClick={() => setSelectedSort(option)}
                    className={`Menu h-8 px-3 py-2 rounded-md flex justify-center items-center gap-2 transition-colors ${active ? 'bg-[#79244b] text-white' : 'text-[#10112a] hover:bg-[#f7e8ee]'}`}
                  >
                    <div data-layer="Menu" className={`Menu justify-start text-sm font-['Inter'] leading-snug ${active ? 'font-medium text-white' : 'font-normal'}`}>
                      {option}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col">
            {sortedPosts.length > 0 ? (
              <div className="w-full">
                <div className="w-full bg-white rounded-t-2xl border border-gray-200">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">
                      {computedCount} {computedCount === 1 ? 'post' : 'posts'}
                    </span>
                    <span className="text-sm text-slate-600">
                      Sorted by {selectedSort}
                    </span>
                  </div>
                </div>
                {sortedPosts.map(post => (
                  <FeedPost
                    key={post.id}
                    {...post}
                    onFollow={() => toggleFollow(post.id)}
                  />
                ))}
                <div className="w-full h-4 relative bg-white border border-t-0 mt-[-1px] mb-10 border-gray-200 rounded-bl-2xl rounded-br-2xl" />
              </div>
            ) : (
              <div className="w-full border border-gray-200 rounded-2xl bg-white p-6 text-center text-slate-600">
                No posts yet for this tag
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
