import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import ProfileHeader from '@/components/ProfileHeader'
import Feed from '@/components/home/Feed'
import { getUser } from '@/firebase/rtdb/users'


export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const rawUid = router.isReady ? router.query.uid : null
  const uid = typeof rawUid === 'string' ? rawUid.trim() : ''

  useEffect(() => {
    // Wait for router to be ready before fetching data
    if (!router.isReady || !uid) return

    const fetchUserData = async () => {
      try {
        const user = await getUser(uid)
        setUserData(user)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router.isReady, uid])

  const username = userData?.public?.username || userData?.displayName || 'Anonymous User'
  const bio = userData?.public?.bio || userData?.public?.headline || '10 yrs in B2B SaaS'
  const avatar =
    userData?.public?.avatar ||
    userData?.public?.avatarUrl ||
    userData?.photoURL ||
    ''

  const bannerUrl = userData?.public?.bannerUrl || userData?.public?.bannerURL || ''

  const postsCount =
    userData?.public?.postsCount ??
    userData?.stats?.postsCount ??
    userData?.stats?.posts ??
    0

  const followingPeople = userData?.following?.people
  const followingCount = Array.isArray(followingPeople)
    ? followingPeople.length
    : followingPeople && typeof followingPeople === 'object'
      ? Object.values(followingPeople).filter(Boolean).length
      : 0

  const stats = {
    posts: postsCount,
    followers: userData?.public?.followersCount ?? 0,
    following: followingCount
  }

  const joinedLabel = (() => {
    const timestamp = userData?.meta?.createdAt || userData?.public?.createdAt
    if (!timestamp) return 'Joined recently'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Joined recently'
    return `Joined ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`
  })()

  const followExamples =
    Array.isArray(userData?.public?.followersSample) && userData.public.followersSample.length > 0
      ? userData.public.followersSample.slice(0, 3)
      : undefined

  if (loading) {
    return (
      <div className="bg-white">
        <Header />
        <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-[142px] pb-24 pt-[50px]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="bg-white">
        <Header />
        <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-[142px] pb-24 pt-[50px]">
          <div className="rounded-[12px] border border-[#e8e8eb] bg-white px-6 py-10 text-center">
            <h1 className="text-xl font-semibold text-[#10112a] mb-2">User not found</h1>
            <p className="text-base text-[#454662]">The user you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto w-full px-[142px]">
        <ProfileHeader
          name={username}
          bio={bio}
          avatar={avatar}
          bannerUrl={bannerUrl}
          stats={stats}
          joined={joinedLabel}
          followExamples={followExamples}
          profileUid={uid}
        />
      </div>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col px-[142px] pb-24">
        <section className="flex w-full max-w-[741px] flex-col gap-8">
          {/* Posts */}
          <Feed authorUid={uid} showQuickPost={false} showFilterBar={true} />
        </section>
      </main>
    </div>
  )
}
