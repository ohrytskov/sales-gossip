const fs = require('fs')
const path = require('path')

const baseUrl = 'https://corpgossip.com'
const routes = ['/', '/about', '/companies', '/tags']

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map((route) => {
      const normalized = route === '/' ? '/' : `/${String(route).replace(/^\/+/, '')}`
      return `  <url><loc>${baseUrl}${normalized}</loc></url>`
    })
    .join('\n') +
  `\n</urlset>\n`

const publicDir = path.join(process.cwd(), 'public')
fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml)

console.log(`Generated public/sitemap.xml (${routes.length} routes)`)
