import Header from '@/components/Header'
import PostCarousel from '@/components/home/PostCarousel'
import Feed from '@/components/home/Feed'
import useRtdbDataKey from '@/hooks/useRtdbData'
import SuggestedUsers from '@/components/home/SuggestedUsers'

export default function Home() {
  const { data: samplePosts } = useRtdbDataKey('samplePosts')

  return (
    <div className="relative">
      <Header />

      <PostCarousel posts={[...(samplePosts || []), ...(samplePosts || [])]} />

      <main className="mx-auto w-full flex justify-between px-[142px] mt-10 ">
        {/* Left column: Feed */}
        <section className="relative ">
          <Feed />
        </section>

        {/* Right column: Suggestions */}
        <aside className="w-96 ">
          <SuggestedUsers />
        </aside>
      </main>

    </div>
  )
}

