export const getInitials = (value) => {
  if (!value) return 'SG'

  const parts = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'SG'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

