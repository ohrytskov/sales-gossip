import Header from '@/components/Header'
import PostCarousel from '@/components/home/PostCarousel'
import Feed from '@/components/home/Feed'
import SuggestedUsers from '@/components/home/SuggestedUsers'
import SeoHead from '@/components/seo/SeoHead'

const RTDB_BASE_URL = 'https://sales-gossip.firebaseio.com'

export default function Home({ initialFeaturedPosts = [], initialPostsData }) {
  return (
    <div className="relative">
      <SeoHead
        title="Workplace forum"
        description="CorporateGossip is a workplace forum for corporate gossip, stories, and discussions."
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'CorporateGossip',
            url: 'https://corpgossip.com',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'CorporateGossip',
            url: 'https://corpgossip.com',
            logo: 'https://corpgossip.com/corporategossip-logo.svg',
          },
        ]}
      />
      <Header />

      <PostCarousel posts={initialFeaturedPosts} />

      <main className="mx-auto max-w-[1440px] w-full flex justify-between px-[142px] mt-10 ">
        {/* Left column: Feed */}
        <section className="relative ">
          <Feed initialPostsData={initialPostsData} />
        </section>

        {/* Right column: Suggestions */}
        <aside className="w-96 ">
          <SuggestedUsers />
        </aside>
      </main>

    </div>
  )
}

export async function getServerSideProps({ res }) {
  try {
    const response = await fetch(
      `${RTDB_BASE_URL}/posts.json?orderBy=%22$key%22&limitToLast=40`
    )
    if (!response.ok) return { props: {} }
    const data = await response.json()

    const posts = data && typeof data === 'object'
      ? Object.entries(data).map(([id, post]) => ({ id, ...(post || {}) }))
      : []

    res?.setHeader?.('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
    return { props: { initialFeaturedPosts: posts, initialPostsData: data ?? null } }
  } catch (_) {
    return { props: {} }
  }
}
