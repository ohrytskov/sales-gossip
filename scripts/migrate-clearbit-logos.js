const CLEARBIT_HOST = 'logo.clearbit.com'

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const blank = args.has('--blank')

const rawBaseUrl =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  process.env.FIREBASE_DATABASE_URL ||
  'https://sales-gossip.firebaseio.com'

const baseUrl = String(rawBaseUrl || '').replace(/\/$/, '')

function isClearbitUrl(url) {
  return typeof url === 'string' && url.includes(CLEARBIT_HOST)
}

function normalizeDomain(domain) {
  if (!domain) return ''
  return String(domain)
    .trim()
    .replace(/:\d+$/, '')
    .replace(/^www\./i, '')
    .toLowerCase()
}

function getDomainFromWebsite(website) {
  if (!website) return ''
  const raw = String(website || '').trim()
  if (!raw) return ''
  try {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const url = new URL(withScheme)
    return normalizeDomain(url.host)
  } catch {
    return normalizeDomain(raw.split('/')[0])
  }
}

function getDomainFromClearbitUrl(logoUrl) {
  if (!isClearbitUrl(logoUrl)) return ''
  try {
    const url = new URL(logoUrl)
    const firstSegment = String(url.pathname || '').replace(/^\/+/, '').split('/')[0]
    return normalizeDomain(firstSegment)
  } catch {
    return ''
  }
}

function makeDuckDuckGoFavicon(domain) {
  const d = normalizeDomain(domain)
  if (!d) return ''
  return `https://icons.duckduckgo.com/ip3/${d}.ico`
}

async function getJson(path) {
  const url = `${baseUrl}${path}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

async function patchJson(path, payload) {
  const url = `${baseUrl}${path}.json`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`)
  return res.json()
}

async function run() {
  console.log('Start: Fetch postCompanies')
  const postCompanies = (await getJson('/postCompanies')) || {}

  const companyDomains = {}
  const companyUpdates = []

  for (const [companyId, companyVal] of Object.entries(postCompanies)) {
    const meta = (companyVal && companyVal.meta) || {}
    const domain =
      getDomainFromWebsite(meta.website) ||
      getDomainFromClearbitUrl(meta.logo) ||
      ''

    if (domain) companyDomains[companyId] = domain

    if (!isClearbitUrl(meta.logo)) continue
    const nextLogo = blank ? '' : makeDuckDuckGoFavicon(domain)
    companyUpdates.push({
      companyId,
      path: `/postCompanies/${companyId}/meta`,
      logo: nextLogo,
    })
  }

  console.log('Start: Fetch posts')
  const posts = (await getJson('/posts')) || {}

  const postUpdates = []

  for (const [postId, postVal] of Object.entries(posts)) {
    const currentLogo = postVal && postVal.companyLogo
    if (!isClearbitUrl(currentLogo)) continue

    const domain =
      getDomainFromWebsite(postVal.companyWebsite) ||
      normalizeDomain(companyDomains[postVal.companyId]) ||
      getDomainFromClearbitUrl(currentLogo) ||
      ''

    const nextLogo = blank ? '' : makeDuckDuckGoFavicon(domain)
    postUpdates.push({
      postId,
      path: `/posts/${postId}`,
      logo: nextLogo,
    })
  }

  console.log('Start: Summary')
  console.log(
    JSON.stringify(
      {
        baseUrl,
        apply,
        blank,
        companyUpdates: companyUpdates.length,
        postUpdates: postUpdates.length,
      },
      null,
      2
    )
  )

  if (!apply) {
    console.log('Start: Dry run (no writes). Re-run with --apply to write.')
    return
  }

  console.log('Start: Apply company updates')
  for (const u of companyUpdates) {
    await patchJson(u.path, { logo: u.logo })
  }

  console.log('Start: Apply post updates')
  for (const u of postUpdates) {
    await patchJson(u.path, { companyLogo: u.logo })
  }

  console.log('Start: Done')
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

