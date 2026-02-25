const { getUserNicknameFromEmail } = require('../../src/utils/getUserNicknameFromEmail')

describe('getUserNicknameFromEmail', () => {
  test('returns empty string for missing email', () => {
    expect(getUserNicknameFromEmail('')).toBe('')
    expect(getUserNicknameFromEmail(null)).toBe('')
    expect(getUserNicknameFromEmail(undefined)).toBe('')
  })

  test('returns local part of email', () => {
    expect(getUserNicknameFromEmail('alice@example.com')).toBe('alice')
    expect(getUserNicknameFromEmail('john.doe+tag@corp.com')).toBe('john.doe+tag')
  })
})

