import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/home/Logo'
import { useAuth } from '@/hooks/useAuth'
import Search from '@/components/home/Search'

import Menu from '@/components/home/Menu'

import PostCarousel from '@/components/home/PostCarousel'
import Feed from '@/components/home/Feed'
import SuggestedUsers from '@/components/home/SuggestedUsers'

const samplePosts = [
  {
    id: 0,
    bgImage: '/images/4.svg',
    avatar: 'https://placehold.co/40x40',
    username: 'david.sdr',
    likes: '12k likes',
    comments: '128 comments',
    caption: 'Closed my biggest deal after a month.',
    sourceLogo: '/images/logo3.svg',
    sourceName: 'SalesSniper',
  },
  {
    id: 1,
    bgImage: '/images/1.svg',
    avatar: 'https://placehold.co/40x40',
    username: 'jane.sells.alot',
    likes: '5k likes',
    comments: '88 comments',
    caption:
      'Sales is 10% selling, 90% refreshing your inbox and pretending to be unbothered.',
    sourceLogo: '/images/logo1.svg',
    sourceName: 'VentureGrid',
  },
  {
    id: 2,
    bgImage: '/images/2.svg',
    avatar: 'https://placehold.co/40x40',
    username: 'smith.john',
    likes: '3k likes',
    comments: '45 comments',
    caption:
      'I’m emotionally attached to leads that ghosted me 3 weeks ago. I still believe in us.',
    sourceLogo: '/images/logo2.svg',
    sourceName: 'Salesgrowth',
  },
  {
    id: 3,
    bgImage: '/images/3.svg',
    avatar: 'https://placehold.co/40x40',
    username: 'andrea.bdev7',
    likes: '3k likes',
    comments: '45 comments',
    caption:
      'Sales is 10% selling, 90% refreshing your inbox and pretending to be unbothered.',
    sourceLogo: '/images/logo2.svg',
    sourceName: 'Salesgrowth',
  },
  /*{
    id: 4,
    bgImage: '/images/4.svg',
    avatar: 'https://placehold.co/40x40',
    username: 'david.sdr',
    likes: '12k likes',
    comments: '128 comments',
    caption: 'Closed my biggest deal after a month.',
    sourceLogo: '/images/logo3.svg',
    sourceName: 'SalesSniper',
  },*/
]


export default function Home() {
  const [selectedTab, setSelectedTab] = useState('gossips')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  return (
    <div className="relative">
      <header className="mx-auto w-full min-h-[72px] px-[142px] flex items-center justify-between bg-white border-b border-gray-300">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-pink-700 text-xl font-black">SalesGossip</span>
          </div>
          <div className="w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Gossips"
              className="w-full pl-4 pr-10 py-2 bg-zinc-100 rounded-full text-base text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer">
              <Search />
            </div>
          </div>
        </div>

        {/* Middle: Nav Menu */}
        <Menu selectedTab={selectedTab} onSelect={setSelectedTab} />

        {/* Right side: If logged in show actions, else show Login */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="h-6 w-px bg-gray-300" />
            <button
              type="button"
              className="h-10 px-5 py-2 bg-white rounded-full outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9.375 15.833V4.167a.625.625 0 1 1 1.25 0v11.666a.625.625 0 1 1-1.25 0Z" fill="#AA336A"/>
                <path d="M15.833 9.375a.625.625 0 1 1 0 1.25H4.167a.625.625 0 1 1 0-1.25h11.666Z" fill="#AA336A"/>
              </svg>
              <span className="text-pink-700 text-sm font-semibold">Create</span>
            </button>
            <div className="relative w-10 h-10 rounded-full bg-white outline outline-1 outline-gray-300 flex items-center justify-center">
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 3a2 2 0 1 1 4 0c1.148.543 2.127 1.388 2.832 2.445.705 1.057 1.109 2.286 1.168 3.555V12c.075.622.295 1.217.642 1.738.347.521.812.953 1.357 1.262H1c.545-.309 1.01-.741 1.357-1.262.347-.521.567-1.116.643-1.738V9c.06-1.269.464-2.498 1.168-3.555C4.872 4.388 5.851 3.543 7 3Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-700 text-white text-xs leading-4 text-center">1</span>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-sm font-semibold">
                {(user.displayName || user.email || 'U').slice(0,1).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Log in
          </Link>
        )}
      </header>

      <PostCarousel posts={[...samplePosts, ...samplePosts,]} />

      <main className="mx-auto w-full flex justify-between px-[142px] mt-10 ">
        {/* Left column: Feed */}
        <section className="relative ">
          {/* Map over posts or feed data */}
          {/* <FeedPost /> components here */}
          <Feed />
        </section>

        {/* Right column: Suggestions */}
        <aside className="w-96 ">
          {/* You can extract this into a <SuggestedUsers /> component */}
          {/* <h3 className="text-sm font-semibold text-gray-700 mb-4">Suggested for you</h3>*/}
          {/* Suggested user cards */}
          {/* <SuggestedUser /> components here */}
          <SuggestedUsers />
        </aside>
      </main>

    </div>
  );
}
