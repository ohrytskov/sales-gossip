import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import Search from '@/components/home/Search'
import useRtdbDataKey from '@/hooks/useRtdbData'
import CompanyDetail from '@/components/company/CompanyDetail'
import SeoHead from '@/components/seo/SeoHead'
import PageState from '@/components/PageState'
import SectionHeader from '@/components/SectionHeader'

const RTDB_BASE_URL = 'https://sales-gossip.firebaseio.com'

const COMPANIES_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Companies',
  url: 'https://corpgossip.com/companies',
}

export default function Companies({ initialPostCompanies }: any) {
  const router = useRouter()
  const rawCompanyId = router.isReady ? router.query.id : null
  const detailCompany = typeof rawCompanyId === 'string' ? rawCompanyId.trim() : ''
  const [searchQuery, setSearchQuery] = useState('')
  const rtdbOptions =
    initialPostCompanies !== undefined ? { initialData: initialPostCompanies } : undefined
  const { data: postCompanies = {}, loading, error } = useRtdbDataKey('postCompanies', rtdbOptions)
  if (detailCompany) {
    return (
      <>
        <SeoHead
          title="Companies"
          description="Browse companies linked to gossip posts on CorporateGossip."
          jsonLd={COMPANIES_JSON_LD}
        />
        <CompanyDetail companyName={detailCompany} />
      </>
    )
  }
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const companiesList = Object.entries(postCompanies ?? {}).map(([id, val]: [string, any]) => ({
    id,
    name: val.meta?.title || '',
    logo: val.meta?.logo || '',
    website: val.meta?.website || '',
    count: val.posts ? Object.keys(val.posts).length : 0
  }))
  const filteredCompanies = companiesList.filter(company =>
    company.name.toLowerCase().includes(normalizedSearch)
  )
  const isSearching = normalizedSearch.length > 0

  return (
    <div className="relative">
      <SeoHead
        title="Companies"
        description="Browse companies linked to gossip posts on CorporateGossip."
        jsonLd={COMPANIES_JSON_LD}
      />
      <Header />
      <div className="w-full h-36 bg-[#f2f2f4] flex items-center justify-center">
        <div className="max-w-6xl w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SectionHeader
            className="w-full"
            icon={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 21V6C4 5 5 4 6 4H11C12 4 13 5 13 6V21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 8H18C19 8 20 9 20 10V21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21H21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            title="Companies"
            description="Companies linked to the gossip posts."
            actions={(
              <FloatingInput
                id="companies-search"
                value={searchQuery}
                onChange={setSearchQuery}
                label="Search companies"
                className="bg-white rounded-full inline-flex justify-start items-center gap-2 overflow-hidden px-4 w-full sm:w-auto"
                rounded="full"
                style={{ height: '40px', outline: 'none', boxShadow: 'none' }}
                inputProps={{
                  className: 'text-[#9495a5] text-base font-normal leading-none',
                  'aria-label': 'Search companies'
                }}
                rightElement={<Search />}
              />
            )}
          />
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="max-w-6xl w-full px-4">
          {loading ? (
            <PageState
              loading
              title="Loading companies"
              description="Fetching the latest companies."
            />
          ) : error ? (
            <PageState
              title="Could not load companies"
              description="Please refresh and try again."
              actionLabel="Reload"
              onAction={() => router.reload()}
            />
          ) : filteredCompanies.length > 0 ? (
            <div className="mt-[48px] flex flex-wrap justify-center gap-6 overflow-y-auto">
              {filteredCompanies.map(company => (
                <Link key={company.id} href={`/companies?id=${encodeURIComponent(company.name)}`}>
                  <div className="w-64 h-20 relative bg-white rounded-lg border border-[#e8e8eb] overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="absolute left-[80px] top-[21px] text-[#10112a] text-base font-medium font-inter leading-normal">{company.name}</div>
                    <img className="absolute size-12 left-[16px] top-[20px] rounded-full border border-[#e8e8eb]" src={company.logo} alt={`${company.name} logo`} />
                    <div className="absolute left-[80px] top-[49px] text-[#454662] text-sm font-medium font-inter">{company.count} related posts</div>
                  </div>
                </Link>
              ))}
            </div>
        ) : (
          <PageState
            title={isSearching ? 'No companies matched' : 'No companies yet'}
            description={
              isSearching
                ? `Try a different search instead of "${searchQuery.trim()}".`
                : 'Companies connected to gossip posts will appear here.'
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
    const response = await fetch(`${RTDB_BASE_URL}/postCompanies.json`)
    if (!response.ok) return { props: {} }
    const data = await response.json()

    res?.setHeader?.('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
    return { props: { initialPostCompanies: data ?? {} } }
  } catch (_) {
    return { props: {} }
  }
}
