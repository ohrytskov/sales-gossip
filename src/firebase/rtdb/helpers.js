// Small helpers for RTDB paths and sanitization
export const sanitize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 60)

export const userPath = (uid) => `users/${uid}`
export const usersByUsernamePath = (name) => `usersByUsername/${name}`
export const usersByEmailPath = (local) => `usersByEmail/${local}`
export const notificationsPath = (uid) => `users/${uid}/preferences/notifications`

export const NOTIFICATION_KEYS = ['mentions', 'likes', 'comments', 'replies', 'newFollowers', 'trending']

export const postCompaniesPath = (companyId) => `postCompanies/${companyId}`
