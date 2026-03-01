export const validatePassword = (value) => {
  if (!value) return ''
  if (value.length < 8) return `Please use at least 8 characters (you are currently using ${value.length} characters).`
  return ''
}

