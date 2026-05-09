import LikedPostsDetail from '@/components/liked/LikedPostsDetail'
import SeoHead from '@/components/seo/SeoHead'

export default function LikedPostsPage() {
  return (
    <>
      <SeoHead
        title="Liked Posts"
        description="View the posts you liked on CorporateGossip."
        noindex
      />
      <LikedPostsDetail />
    </>
  )
}
