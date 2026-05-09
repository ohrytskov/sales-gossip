import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import Search from '@/components/home/Search'
import useRtdbDataKey from '@/hooks/useRtdbData'
import TagDetail from '@/components/tag/TagDetail'
import SeoHead from '@/components/seo/SeoHead'
import PageState from '@/components/PageState'
import SectionHeader from '@/components/SectionHeader'
import SegmentedControl from '@/components/SegmentedControl'

const RTDB_BASE_URL = 'https://sales-gossip.firebaseio.com'

const TAGS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Tags',
  url: 'https://corpgossip.com/tags',
}

export default function Tags({ initialTagsData }: any) {
  const router = useRouter()
  const rawTagId = router.isReady ? router.query.id : null
  const detailTag = typeof rawTagId === 'string' ? rawTagId.trim() : ''
  const [searchQuery, setSearchQuery] = useState('')
  const rtdbOptions = initialTagsData !== undefined ? { initialData: initialTagsData } : undefined
  const { data: tagsData, loading, error } = useRtdbDataKey('tags', rtdbOptions)
  const [selectedSegment, setSelectedSegment] = useState('Trending now')
  if (detailTag) {
    return (
      <>
        <SeoHead
          title="Tags"
          description="Browse topics and keywords to find posts on CorporateGossip."
          jsonLd={TAGS_JSON_LD}
        />
        <TagDetail tagName={detailTag} />
      </>
    )
  }
  const segments = ['Trending now', 'Most used', 'New']
  const tagsList = []
  if (tagsData) {
    if (Array.isArray(tagsData)) {
      tagsData.forEach((entry: any, idx: number) => {
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
      Object.entries(tagsData).forEach(([tagKey, entry]: [string, any]) => {
        if (!tagKey || !entry) return
        tagsList.push({
          tag: String(tagKey).trim(),
          count: Number(entry.count) || 0,
          firstMs: Number(entry.firstMs) || 0,
          lastMs: Number(entry.lastMs) || 0,
        })
      })
    }
  }

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

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filtered = sortedTags.filter(item => item.tag.toLowerCase().includes(normalizedSearch))
  const isSearching = normalizedSearch.length > 0

  return (
    <div className="relative">
      <SeoHead
        title="Tags"
        description="Browse topics and keywords to find posts on CorporateGossip."
        jsonLd={TAGS_JSON_LD}
      />
      <Header />
      <div className="flex justify-center bg-[#eff3fe]">
        <div className="w-full max-w-6xl px-8">
          <div className="pt-10">
            <SectionHeader
              className="mb-12"
              icon={(
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_311_6493_dup" {...({ maskType: 'alpha' } as any)} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_311_6493_dup)">
                    <path d="M11.0765 21.5C10.8505 21.5 10.624 21.4548 10.397 21.3645C10.1698 21.274 9.96539 21.1384 9.78373 20.9578L3.02798 14.202C2.84464 14.0193 2.71098 13.8176 2.62698 13.5968C2.54298 13.3761 2.50098 13.1516 2.50098 12.9233C2.50098 12.6949 2.54298 12.4672 2.62698 12.24C2.71098 12.013 2.84464 11.8087 3.02798 11.627L11.5972 3.04225C11.7632 2.87658 11.9594 2.74483 12.1857 2.647C12.4121 2.549 12.646 2.5 12.8875 2.5H19.6682C20.1734 2.5 20.6026 2.67792 20.9557 3.03375C21.3089 3.38975 21.4855 3.81758 21.4855 4.31725V11.098C21.4855 11.342 21.4403 11.5745 21.35 11.7955C21.2596 12.0165 21.1292 12.209 20.9587 12.373L12.3645 20.9578C12.1836 21.1384 11.9802 21.274 11.7542 21.3645C11.5284 21.4548 11.3025 21.5 11.0765 21.5ZM10.853 19.9038C10.917 19.9679 10.9923 20 11.079 20C11.1655 20 11.2407 19.9679 11.3047 19.9038L19.899 11.3038C19.9311 11.2718 19.9536 11.2365 19.9665 11.198C19.9791 11.1597 19.9855 11.1213 19.9855 11.0828V4.31725C19.9855 4.22758 19.9551 4.15392 19.8942 4.09625C19.8334 4.03842 19.7581 4.0095 19.6682 4.0095H12.778L4.09723 12.6962C4.03306 12.7603 4.00098 12.8355 4.00098 12.922C4.00098 13.0087 4.03306 13.084 4.09723 13.148L10.853 19.9038ZM15.4567 7.77875C15.8066 7.77875 16.104 7.65725 16.349 7.41425C16.5938 7.17125 16.7162 6.87608 16.7162 6.52875C16.7162 6.17892 16.5942 5.88158 16.3502 5.63675C16.1061 5.39175 15.8096 5.26925 15.4607 5.26925C15.1119 5.26925 14.8157 5.39133 14.5722 5.6355C14.3286 5.87967 14.2067 6.17617 14.2067 6.525C14.2067 6.87367 14.3282 7.16983 14.5712 7.4135C14.8144 7.657 15.1096 7.77875 15.4567 7.77875Z" fill="#1C1B1F" />
                  </g>
                </svg>
              )}
              title="Tags"
              description="Tags are keywords that help group your gossip or post with similar content."
              actions={(
                <>
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
                  <SegmentedControl
                    options={segments}
                    value={selectedSegment}
                    onChange={setSelectedSegment}
                  />
                </>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-8">
        {loading ? (
          <PageState
            loading
            title="Loading tags"
            description="Fetching the latest tag activity."
          />
        ) : error ? (
          <PageState
            title="Could not load tags"
            description="Please refresh and try again."
            actionLabel="Reload"
            onAction={() => router.reload()}
          />
        ) : filtered.length > 0 ? (
          <div className="mt-[48px] grid grid-cols-4 gap-4">
            {filtered.map((item: any) => {
              const displayTag = item.tag && String(item.tag).startsWith('#') ? item.tag : `#${item.tag}`
              const normalizedTag = String(item.tag || '').replace(/^#/, '')
              return (
                <Link
                  key={item.tag}
                  href={`/tags?id=${encodeURIComponent(normalizedTag)}`}
                  data-layer="Frame 48097089"
                  className="Frame48097089 h-[91px] relative bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e8e8eb] transition duration-150 cursor-pointer hover:shadow-[0px_0px_8px_0px_rgba(16,17,42,0.12)]"
                >
                  <div data-layer="Tag" className="Tag px-3 py-1 left-[16px] top-[16px] absolute bg-[#E5E5EA] rounded-lg inline-flex justify-center items-center gap-2">
                    <div data-layer="Dropdown text" className="DropdownText justify-start text-[#10112A] text-sm font-normal font-inter leading-[22px] break-words">{displayTag}</div>
                  </div>
                  <div data-layer="Comments count" className="CommentsCount left-[16px] top-[58px] absolute justify-start text-[#454662] text-sm font-medium font-inter break-words">{item.count} related posts</div>
                </Link>
              )
            })}
          </div>
        ) : (
          <PageState
            title={isSearching ? 'No tags matched' : 'No tags yet'}
            description={
              isSearching
                ? `Try a different search instead of "${searchQuery.trim()}".`
                : 'Tags will appear here after people add them to posts.'
            }
            actionLabel={isSearching ? 'Clear search' : ''}
            onAction={isSearching ? () => setSearchQuery('') : undefined}
          />
        )}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ res }: any) {
  try {
    const response = await fetch(`${RTDB_BASE_URL}/tags.json`)
    if (!response.ok) return { props: {} }
    const data = await response.json()

    res?.setHeader?.('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
    return { props: { initialTagsData: data ?? null } }
  } catch (_) {
    return { props: {} }
  }
}
