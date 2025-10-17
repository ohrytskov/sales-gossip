import { useState } from 'react'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import Search from '@/components/home/Search'
import samplePosts from '@/data/samplePosts'
export default function Companies() {
  const [searchQuery, setSearchQuery] = useState('')
  const companiesList = Array.from(
    new Map(samplePosts.map(p => [p.sourceName, p.sourceLogo])).entries()
  ).map(([name, logo]) => ({ name, logo }))
  const filteredCompanies = companiesList.filter(company =>
    company.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )

  return (
    <div className="relative">
      <Header />
      <div data-layer="Frame 48097006" className="Frame48097006 w-[1440px] h-36 relative bg-[#f2f2f4] overflow-hidden">
        <div data-layer="Companies" className="Companies left-[178px] top-[40px] absolute justify-start text-black text-xl font-medium font-['Inter'] leading-7">Companies</div>
        <div data-layer="Post text" className="PostText w-96 left-[142px] top-[82px] absolute justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal">Comapnies linked to the gossip posts.</div>
        <FloatingInput
          id="companies-search"
          value={searchQuery}
          onChange={setSearchQuery}
          label="Search companies"
          data-layer="Search"
          className="bg-white rounded-full inline-flex justify-start items-center gap-2 overflow-hidden px-4 left-[970px] top-[66px] absolute"
          rounded="full"
          style={{ width: '320px', height: '40px', outline: 'none', boxShadow: 'none' }}
          inputProps={{
            className: 'text-[#9495a5] text-base font-normal leading-none',
            'aria-label': 'Search companies'
          }}
          rightElement={<Search />}
        />
        <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[42px] absolute">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 21V6C4 5 5 4 6 4H11C12 4 13 5 13 6V21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 8H18C19 8 20 9 20 10V21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 21H21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="mt-[40px] mx-[142px] flex flex-wrap gap-6 overflow-y-auto">
        {filteredCompanies.map(company => {
          const count = samplePosts.filter(p => p.sourceName === company.name).length
          return (
            <div key={company.name} data-layer="Frame 48097089" className="Frame48097089 w-64 h-20 relative bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e8e8eb] overflow-hidden">
              <div data-layer="Company name" className="CompanyName left-[80px] top-[21px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-normal">{company.name}</div>
              <img data-layer="Dummy company logo" className="DummyCompanyLogo size-12 left-[16px] top-[20px] absolute rounded-full border border-[#e8e8eb]" src={company.logo} />
              <div data-layer="Comments count" className="CommentsCount left-[80px] top-[49px] absolute justify-start text-[#454662] text-sm font-medium font-['Inter']">{count} related posts</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
