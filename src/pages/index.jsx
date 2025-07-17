import Logo from '@/components/home/Logo'
import Search from '@/components/home/Search'
import Gossips from '@/components/home/Gossips'
import Companies from '@/components/home/Companies'
import Tags from '@/components/home/Tags'
import About from '@/components/home/About'

export default function Home() {
  return (
    <header className="mx-auto w-full h-[72px] px-[142px] flex items-center justify-between bg-white border-b border-gray-300">
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
  );
}
