import { useState } from 'react'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import Search from '@/components/home/Search'
import useRtdbDataKey from '@/hooks/useRtdbData'

export default function Tags() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: postsData } = useRtdbDataKey('posts')
  const { data: sampleFeedData } = useRtdbDataKey('sampleFeed')
  const [selectedSegment, setSelectedSegment] = useState('Trending now')

  // prefer live `posts` if available, otherwise fallback to local `sampleFeed`
  let posts = []
  if (postsData) posts = Array.isArray(postsData) ? postsData : Object.values(postsData)
  else if (sampleFeedData) posts = Array.isArray(sampleFeedData) ? sampleFeedData : Object.values(sampleFeedData)

  // build stats per tag: count, firstSeenMs, lastSeenMs (timestamps may be ISO or absent)
  const stats = new Map()
  for (const p of posts) {
    if (!p) continue
    const raw = p.createdAt || p.timestamp || ''
    let createdMs = 0
    try {
      const parsed = Date.parse(raw)
      if (!isNaN(parsed)) createdMs = parsed
    } catch (e) {
      createdMs = 0
    }
    const tgs = p.tags || []
    for (const t of tgs) {
      const key = String(t || '').trim()
      if (!key) continue
      if (!stats.has(key)) stats.set(key, { count: 0, firstMs: Infinity, lastMs: 0 })
      const s = stats.get(key)
      s.count = (s.count || 0) + 1
      if (createdMs > 0) {
        s.firstMs = Math.min(s.firstMs || Infinity, createdMs)
        s.lastMs = Math.max(s.lastMs || 0, createdMs)
      }
    }
  }

  let tagsList = Array.from(stats.entries()).map(([tag, { count, firstMs, lastMs }]) => ({
    tag,
    count: count || 0,
    firstMs: firstMs === Infinity ? 0 : (firstMs || 0),
    lastMs: lastMs || 0,
  }))

  // sort according to selected segment
  tagsList = [...tagsList].sort((a, b) => {
    if (selectedSegment === 'Trending now') {
      if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs
      if (b.count !== a.count) return b.count - a.count
      return a.tag.localeCompare(b.tag)
    }
    if (selectedSegment === 'Most used') {
      if (b.count !== a.count) return b.count - a.count
      if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs
      return a.tag.localeCompare(b.tag)
    }
    // New: tags first seen most recently
    if (b.firstMs !== a.firstMs) return b.firstMs - a.firstMs
    if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs
    return a.tag.localeCompare(b.tag)
  })

  const filtered = tagsList.filter(item => item.tag.toLowerCase().includes(searchQuery.trim().toLowerCase()))

  return (
    <div className="relative">
      <Header />
      <div data-layer="Frame 48097006" className="Frame48097006 w-[1440px] h-44 relative bg-[#eff3fe] overflow-hidden">
        <div data-layer="Tags" className="Tags left-[178px] top-[40px] absolute justify-start text-black text-xl font-medium font-['Inter'] leading-7">Tags</div>
        
        <div data-layer="Post text" className="PostText w-96 left-[142px] top-[82px] absolute justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal">Tags are keywords that help group your gossip or post with similar content.</div>

        <div className="left-[681px] top-[90px] absolute inline-flex items-center gap-4">
          <FloatingInput
            id="tags-search"
            value={searchQuery}
            onChange={setSearchQuery}
            label="Search tags"
            data-layer="Search"
            className="Search w-80 inline-flex items-center gap-2 overflow-hidden"
            rounded="full"
            style={{ width: '320px', height: '40px', outline: 'none', boxShadow: 'none' }}
            inputProps={{
              className: 'text-[#9495a5] text-base font-normal leading-none',
              'aria-label': 'Search tags'
            }}
            rightElement={<Search />}
          />

          <div data-layer="Segmented" className="Segmented p-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e8e8eb] inline-flex justify-start items-center">
            {['Trending now', 'Most used', 'New'].map((seg) => {
              const active = selectedSegment === seg
              return (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setSelectedSegment(seg)}
                  className={`h-8 px-3 py-2 rounded-md flex justify-center items-center gap-2 ${active ? 'bg-[#79244b]' : ''}`}
                >
                  <div className={`${active ? 'text-sm font-medium text-white' : 'text-sm font-normal text-[#10112a]'} font-['Inter'] leading-[22px] break-words`}>{seg}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div data-layer="Bounding box" className="BoundingBox size-6 left-[142px] top-[42px] absolute bg-transparent" />
        <div data-svg-wrapper data-layer="shoppingmode" className="Shoppingmode left-[144.50px] top-[44.50px] absolute">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_311_6493_dup" maskType="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
              <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_311_6493_dup)">
              <path d="M11.0765 21.5C10.8505 21.5 10.624 21.4548 10.397 21.3645C10.1698 21.274 9.96539 21.1384 9.78373 20.9578L3.02798 14.202C2.84464 14.0193 2.71098 13.8176 2.62698 13.5968C2.54298 13.3761 2.50098 13.1516 2.50098 12.9233C2.50098 12.6949 2.54298 12.4672 2.62698 12.24C2.71098 12.013 2.84464 11.8087 3.02798 11.627L11.5972 3.04225C11.7632 2.87658 11.9594 2.74483 12.1857 2.647C12.4121 2.549 12.646 2.5 12.8875 2.5H19.6682C20.1734 2.5 20.6026 2.67792 20.9557 3.03375C21.3089 3.38975 21.4855 3.81758 21.4855 4.31725V11.098C21.4855 11.342 21.4403 11.5745 21.35 11.7955C21.2596 12.0165 21.1292 12.209 20.9587 12.373L12.3645 20.9578C12.1836 21.1384 11.9802 21.274 11.7542 21.3645C11.5284 21.4548 11.3025 21.5 11.0765 21.5ZM10.853 19.9038C10.917 19.9679 10.9923 20 11.079 20C11.1655 20 11.2407 19.9679 11.3047 19.9038L19.899 11.3038C19.9311 11.2718 19.9536 11.2365 19.9665 11.198C19.9791 11.1597 19.9855 11.1213 19.9855 11.0828V4.31725C19.9855 4.22758 19.9551 4.15392 19.8942 4.09625C19.8334 4.03842 19.7581 4.0095 19.6682 4.0095H12.778L4.09723 12.6962C4.03306 12.7603 4.00098 12.8355 4.00098 12.922C4.00098 13.0087 4.03306 13.084 4.09723 13.148L10.853 19.9038ZM15.4567 7.77875C15.8066 7.77875 16.104 7.65725 16.349 7.41425C16.5938 7.17125 16.7162 6.87608 16.7162 6.52875C16.7162 6.17892 16.5942 5.88158 16.3502 5.63675C16.1061 5.39175 15.8096 5.26925 15.4607 5.26925C15.1119 5.26925 14.8157 5.39133 14.5722 5.6355C14.3286 5.87967 14.2067 6.17617 14.2067 6.525C14.2067 6.87367 14.3282 7.16983 14.5712 7.4135C14.8144 7.657 15.1096 7.77875 15.4567 7.77875Z" fill="#1C1B1F" />
            </g>
          </svg>
        </div>
      </div>

      <div className="mx-[142px]">
        {filtered.length > 0 ? (
          <div className="mt-[48px] flex flex-wrap gap-6 overflow-y-auto">
            {filtered.map((item) => {
              const displayTag = item.tag && String(item.tag).startsWith('#') ? item.tag : `#${item.tag}`
              return (
                <div key={item.tag} data-layer="Frame 48097089" className="Frame48097089 w-[271px] h-[91px] relative bg-white overflow-hidden rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e8e8eb]">
                  <div data-layer="Tag" className="Tag px-3 py-1 left-[16px] top-[16px] absolute bg-[#E5E5EA] rounded-lg inline-flex justify-center items-center gap-2">
                    <div data-layer="Dropdown text" className="DropdownText justify-start text-[#10112A] text-sm font-normal font-['Inter'] leading-[22px] break-words">{displayTag}</div>
                  </div>
                  <div data-layer="Comments count" className="CommentsCount left-[16px] top-[58px] absolute justify-start text-[#454662] text-sm font-medium font-['Inter'] break-words">{item.count} related posts</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center mt-[54px]">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_362_7683)">
                <path d="M8.11856 7.72899C8.13666 7.59188 8.10338 7.45292 8.02513 7.33888C7.94689 7.22484 7.82921 7.14379 7.69477 7.11134C7.56033 7.07889 7.41864 7.09733 7.29699 7.16312C7.17534 7.22891 7.08233 7.33739 7.03589 7.46766C5.59856 13.4783 5.76656 32.7983 6.99856 37.8943C7.80122 41.0677 17.1532 41.161 20.5319 41.1797C20.6792 41.1541 20.8128 41.0774 20.9091 40.963C21.0053 40.8486 21.0581 40.7038 21.0581 40.5543C21.0581 40.4048 21.0053 40.2601 20.9091 40.1457C20.8128 40.0313 20.6792 39.9545 20.5319 39.929C17.8252 39.7983 11.7586 39.3877 9.33189 38.0623C8.62256 37.6703 8.51056 38.417 8.08122 27.1797C7.91322 22.793 7.76389 19.5823 7.72656 15.6437C7.81989 15.289 7.87589 9.07299 8.11856 7.72899Z" fill="#17183B" />
                <path d="M41.6029 13.9441C32.6989 13.9441 28.0695 12.9361 9.45885 13.9441C9.34321 13.9586 9.23532 14.01 9.15124 14.0907C9.06716 14.1714 9.01138 14.2771 8.99219 14.3921V14.5974C9.01473 14.7226 9.08214 14.8353 9.1818 14.9143C9.28145 14.9933 9.4065 15.0333 9.53352 15.0268C15.6002 14.9148 17.1309 16.0721 41.6215 15.0268C41.7162 15.0761 41.8221 15.0999 41.9288 15.0959C42.0354 15.092 42.1393 15.0604 42.23 15.0042C42.3208 14.948 42.3955 14.8693 42.4466 14.7756C42.4978 14.6819 42.5237 14.5765 42.5219 14.4697C42.52 14.363 42.4905 14.2586 42.4361 14.1667C42.3818 14.0748 42.3045 13.9987 42.2118 13.9456C42.1191 13.8926 42.0143 13.8646 41.9075 13.8644C41.8008 13.8641 41.6958 13.8916 41.6029 13.9441Z" fill="#17183B" />
              </g>
            </svg>

            <p className="text-[#0a0a19] text-[14px] leading-[20px] font-medium text-center max-w-[177px]">{`No search results found for "${searchQuery}"`}</p>
          </div>
        )}
      </div>
    </div>
  )
}
