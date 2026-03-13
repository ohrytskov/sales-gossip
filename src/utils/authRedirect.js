const normalizeReturnToInput = (value) => {
  if (Array.isArray(value)) return value[0]
  return value
}

export const getPostAuthRedirectPath = (value) => {
  const rawValue = normalizeReturnToInput(value)
  if (typeof rawValue !== 'string') return '/'

  let decodedValue = rawValue
  try {
    decodedValue = decodeURIComponent(rawValue)
  } catch (_) {}

  const trimmedValue = decodedValue.trim()
  if (!trimmedValue) return '/'
  if (!trimmedValue.startsWith('/')) return '/'
  if (trimmedValue.startsWith('//')) return '/'
  if (
    trimmedValue === '/login' ||
    trimmedValue.startsWith('/login?') ||
    trimmedValue === '/signup' ||
    trimmedValue.startsWith('/signup?') ||
    trimmedValue === '/choose-username' ||
    trimmedValue.startsWith('/choose-username?')
  ) {
    return '/'
  }

  return trimmedValue
}

const buildAuthHref = (pathname, returnTo) => {
  const safeReturnTo = getPostAuthRedirectPath(returnTo)
  if (safeReturnTo === '/') return pathname

  return `${pathname}?returnTo=${encodeURIComponent(safeReturnTo)}`
}

export const buildLoginHref = (returnTo) => buildAuthHref('/login', returnTo)

export const buildSignupHref = (returnTo) => buildAuthHref('/signup', returnTo)

export const buildChooseUsernameTarget = (returnTo) => {
  const safeReturnTo = getPostAuthRedirectPath(returnTo)

  if (safeReturnTo === '/') {
    return { pathname: '/choose-username' }
  }

  return {
    pathname: '/choose-username',
    query: { returnTo: safeReturnTo },
  }
}

export const buildSignupStepTarget = (step, returnTo) => {
  const safeReturnTo = getPostAuthRedirectPath(returnTo)

  if (safeReturnTo === '/') {
    return {
      pathname: '/signup',
      query: { step },
    }
  }

  return {
    pathname: '/signup',
    query: { step, returnTo: safeReturnTo },
  }
}
