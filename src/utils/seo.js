export const SEO_BASE_URL = 'https://corpgossip.com'
export const SEO_SITE_NAME = 'CorporateGossip'
export const SEO_DEFAULT_DESCRIPTION =
  'Workplace forum for corporate gossip, stories, and discussions.'
export const SEO_DEFAULT_OG_IMAGE = `${SEO_BASE_URL}/images/banner-example.jpg`

export const stripQueryAndHash = (value = '') => {
  if (!value) return ''
  return value.split('#')[0].split('?')[0]
}

export const normalizePath = (value = '/') => {
  const raw = stripQueryAndHash(value).trim()
  if (!raw) return '/'

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw)
      return url.pathname || '/'
    } catch (_) {
      return '/'
    }
  }

  return raw.startsWith('/') ? raw : `/${raw}`
}

export const buildCanonicalUrl = (pathOrUrl = '/') => {
  const path = normalizePath(pathOrUrl)
  return `${SEO_BASE_URL}${path}`
}

export const buildTitle = (title) => {
  const trimmed = (title || '').trim()
  if (!trimmed) return SEO_SITE_NAME

  if (trimmed.toLowerCase().includes(SEO_SITE_NAME.toLowerCase())) {
    return trimmed
  }

  return `${trimmed} | ${SEO_SITE_NAME}`
}
