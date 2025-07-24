import Logo from '@/components/home/Logo'
import Search from '@/components/home/Search'
import Gossips from '@/components/home/Gossips'
import Companies from '@/components/home/Companies'
import Tags from '@/components/home/Tags'
import About from '@/components/home/About'

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
  return (
    <div className="relative">
      <header className="mx-auto w-full min-h-[72px] px-[142px] flex items-center justify-between bg-white border-b border-gray-300">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-pink-700 text-xl font-black">SalesGossip</span>
          </div>
          <div className="w-80 px-4 py-2 bg-zinc-100 rounded-full flex items-center text-gray-400">
            <span className="flex-1 text-base">Search Gossips</span>
            <Search />
          </div>
        </div>

        {/* Middle: Nav Menu */}
        <nav className="flex items-center gap-10 text-sm font-medium">
          <div className="flex flex-col items-center text-pink-900">
            <Gossips />
            <span>Gossips</span>
            {/* Underline selected*/}
            <div className="w-16 h-0 outline outline-2 outline-offset-[-1px] outline-pink-900 mt-[11px] mb-[-11px]" />
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <Companies />
            <span>Companies</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <Tags />
            <span>Tags</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <About />
            <span>About</span>
          </div>
        </nav>

        {/* Right: Login Button */}
        <button className="bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
          Log in
        </button>
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
