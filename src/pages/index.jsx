import Header from '@/components/Header'
import PostCarousel from '@/components/home/PostCarousel'
import Feed from '@/components/home/Feed'
import SuggestedUsers from '@/components/home/SuggestedUsers'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <Header />

      <PostCarousel />

      <main className="mx-auto max-w-[1440px] w-full flex justify-between px-[142px] mt-10 ">
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
