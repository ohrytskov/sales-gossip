import useRtdbDataKey from '@/hooks/useRtdbData'
import { useMemo } from 'react'
import Link from 'next/link'
import { formatTimeAgo } from '@/utils/formatTimeAgo'

export default function SearchDropdown({ isOpen, searchQuery }) {
  // Fetch all data sources
  const { data: postsData } = useRtdbDataKey('posts')
  const { data: usersData } = useRtdbDataKey('users')
  const { data: companiesData } = useRtdbDataKey('postCompanies')

  // Filter and search data
  const dropdownData = useMemo(() => {
    if (!searchQuery.trim()) {
      return { gossips: [], people: [], companies: [] }
    }

    const q = searchQuery.toLowerCase()

    // Filter posts by title or excerpt
    const gossips = postsData
      ? Object.values(postsData)
        .filter((post) => {
          if (!post) return false
          const title = (post.title || '').toLowerCase()
          const excerpt = (post.excerpt || '').toLowerCase()
          return title.includes(q) || excerpt.includes(q)
        })
        .slice(0, 5)
        .map((post) => {
          // Get company data from postCompanies
          let companyName = post.company || post.companyName || 'Unknown'
          let companyLogo = post.companyLogo || ''

          if (companiesData && post.company) {
            const companyData = companiesData[post.company]
            if (companyData?.meta) {
              companyName = companyData.meta.name || companyName
              companyLogo = companyData.meta.logo || companyLogo
            }
          }

          return {
            id: post.id,
            title: post.title,
            author: post.username,
            timestamp: formatTimeAgo(post.timestamp),
            avatar: post.avatar,
            mediaUrl: post.mediaUrl,
            companyName,
            companyLogo
          }
        })
      : []

    // Filter users by username or display name
    const people = usersData
      ? Object.entries(usersData)
        .map(([uid, user]) => ({
          uid,
          ...user
        }))
        .filter((user) => {
          if (!user.public) return false
          const username = (user.public.username || '').toLowerCase()
          const displayName = (user.public.displayName || '').toLowerCase()
          const nickname = (user.public.nickname || '').toLowerCase()
          return username.includes(q) || displayName.includes(q) || nickname.includes(q)
        })
        .slice(0, 5)
        .map((user) => ({
          id: user.uid,
          name: user.public.username || user.public.nickname || 'Unknown',
          posts: user.public.postsCount || 0,
          followers: user.public.followersCount || 0,
          image: user.public.avatarUrl
        }))
      : []

    // Filter companies by name
    let companies = []

    // First try to use postCompanies data
    if (companiesData && Object.keys(companiesData).length > 0) {
      companies = Object.entries(companiesData)
        .map(([companyId, company]) => ({
          companyId,
          ...company
        }))
        .filter((company) => {
          if (!company.meta) return false
          const name = (company.meta.title || company.meta.name || '').toLowerCase()
          return name.includes(q)
        })
        .slice(0, 5)
        .map((company) => ({
          id: company.companyId,
          name: company.meta.title || company.meta.name || 'Unknown',
          relatedPosts: company.posts ? Object.keys(company.posts).length : 0,
          logo: company.meta.logo
        }))
    }

    // Fallback: extract unique companies from posts if postCompanies is empty
    if (companies.length === 0 && postsData) {
      const companyMap = {}
      Object.values(postsData).forEach((post) => {
        if (post.companyName) {
          const companyName = post.companyName.toLowerCase()
          if (companyName.includes(q)) {
            if (!companyMap[post.companyName]) {
              companyMap[post.companyName] = {
                name: post.companyName,
                logo: post.companyLogo,
                count: 0
              }
            }
            companyMap[post.companyName].count += 1
          }
        }
      })
      companies = Object.values(companyMap)
        .slice(0, 5)
        .map((company, idx) => ({
          id: `company-${idx}`,
          name: company.name,
          relatedPosts: company.count,
          logo: company.logo
        }))
    }

    return { gossips, people, companies }
  }, [searchQuery, postsData, usersData, companiesData])

  if (!isOpen) return null

  return (
    <div
      className="absolute top-full left-0 mt-0 w-full min-w-[600px] bg-white rounded-[12px] shadow-[0px_0px_8px_0px_rgba(16,17,42,0.12)] overflow-y-auto max-h-[600px] z-50"
      role="listbox"
    >
      {/* Gossips Section */}
      {dropdownData.gossips.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-4 pt-6 pb-4">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#9495a5] uppercase">
              Gossips ({dropdownData.gossips.length})
            </p>
          </div>
          <div className="px-4 pb-4">
            {dropdownData.gossips.map((gossip) => (
              <Link key={gossip.id} href="/" className="flex gap-3 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-2 block">
                {/* Thumbnail with media - only show if available */}
                {gossip.mediaUrl && (
                  <div className="flex-shrink-0 w-[104px] h-[96px] rounded-[6px] bg-gray-300 overflow-hidden">
                    <img src={gossip.mediaUrl} alt={gossip.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Content */}
                <div className="flex-1">
                  {/* Author info */}
                  <div className="flex items-center gap-2 mb-2">
                    {gossip.avatar ? (
                      <img src={gossip.avatar} alt={gossip.author} className="w-6 h-6 rounded-full border border-gray-200 object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                    )}
                    <span className="font-medium text-[14px] text-[#454662]">{gossip.author}</span>
                    <span className="w-1 h-1 rounded-full bg-[#454662]" />
                    <span className="text-[14px] text-[#454662]">{gossip.timestamp}</span>
                  </div>
                  {/* Title */}
                  <p className="font-medium text-[16px] text-[#10112a] leading-6 mb-2">{gossip.title}</p>
                  {/* Company */}
                  <div className="flex items-center gap-2">
                    {gossip.companyLogo ? (
                      <img src={gossip.companyLogo} alt={gossip.companyName} className="w-6 h-6 rounded-full border border-gray-200 object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                    )}
                    <span className="font-medium text-[14px] text-[#10112a]">{gossip.companyName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* People Section */}
      {dropdownData.people.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-4 pt-6 pb-4">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#9495a5] uppercase">
              People ({dropdownData.people.length})
            </p>
          </div>
          <div className="px-4 pb-4">
            {dropdownData.people.map((person) => (
              <div key={person.id} className="flex items-center gap-3 pb-3 last:pb-0 rounded px-2 py-2">
                {person.image ? (
                  <img src={person.image} alt={person.name} className="w-8 h-8 rounded-full flex-shrink-0 border border-gray-200 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-[14px] text-[#151636]">{person.name}</p>
                  <p className="text-[14px] text-[#64647c]">
                    {person.posts} posts • {person.followers} followers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companies Section */}
      {dropdownData.companies.length > 0 && (
        <div>
          <div className="px-4 pt-6 pb-4">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#9495a5] uppercase">
              Companies ({dropdownData.companies.length})
            </p>
          </div>
          <div className="px-4 pb-4">
            {dropdownData.companies.map((company) => (
              <Link key={company.id} href="/companies" className="flex items-center gap-3 pb-3 last:pb-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-2 block">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-full flex-shrink-0 border border-gray-200 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-[14px] text-[#151636]">{company.name}</p>
                  <p className="text-[14px] text-[#64647c]">Related posts: {company.relatedPosts}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searchQuery && (
        <div className="px-4 py-8 text-center">
          <p className="text-[14px] text-[#9495a5]">Start typing to search gossips, people, and companies</p>
        </div>
      )}
    </div>
  )
}
