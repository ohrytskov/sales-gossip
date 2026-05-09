export const normalizeTag = (tag) => {
  if (!tag) return ''
  const trimmed = String(tag).trim()
  if (!trimmed) return ''
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

