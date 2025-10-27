#!/usr/bin/env node

const BASE_URL = 'https://sales-gossip.firebaseio.com'

async function fetchJson(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Request failed ${res.status}: ${text}`)
  }
  return res.json()
}

async function main() {
  console.log('Fetching all users...')
  const usersData = await fetchJson(`${BASE_URL}/users.json`)

  if (!usersData) {
    console.log('No users found')
    return
  }

  console.log(`Found ${Object.keys(usersData).length} users`)
  console.log('Adding uid to each user...')

  let updated = 0
  for (const [uid, userData] of Object.entries(usersData)) {
    if (!userData) continue

    // Check if uid already exists
    if (userData.uid) {
      console.log(`  ✓ ${uid} - already has uid`)
      continue
    }

    // Add uid to the user record
    const updatedUser = {
      ...userData,
      uid: uid,
    }

    await fetchJson(`${BASE_URL}/users/${uid}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    })

    console.log(`  ✓ ${uid} - uid added`)
    updated++
  }

  console.log(`\nDone! Updated ${updated} users`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
