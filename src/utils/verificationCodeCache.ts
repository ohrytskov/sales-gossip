export const EMAIL_VERIFICATION_CACHE_KEY = 'cg-email-verification-cache'
export const EMAIL_VERIFICATION_TTL_MS = 15 * 60 * 1000

const getStorage = (storage) => {
  if (storage) return storage
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch (_) {
    return null
  }
}

const normalizeEmail = (email) => {
  if (typeof email !== 'string') return ''
  return email.trim().toLowerCase()
}

const pruneEntries = (entries) => {
  const now = Date.now()

  return Object.fromEntries(
    Object.entries(entries).filter(([, value]) => (
      value &&
      typeof value.code === 'string' &&
      typeof value.expiresAt === 'number' &&
      value.expiresAt > now
    ))
  )
}

const readCache = (storage) => {
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

const writeCache = (entries, storage) => {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return

  const nextEntries = pruneEntries(entries)

  if (!Object.keys(nextEntries).length) {
    resolvedStorage.removeItem(EMAIL_VERIFICATION_CACHE_KEY)
    return
  }

  resolvedStorage.setItem(EMAIL_VERIFICATION_CACHE_KEY, JSON.stringify(nextEntries))
}

export const storeVerificationCode = (email, code, storage) => {
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

export const getStoredVerificationCode = (email, storage) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return ''

  const entries = readCache(storage)
  writeCache(entries, storage)

  return entries[normalizedEmail]?.code || ''
}

export const clearStoredVerificationCode = (email, storage) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return

  const entries = readCache(storage)
  delete entries[normalizedEmail]
  writeCache(entries, storage)
}
