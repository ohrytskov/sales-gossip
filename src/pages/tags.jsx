import { useState } from 'react'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import Search from '@/components/home/Search'
import useRtdbDataKey from '@/hooks/useRtdbData'

const relativeUnits = [
  { test: unit => unit.startsWith('sec') || unit === 's', ms: 1000 },
  { test: unit => unit.startsWith('min') || unit === 'm', ms: 60 * 1000 },
  { test: unit => unit.startsWith('hour') || unit.startsWith('hr') || unit === 'h', ms: 60 * 60 * 1000 },
  { test: unit => unit.startsWith('day') || unit === 'd', ms: 24 * 60 * 60 * 1000 },
  { test: unit => unit.startsWith('week') || unit.startsWith('wk') || unit === 'w', ms: 7 * 24 * 60 * 60 * 1000 },
]

function parseTimestamp(raw, nowMs) {
  if (raw instanceof Date) return raw.getTime()
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw === null || raw === undefined) return 0

  const str = String(raw).trim()
  if (!str) return 0

  const parsed = Date.parse(str)
  if (!Number.isNaN(parsed)) return parsed

  const lower = str.toLowerCase()
  const value = parseFloat(lower)
  if (Number.isNaN(value)) return 0

  let unit = lower.replace(/^[\d.\s]+/, '').trim()
  if (unit.endsWith('ago')) unit = unit.slice(0, -3).trim()
  if (!unit) return 0

  for (const entry of relativeUnits) {
    if (entry.test(unit)) return nowMs - value * entry.ms
  }

  return 0
}

