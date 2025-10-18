import { useState } from 'react'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import Search from '@/components/home/Search'
import useRtdbDataKey from '@/hooks/useRtdbData'
export default function Companies() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: postCompanies = {} } = useRtdbDataKey('postCompanies')
  const companiesList = Object.entries(postCompanies ?? {}).map(([id, val]) => ({
    id,
    name: val.meta?.title || '',
    logo: val.meta?.logo || '',
    website: val.meta?.website || '',
    count: val.posts ? Object.keys(val.posts).length : 0
  }))
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
            <path d="M4 21V6C4 5 5 4 6 4H11C12 4 13 5 13 6V21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 8H18C19 8 20 9 20 10V21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21H21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="mx-[142px]">
        {filteredCompanies.length > 0 ? (
          <div className="mt-[48px] flex flex-wrap gap-6 overflow-y-auto">
            {filteredCompanies.map(company => (
              <div key={company.id} data-layer="Frame 48097089" className="Frame48097089 w-64 h-20 relative bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-[#e8e8eb] overflow-hidden">
                <div data-layer="Company name" className="CompanyName left-[80px] top-[21px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-normal">{company.name}</div>
                <img data-layer="Company logo" className="DummyCompanyLogo size-12 left-[16px] top-[20px] absolute rounded-full border border-[#e8e8eb]" src={company.logo} />
                <div data-layer="Posts count" className="CommentsCount left-[80px] top-[49px] absolute justify-start text-[#454662] text-sm font-medium font-['Inter']">{company.count} related posts</div>
              </div>
            ))}
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
