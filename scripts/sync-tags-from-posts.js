#!/usr/bin/env node

const BASE_URL = 'https://sales-gossip.firebaseio.com'

const relativeUnits = [
  { test: unit => unit.startsWith('sec') || unit === 's', ms: 1000 },
  { test: unit => unit.startsWith('min') || unit === 'm', ms: 60 * 1000 },
  { test: unit => unit.startsWith('hour') || unit.startsWith('hr') || unit === 'h', ms: 60 * 60 * 1000 },
  { test: unit => unit.startsWith('day') || unit === 'd', ms: 24 * 60 * 60 * 1000 },
  { test: unit => unit.startsWith('week') || unit.startsWith('wk') || unit === 'w', ms: 7 * 24 * 60 * 60 * 1000 },
]

function parseTimestamp(raw, nowMs) {
  if (raw instanceof Date) return raw.getTime()
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw === null || raw === undefined) return 0

  const str = String(raw).trim()
  if (!str) return 0

  const parsed = Date.parse(str)
  if (!Number.isNaN(parsed)) return parsed

  const lower = str.toLowerCase()
  const value = parseFloat(lower)
  if (Number.isNaN(value)) return 0

  let unit = lower.replace(/^[\d.\s]+/, '').trim()
  if (unit.endsWith('ago')) unit = unit.slice(0, -3).trim()
  if (!unit) return 0

  for (const entry of relativeUnits) {
    if (entry.test(unit)) return nowMs - value * entry.ms
  }

  return 0
}

function getPostsArray(data) {
  if (!data) return []
  if (Array.isArray(data)) return data.filter(Boolean)
  return Object.values(data).filter(Boolean)
}

function buildTagStats(posts) {
  const nowMs = Date.now()
  const stats = new Map()
  for (const post of posts) {
    const rawCreated = post.createdAt ?? post.timestamp ?? ''
    const rawUpdated = post.updatedAt ?? rawCreated
    const createdMs = parseTimestamp(rawCreated, nowMs)
    const updatedMs = parseTimestamp(rawUpdated, nowMs)
    const recencyMs = updatedMs > 0 ? updatedMs : createdMs
    const firstCandidate = createdMs > 0 ? createdMs : recencyMs
    const tags = Array.isArray(post.tags) ? post.tags : []
    for (const tag of tags) {
      const key = String(tag || '').trim()
      if (!key) continue
      if (!stats.has(key)) stats.set(key, { count: 0, firstMs: Infinity, lastMs: 0 })
      const entry = stats.get(key)
      entry.count = (entry.count || 0) + 1
      if (firstCandidate > 0) entry.firstMs = Math.min(entry.firstMs || Infinity, firstCandidate)
      if (recencyMs > 0) entry.lastMs = Math.max(entry.lastMs || 0, recencyMs)
    }
  }
  return stats
}

function serialiseStats(stats) {
  const result = {}
  for (const [tag, { count, firstMs, lastMs }] of stats.entries()) {
    const safeFirst = Number.isFinite(firstMs) && firstMs > 0 ? firstMs : 0
    const safeLast = lastMs > 0 ? lastMs : 0
    result[tag] = {
      count: count || 0,
      firstMs: safeFirst,
      firstIso: safeFirst ? new Date(safeFirst).toISOString() : null,
      lastMs: safeLast,
      lastIso: safeLast ? new Date(safeLast).toISOString() : null,
    }
  }
  return result
}

async function fetchJson(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Request failed ${res.status}: ${text}`)
  }
  return res.json()
}

async function main() {
  console.log('Fetching posts...')
  const postsData = await fetchJson(`${BASE_URL}/posts.json`)
  const posts = getPostsArray(postsData)
  console.log(`Found ${posts.length} posts`)
  const stats = buildTagStats(posts)
  const payload = serialiseStats(stats)
  console.log(`Computed ${Object.keys(payload).length} tag entries`)
  console.log('Writing tags...')
  await fetchJson(`${BASE_URL}/tags.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  console.log('Done')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
