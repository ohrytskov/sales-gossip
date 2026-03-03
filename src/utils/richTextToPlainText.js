import { unescape as unescapeHtml } from 'html-escaper'

export function richTextToPlainText(value) {
  const decoded = unescapeHtml(String(value || ''))

  return decoded
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*p\s*>/gi, '\n\n')
    .replace(/<\/\s*li\s*>/gi, '\n')
    .replace(/<\/\s*(h[1-6]|div|blockquote|pre)\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

