const {
  buildChooseUsernameTarget,
  buildLoginHref,
  buildSignupHref,
  buildSignupStepTarget,
  getPostAuthRedirectPath,
} = require('../../src/utils/authRedirect')

describe('authRedirect helpers', () => {
  test('normalizes invalid returnTo values to home', () => {
    expect(getPostAuthRedirectPath()).toBe('/')
    expect(getPostAuthRedirectPath('https://example.com')).toBe('/')
    expect(getPostAuthRedirectPath('//example.com/path')).toBe('/')
    expect(getPostAuthRedirectPath('/login')).toBe('/')
    expect(getPostAuthRedirectPath('/signup?step=2')).toBe('/')
    expect(getPostAuthRedirectPath('/choose-username')).toBe('/')
  })

  test('keeps safe internal paths and decodes encoded paths', () => {
    expect(getPostAuthRedirectPath('/settings')).toBe('/settings')
    expect(getPostAuthRedirectPath('%2Fsettings%3Ftab%3Dprofile')).toBe('/settings?tab=profile')
  })

  test('builds auth links with safe returnTo values', () => {
    expect(buildLoginHref('/settings?tab=profile')).toBe('/login?returnTo=%2Fsettings%3Ftab%3Dprofile')
    expect(buildLoginHref('/login')).toBe('/login')
    expect(buildSignupHref('/settings')).toBe('/signup?returnTo=%2Fsettings')
    expect(buildSignupHref('/signup')).toBe('/signup')
  })

  test('builds onboarding targets with preserved returnTo', () => {
    expect(buildChooseUsernameTarget('/settings')).toEqual({
      pathname: '/choose-username',
      query: { returnTo: '/settings' },
    })

    expect(buildSignupStepTarget(4, '/settings')).toEqual({
      pathname: '/signup',
      query: { step: 4, returnTo: '/settings' },
    })
  })
})
