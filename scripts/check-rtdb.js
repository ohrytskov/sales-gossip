#!/usr/bin/env node

/**
 * Audit and patch RTDB data so feed follow logic works without local fallbacks.
 * - Ensures every user document has uid, followersCount, normalized following.people array
 * - Ensures usersByUsername mirrors user -> username mappings
 * - Ensures each post has authorUid resolved from username
 *
 * Run with:
 *   node scripts/fix-rtdb.js          # dry-run
 *   node scripts/fix-rtdb.js --apply  # apply fixes
 */

const BASE_URL = (process.env.RTDB_URL || 'https://sales-gossip.firebaseio.com').replace(/\/$/, '')
const APPLY = process.argv.includes('--apply')

function encodeKey(key) {
  return encodeURIComponent(key).replace(/%2F/g, '/')
}

async function fetchJson(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${options.method || 'GET'} ${url} failed: ${res.status} ${text}`)
  }
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : null
}

function normalizePeopleList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') {
    const entries = Object.entries(value)
    const numeric = entries.every(([key]) => /^\d+$/.test(key))
    if (numeric) {
      return entries
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, uid]) => uid)
        .filter(Boolean)
    }
    return entries
      .filter(([, flag]) => Boolean(flag))
      .map(([uid]) => uid)
  }
  return []
}

async function patch(path, payload) {
  if (!APPLY) return
  await fetchJson(path, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

async function put(path, payload) {
  if (!APPLY) return
  await fetchJson(path, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

function ensureFollowersCount(publicData = {}) {
  if (typeof publicData.followersCount === 'number' && Number.isFinite(publicData.followersCount)) {
    return publicData
  }
  return {
    ...publicData,
    followersCount: 0,
  }
}

function resolveAuthorUid(post, users, usernameMap) {
  if (post.authorUid) return post.authorUid
  const username = post.username || post.author?.username
  if (!username) return null
  if (usernameMap && usernameMap[username]) return usernameMap[username]
  for (const [uid, user] of Object.entries(users || {})) {
    if (user?.public?.username === username) return uid
  }
  return null
}

async function auditUsers(users, usernameMap) {
  const userUpdates = []
  const usernameUpdates = []

  for (const [uid, user] of Object.entries(users || {})) {
    const patchPayload = {}
    if (!user.uid) patchPayload.uid = uid

    const currentPublic = user.public || {}
    const desiredPublic = ensureFollowersCount(currentPublic)
    if (JSON.stringify(desiredPublic) !== JSON.stringify(currentPublic)) {
      patchPayload.public = desiredPublic
    }

    const following = user.following || {}
    const peopleNormalized = normalizePeopleList(following.people)
    if (
      JSON.stringify(peopleNormalized) !== JSON.stringify(following.people || []) ||
      !Array.isArray(following.people)
    ) {
      patchPayload.following = {
        ...following,
        companies: Array.isArray(following.companies) ? following.companies : [],
        topics: Array.isArray(following.topics) ? following.topics : [],
        updatedAt: typeof following.updatedAt === 'number' ? following.updatedAt : Date.now(),
        people: peopleNormalized,
      }
    }

    if (Object.keys(patchPayload).length) {
      userUpdates.push({ uid, patch: patchPayload })
    }

    const username = user?.public?.username
    if (username) {
      const mappedUid = usernameMap?.[username]
      if (!mappedUid) {
        usernameUpdates.push({ username, uid, method: 'create' })
      } else if (mappedUid !== uid) {
        usernameUpdates.push({ username, uid, method: 'fix' })
      }
    }
  }

  for (const update of userUpdates) {
    console.log(`[user] ${update.uid} -> patch ${JSON.stringify(update.patch)}`)
    await patch(`/users/${encodeKey(update.uid)}.json`, update.patch)
  }

  for (const entry of usernameUpdates) {
    console.log(`[username] ${entry.username} -> ${entry.uid}`)
    await put(`/usersByUsername/${encodeKey(entry.username)}.json`, entry.uid)
  }

  return { userUpdates, usernameUpdates }
}

async function auditPosts(posts, users, usernameMap) {
  const postUpdates = []
  for (const [postId, post] of Object.entries(posts || {})) {
    const resolved = resolveAuthorUid(post, users, usernameMap)
    if (!resolved) {
      console.warn(`[post] ${postId} -> missing authorUid (username: ${post.username || 'n/a'})`)
      continue
    }
    if (post.authorUid === resolved) continue
    postUpdates.push({ postId, authorUid: resolved })
  }

  for (const update of postUpdates) {
    console.log(`[post] ${update.postId} -> authorUid ${update.authorUid}`)
    await patch(`/posts/${encodeKey(update.postId)}.json`, { authorUid: update.authorUid })
  }

  return { postUpdates }
}

async function main() {
  console.log(`RTDB base: ${BASE_URL}`)
  console.log(`Mode: ${APPLY ? 'apply' : 'dry-run'}`)

  console.log('Fetching users...')
  const users = await fetchJson('/users.json')
  console.log(`Fetched ${users ? Object.keys(users).length : 0} users`)

  console.log('Fetching usersByUsername...')
  const usernameMap = await fetchJson('/usersByUsername.json')
  console.log(`Fetched ${usernameMap ? Object.keys(usernameMap).length : 0} username mappings`)

  console.log('Fetching posts...')
  const posts = await fetchJson('/posts.json')
  console.log(`Fetched ${posts ? Object.keys(posts).length : 0} posts`)

  const userResult = await auditUsers(users, usernameMap)
  const postUsernameMap = { ...usernameMap }
  for (const entry of userResult.usernameUpdates) {
    postUsernameMap[entry.username] = entry.uid
  }
  const postResult = await auditPosts(posts, users, postUsernameMap)

  console.log('\nSummary:')
  console.log(`  user patches: ${userResult.userUpdates.length}`)
  console.log(`  username entries: ${userResult.usernameUpdates.length}`)
  console.log(`  post patches: ${postResult.postUpdates.length}`)

  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to persist changes.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
