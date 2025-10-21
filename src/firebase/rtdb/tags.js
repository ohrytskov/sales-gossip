import { rtdb } from '@/firebase/config'
import { ref, runTransaction } from 'firebase/database'

const INVALID_KEY_PATTERN = /[.#$/[\]]/

function toMillis(value) {
  if (!value) return 0
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function toIso(ms) {
  return ms > 0 ? new Date(ms).toISOString() : null
}

export async function saveTagsAggregate(tagList, createdAt, updatedAt) {
  if (!Array.isArray(tagList) || !tagList.length) return
  const unique = Array.from(
    new Set(
      tagList
        .map(tag => String(tag || '').trim())
        .filter(tag => tag && !INVALID_KEY_PATTERN.test(tag))
    )
  )
  if (!unique.length) return

  const createdMs = toMillis(createdAt)
  const updatedMs = toMillis(updatedAt)
  const recencyMs = updatedMs || createdMs || Date.now()
  const firstCandidate = createdMs || recencyMs

  await Promise.all(
    unique.map(tag => {
      const tagRef = ref(rtdb, `tags/${tag}`)
      return runTransaction(tagRef, current => {
        const currentCount = current && typeof current.count === 'number' ? current.count : 0
        const currentFirst = current && typeof current.firstMs === 'number' ? current.firstMs : 0
        const currentLast = current && typeof current.lastMs === 'number' ? current.lastMs : 0

        const nextFirst = firstCandidate > 0
          ? (currentFirst > 0 ? Math.min(currentFirst, firstCandidate) : firstCandidate)
          : currentFirst
        const nextLast = recencyMs > 0 ? Math.max(currentLast, recencyMs) : currentLast

        return {
          count: currentCount + 1,
          firstMs: nextFirst,
          firstIso: toIso(nextFirst),
          lastMs: nextLast,
          lastIso: toIso(nextLast),
        }
      })
    })
  )
}
