// Small helpers for RTDB paths and sanitization
export const sanitize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 60)

export const emailKey = (email) => {
  const normalized = (email || '').trim().toLowerCase()
  if (!normalized) return ''

  // Prefer browser-safe btoa when available (emails are ASCII)
  if (typeof btoa === 'function') {
    return btoa(normalized)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  // Node fallback (tests/scripts)
  const Buf = typeof globalThis !== 'undefined' ? globalThis['Buffer'] : undefined
  if (Buf && typeof Buf.from === 'function') {
    return Buf.from(normalized, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  return sanitize(normalized)
}

export const userPath = (uid) => `users/${uid}`
export const usersByUsernamePath = (name) => `usersByUsername/${name}`
export const usersByEmailPath = (email) => {
  const key = emailKey(email)
  return key ? `usersByEmail/${key}` : null
}
export const notificationsPath = (uid) => `users/${uid}/preferences/notifications`

export const NOTIFICATION_KEYS = ['mentions', 'likes', 'comments', 'replies', 'newFollowers', 'trending']

export const postCompaniesPath = (companyId) => `postCompanies/${companyId}`
