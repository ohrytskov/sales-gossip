export const getDaysAgo = (days) => {
  const dayCount = Number(days) || 0
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  return new Date(Date.now() - dayCount * millisecondsPerDay).toISOString()
}
