const { formatTimeAgo } = require('../../src/utils/formatTimeAgo')

describe('formatTimeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-02-25T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('returns empty string for empty input', () => {
    expect(formatTimeAgo('')).toBe('')
    expect(formatTimeAgo(null)).toBe('')
    expect(formatTimeAgo(undefined)).toBe('')
  })

  test('returns empty string for invalid date', () => {
    expect(formatTimeAgo('not-a-date')).toBe('')
  })

  test('formats seconds/minutes/hours/days/weeks/months/years', () => {
    const now = new Date('2026-02-25T00:00:00.000Z').getTime()
    const iso = (ms) => new Date(ms).toISOString()

    expect(formatTimeAgo(iso(now - 10 * 1000))).toBe('just now')
    expect(formatTimeAgo(iso(now - 5 * 60 * 1000))).toBe('5 min')
    expect(formatTimeAgo(iso(now - 2 * 60 * 60 * 1000))).toBe('2h')
    expect(formatTimeAgo(iso(now - 24 * 60 * 60 * 1000))).toBe('1 day')
    expect(formatTimeAgo(iso(now - 3 * 24 * 60 * 60 * 1000))).toBe('3 days')
    expect(formatTimeAgo(iso(now - 14 * 24 * 60 * 60 * 1000))).toBe('2 weeks')
    expect(formatTimeAgo(iso(now - 60 * 24 * 60 * 60 * 1000))).toBe('2 months')
    expect(formatTimeAgo(iso(now - 400 * 24 * 60 * 60 * 1000))).toBe('1 year')
  })
})

