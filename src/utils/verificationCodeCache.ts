export const EMAIL_VERIFICATION_CACHE_KEY = 'cg-email-verification-cache'
export const EMAIL_VERIFICATION_TTL_MS = 15 * 60 * 1000

type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

type CacheEntry = { code: string; expiresAt: number }

const getStorage = (storage?: StorageLike | null): StorageLike | null => {
  if (storage) return storage
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch (_) {
    return null
  }
}

const normalizeEmail = (email: unknown): string => {
  if (typeof email !== 'string') return ''
  return email.trim().toLowerCase()
}

const pruneEntries = (entries: Record<string, any>): Record<string, CacheEntry> => {
  const now = Date.now()

  return Object.fromEntries(
    Object.entries(entries).filter(([, value]: [string, any]) => (
      value &&
      typeof value.code === 'string' &&
      typeof value.expiresAt === 'number' &&
      value.expiresAt > now
    ))
  )
}

const readCache = (storage?: StorageLike | null): Record<string, CacheEntry> => {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return {}

  try {
    const rawValue = resolvedStorage.getItem(EMAIL_VERIFICATION_CACHE_KEY)
    if (!rawValue) return {}

    const parsedValue = JSON.parse(rawValue)
    if (!parsedValue || typeof parsedValue !== 'object') return {}

    return pruneEntries(parsedValue)
  } catch (_) {
    return {}
  }
}

const writeCache = (entries: Record<string, CacheEntry>, storage?: StorageLike | null): void => {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return

  const nextEntries = pruneEntries(entries)

  if (!Object.keys(nextEntries).length) {
    resolvedStorage.removeItem(EMAIL_VERIFICATION_CACHE_KEY)
    return
  }

  resolvedStorage.setItem(EMAIL_VERIFICATION_CACHE_KEY, JSON.stringify(nextEntries))
}

export const storeVerificationCode = (email: string, code: string, storage?: StorageLike | null): string => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || typeof code !== 'string' || !code.trim()) return ''

  const entries = readCache(storage)
  entries[normalizedEmail] = {
    code: code.trim(),
    expiresAt: Date.now() + EMAIL_VERIFICATION_TTL_MS,
  }
  writeCache(entries, storage)

  return entries[normalizedEmail].code
}

export const getStoredVerificationCode = (email: string, storage?: StorageLike | null): string => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return ''

  const entries = readCache(storage)
  writeCache(entries, storage)

  return entries[normalizedEmail]?.code || ''
}

export const clearStoredVerificationCode = (email: string, storage?: StorageLike | null): void => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return

  const entries = readCache(storage)
  delete entries[normalizedEmail]
  writeCache(entries, storage)
}