export default function Tags() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: postsData } = useRtdbDataKey('posts')
  const { data: sampleFeedData } = useRtdbDataKey('sampleFeed')
  const [selectedSegment, setSelectedSegment] = useState('Trending now')
  const segments = ['Trending now', 'Most used', 'New']
  const nowMs = Date.now()

  // prefer live `posts` if available, otherwise fallback to local `sampleFeed`
  let posts = []
  if (postsData) posts = Array.isArray(postsData) ? postsData : Object.values(postsData)
  else if (sampleFeedData) posts = Array.isArray(sampleFeedData) ? sampleFeedData : Object.values(sampleFeedData)

  // build stats per tag: count, firstSeenMs, lastSeenMs (prefer updatedAt when available)
  const stats = new Map()
  for (const p of posts) {
    if (!p) continue
    const rawCreated = p.createdAt ?? p.timestamp ?? ''
    const rawUpdated = p.updatedAt ?? rawCreated
    const createdMs = parseTimestamp(rawCreated, nowMs)
    const updatedMsRaw = parseTimestamp(rawUpdated, nowMs)
    const recencyMs = updatedMsRaw > 0 ? updatedMsRaw : createdMs
    const tgs = p.tags || []
    const firstCandidate = createdMs > 0 ? createdMs : recencyMs
    for (const t of tgs) {
      const key = String(t || '').trim()
      if (!key) continue
      if (!stats.has(key)) stats.set(key, { count: 0, firstMs: Infinity, lastMs: 0 })
      const s = stats.get(key)
      s.count = (s.count || 0) + 1
      if (firstCandidate > 0) s.firstMs = Math.min(s.firstMs || Infinity, firstCandidate)
      if (recencyMs > 0) {
        s.lastMs = Math.max(s.lastMs || 0, recencyMs)
      }
    }
  }

  const tagsList = Array.from(stats.entries()).map(([tag, { count, firstMs, lastMs }]) => ({
    tag,
    count: count || 0,
    firstMs: firstMs === Infinity ? 0 : (firstMs || 0),
    lastMs: lastMs || 0,
  }))

  const sorters = {
    'Trending now': (a, b) => {
      if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs
      if (b.count !== a.count) return b.count - a.count
      return a.tag.localeCompare(b.tag)
    },
    'Most used': (a, b) => {
      if (b.count !== a.count) return b.count - a.count
      if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs
      return a.tag.localeCompare(b.tag)
    },
    New: (a, b) => {
      if (b.firstMs !== a.firstMs) return b.firstMs - a.firstMs
      if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs
      return a.tag.localeCompare(b.tag)
    },
  }

  const sortedTags = [...tagsList].sort(sorters[selectedSegment] || sorters['Trending now'])

  const filtered = sortedTags.filter(item => item.tag.toLowerCase().includes(searchQuery.trim().toLowerCase()))

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
            {segments.map(seg => {
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
                <path fillRule="evenodd" clipRule="evenodd" d="M8.11856 7.72899C8.13666 7.59188 8.10338 7.45292 8.02513 7.33888C7.94689 7.22484 7.82921 7.14379 7.69477 7.11134C7.56033 7.07889 7.41864 7.09733 7.29699 7.16312C7.17534 7.22891 7.08233 7.33739 7.03589 7.46766C5.59856 13.4783 5.76656 32.7983 6.99856 37.8943C7.80122 41.0677 17.1532 41.161 20.5319 41.1797C20.6792 41.1541 20.8128 41.0774 20.9091 40.963C21.0053 40.8486 21.0581 40.7038 21.0581 40.5543C21.0581 40.4048 21.0053 40.2601 20.9091 40.1457C20.8128 40.0313 20.6792 39.9545 20.5319 39.929C17.8252 39.7983 11.7586 39.3877 9.33189 38.0623C8.62256 37.6703 8.51056 38.417 8.08122 27.1797C7.91322 22.793 7.76389 19.5823 7.72656 15.6437C7.81989 15.289 7.87589 9.07299 8.11856 7.72899Z" fill="#17183B" />
                <path fillRule="evenodd" clipRule="evenodd" d="M41.6029 13.9441C32.6989 13.9441 28.0695 12.9361 9.45885 13.9441C9.34321 13.9586 9.23532 14.01 9.15124 14.0907C9.06716 14.1714 9.01138 14.2771 8.99219 14.3921V14.5974C9.01473 14.7226 9.08214 14.8353 9.1818 14.9143C9.28145 14.9933 9.4065 15.0333 9.53352 15.0268C15.6002 14.9148 17.1309 16.0721 41.6215 15.0268C41.7162 15.0761 41.8221 15.0999 41.9288 15.0959C42.0354 15.092 42.1393 15.0604 42.23 15.0042C42.3208 14.948 42.3955 14.8693 42.4466 14.7756C42.4978 14.6819 42.5237 14.5765 42.5219 14.4697C42.52 14.363 42.4905 14.2586 42.4361 14.1667C42.3818 14.0748 42.3045 13.9987 42.2118 13.9456C42.1191 13.8926 42.0143 13.8646 41.9075 13.8644C41.8008 13.8641 41.6958 13.8916 41.6029 13.9441Z" fill="#17183B" />
                <path fillRule="evenodd" clipRule="evenodd" d="M10.0993 7.35558C15.3633 7.07558 42.0753 7.76625 43.1207 8.64358C43.7927 9.20358 44.1287 14.5609 44.3153 16.1103C44.6513 18.9849 44.9127 21.4676 45.062 24.3796C45.0858 24.5083 45.1539 24.6245 45.2545 24.7082C45.3551 24.7919 45.4818 24.8378 45.6127 24.8378C45.7435 24.8378 45.8703 24.7919 45.9709 24.7082C46.0714 24.6245 46.1395 24.5083 46.1633 24.3796C46.1633 21.7289 45.9953 18.6116 45.8087 15.9983C45.622 13.3849 45.8087 8.53158 44.4087 7.26225C41.7393 4.74225 14.2247 5.73158 10.006 6.10492C9.85861 6.13933 9.72837 6.22528 9.63877 6.34727C9.54917 6.46926 9.50612 6.61926 9.51739 6.7702C9.52865 6.92114 9.59349 7.06308 9.7002 7.17042C9.80691 7.27776 9.94847 7.34343 10.0993 7.35558Z" fill="#17183B" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12.0969 11.5359C12.2291 11.6719 12.3872 11.7801 12.562 11.8539C12.7367 11.9278 12.9245 11.9658 13.1142 11.9658C13.3039 11.9658 13.4917 11.9278 13.6664 11.8539C13.8412 11.7801 13.9993 11.6719 14.1315 11.5359C14.2925 11.2605 14.3472 10.9358 14.2853 10.6229C14.2234 10.31 14.0492 10.0306 13.7955 9.83723C12.5262 9.10923 10.9582 10.3972 12.0969 11.5359Z" fill="#9B2E60" />
                <path fillRule="evenodd" clipRule="evenodd" d="M16.4638 11.0893C16.5963 11.2282 16.7556 11.3388 16.932 11.4143C17.1085 11.4899 17.2985 11.5289 17.4904 11.5289C17.6824 11.5289 17.8724 11.4899 18.0489 11.4143C18.2253 11.3388 18.3846 11.2282 18.5171 11.0893C18.69 10.8076 18.7514 10.4714 18.6892 10.1468C18.627 9.82218 18.4458 9.5325 18.1811 9.33459C16.8931 8.64392 15.3251 9.93192 16.4638 11.0893Z" fill="#9B2E60" />
                <path fillRule="evenodd" clipRule="evenodd" d="M21.245 11.0893C21.3775 11.2282 21.5368 11.3388 21.7133 11.4143C21.8898 11.4899 22.0797 11.5289 22.2717 11.5289C22.4637 11.5289 22.6536 11.4899 22.8301 11.4143C23.0066 11.3388 23.1659 11.2282 23.2984 11.0893C23.4756 10.8088 23.5395 10.4714 23.4771 10.1455C23.4147 9.81967 23.2307 9.52975 22.9624 9.33459C21.6744 8.64392 20.1064 9.93192 21.245 11.0893Z" fill="#9B2E60" />
                <circle cx="35" cy="32" r="10" fill="#FFE0E0" />
                <path fillRule="evenodd" clipRule="evenodd" d="M49.6895 46.4809C48.2621 43.9239 46.6263 41.489 44.7988 39.2009C50.6788 29.8675 38.3401 20.2542 29.0815 27.3662C27.1669 28.7623 25.8304 30.8117 25.3247 33.1267C24.8191 35.4416 25.1794 37.8616 26.3375 39.9289C29.1375 44.4649 34.6255 45.5289 34.5321 43.9795C34.5274 43.9084 34.5086 43.8389 34.477 43.775C34.4453 43.7111 34.4013 43.6541 34.3475 43.6073C34.2937 43.5605 34.2313 43.5247 34.1636 43.5021C34.096 43.4795 34.0246 43.4705 33.9535 43.4755C31.3401 43.6062 28.7455 41.1982 27.6255 39.1822C26.7733 37.447 26.5761 35.4626 27.0699 33.5936C27.5637 31.7247 28.7155 30.0967 30.3135 29.0089C35.6895 25.0515 42.9695 27.4595 44.3508 32.7422C45.5641 37.3529 41.6441 41.8515 37.6495 43.2515C37.4935 43.3035 37.3646 43.4153 37.2911 43.5624C37.2176 43.7094 37.2055 43.8796 37.2575 44.0355C37.3094 44.1915 37.4212 44.3204 37.5683 44.3939C37.7153 44.4674 37.8855 44.4795 38.0415 44.4275C38.837 44.1728 39.6011 43.8284 40.3188 43.4009C41.0095 44.3715 42.7828 46.7982 42.9508 47.1342C46.7961 52.6409 51.0708 50.4009 49.6895 46.4809ZM47.8228 48.3475C46.4415 49.0569 42.4841 44.2409 41.2335 42.8409C42.2395 42.1479 43.1388 41.3115 43.9028 40.3582C44.4815 41.1795 48.7935 47.7875 47.8601 48.2729L47.8228 48.3475Z" fill="#17183B" />
                <path fillRule="evenodd" clipRule="evenodd" d="M33.9308 38.6135C34.0453 38.7263 34.1817 38.8144 34.3315 38.8724C34.4814 38.9304 34.6416 38.9571 34.8021 38.9508C34.9627 38.9445 35.1203 38.9054 35.2652 38.8358C35.41 38.7662 35.5391 38.6677 35.6444 38.5463C35.7608 38.318 35.7953 38.0567 35.7423 37.806C35.6893 37.5553 35.552 37.3304 35.3532 37.1687C34.2892 36.5863 32.9788 37.6615 33.9308 38.6135Z" fill="#17183B" />
                <path fillRule="evenodd" clipRule="evenodd" d="M35.373 33.2814C35.2706 32.6754 35.1284 32.0768 34.9474 31.4894C34.8578 31.3438 34.4882 31.2206 34.3314 31.7022C34.2754 31.859 34.1522 32.5758 34.1186 32.7326C34.0855 33.0004 34.0855 33.2712 34.1186 33.539C34.1971 34.2045 34.3396 34.8609 34.5442 35.499C35.2722 35.8686 35.4738 34.099 35.373 33.2814Z" fill="#17183B" />
              </g>
              <defs>
                <clipPath id="clip0_362_7683">
                  <rect width="44.8" height="44.8" fill="white" transform="translate(5.60156 5.59961)" />
                </clipPath>
              </defs>
            </svg>

            <p className="text-[#0a0a19] text-[14px] leading-[20px] font-medium text-center max-w-[177px]">{`No search results found for "${searchQuery}"`}</p>
          </div>
        )}
      </div>
    </div>
  )
}
