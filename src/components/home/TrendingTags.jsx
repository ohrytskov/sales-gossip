// Trending tags widget for profile page
import { useMemo } from 'react'
import Link from 'next/link'
import useRtdbDataKey from '@/hooks/useRtdbData'

function TagItem({ hashtag, postsCount }) {
  const normalizedTag = hashtag.replace(/^#/, '')
  
  return (
    <Link href={`/tags?id=${normalizedTag}`} className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
      <div className="flex flex-col">
        <div className="text-[#151636] text-base font-medium font-['Inter']">
          {hashtag}
        </div>
        <div className="text-[#64647c] text-sm font-normal font-['Inter'] mt-1">
          {postsCount} posts
        </div>
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_trending)">
          <path d="M5 12H19" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 18L19 12" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 6L19 12" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_trending">
            <rect width="24" height="24" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </Link>
  )
}

export default function TrendingTags() {
  const { data: tagsData } = useRtdbDataKey('tags')
  
  const trendingTags = useMemo(() => {
    if (!tagsData) return []
    
    let tagsList = []
    if (Array.isArray(tagsData)) {
      tagsData.forEach((entry, idx) => {
        if (!entry) return
        const tag = String(entry.tag || entry.name || entry.key || idx).trim()
        if (!tag) return
        tagsList.push({
          tag,
          count: Number(entry.count) || 0,
          firstMs: Number(entry.firstMs) || 0,
          lastMs: Number(entry.lastMs) || 0,
        })
      })
    } else {
      Object.entries(tagsData).forEach(([tagKey, entry]) => {
        if (!tagKey || !entry) return
        tagsList.push({
          tag: String(tagKey).trim(),
          count: Number(entry.count) || 0,
          firstMs: Number(entry.firstMs) || 0,
          lastMs: Number(entry.lastMs) || 0,
        })
      })
    }
    
    // Sort by trending (most recent activity)
    return tagsList
      .sort((a, b) => b.lastMs - a.lastMs)
      .map(item => ({
        hashtag: item.tag.startsWith('#') ? item.tag : `#${item.tag}`,
        postsCount: item.count
      }))
  }, [tagsData])

  return (
    <div className="w-[389px] max-h-[321px] relative rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] overflow-hidden bg-white">
      <div className="px-[16px] pt-[24px] pb-4 text-[#64647c] text-sm font-medium font-['Inter'] uppercase">
        What's happening
      </div>

      {trendingTags.length > 0 ? (
        <div className="px-[16px] pb-4 max-h-[calc(321px-72px)] overflow-y-auto">
          {trendingTags.map((tag, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <TagItem hashtag={tag.hashtag} postsCount={tag.postsCount} />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-[16px] pb-4 text-[#64647c] text-sm font-normal font-['Inter']">
          No trending tags yet
        </div>
      )}
    </div>
  )
}