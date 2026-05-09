import {
  EMAIL_VERIFICATION_CACHE_KEY,
  EMAIL_VERIFICATION_TTL_MS,
  clearStoredVerificationCode,
  getStoredVerificationCode,
  storeVerificationCode,
} from '../../src/utils/verificationCodeCache'

type MemoryStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const createStorage = (): MemoryStorage => {
  const values = new Map<string, string>()

  return {
    getItem(key: string) {
      return values.has(key) ? (values.get(key) as string) : null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
    removeItem(key: string) {
      values.delete(key)
    },
  }
}

describe('verificationCodeCache', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-13T12:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('stores and reads verification codes by normalized email', () => {
    const storage = createStorage()

    storeVerificationCode(' User@Example.com ', '123456', storage)

    expect(getStoredVerificationCode('user@example.com', storage)).toBe('123456')
    expect(getStoredVerificationCode('USER@example.com', storage)).toBe('123456')
  })

  test('clears stored verification codes', () => {
    const storage = createStorage()

    storeVerificationCode('user@example.com', '123456', storage)
    clearStoredVerificationCode('user@example.com', storage)

    expect(getStoredVerificationCode('user@example.com', storage)).toBe('')
  })

  test('prunes expired verification codes', () => {
    const storage = createStorage()

    storeVerificationCode('user@example.com', '123456', storage)
    jest.setSystemTime(new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS + 1000))

    expect(getStoredVerificationCode('user@example.com', storage)).toBe('')
    expect(storage.getItem(EMAIL_VERIFICATION_CACHE_KEY)).toBe(null)
  })
})
