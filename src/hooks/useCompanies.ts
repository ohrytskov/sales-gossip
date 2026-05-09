import slugify from 'slugify'
import useRtdbDataKey from './useRtdbData'

// Simple hook: derive companies from sampleFeed entries (companyName/companyLogo)
export default function useCompanies() {
  // Prefer samplePosts entries (use sourceName/sourceLogo)
  const { data: postsData } = useRtdbDataKey('samplePosts')
  const posts = Array.isArray(postsData) ? postsData : (postsData ? Object.values(postsData) : [])

  const map = new Map()
  for (const item of posts) {
    if (!item) continue
    const name = (item.sourceName || item.companyName || item.source || item.company || '')
    const title = String(name || '').trim()
    if (!title) continue
    const id = slugify(title, { lower: true, strict: true })
    const logo = item.sourceLogo || item.companyLogo || item.logo || null
    if (!map.has(id)) map.set(id, { id, title, logo })
    else {
      const ex = map.get(id)
      if (!ex.logo && logo) ex.logo = logo
    }
  }

  const brands = Array.from(map.values())
  return { data: brands }
}
