const fs = require('fs')
const path = require('path')

const readPublic = (name) => {
  return fs.readFileSync(path.join(__dirname, '..', '..', 'public', name), 'utf8')
}

describe('SEO static files', () => {
  test('public/robots.txt exists and references sitemap', () => {
    const robots = readPublic('robots.txt')
    expect(robots).toContain('User-agent:')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Disallow: /login')
    expect(robots).toContain('Sitemap: https://corpgossip.com/sitemap.xml')
  })

  test('public/sitemap.xml exists and contains core routes', () => {
    const sitemap = readPublic('sitemap.xml')
    expect(sitemap).toContain('<urlset')
    expect(sitemap).toContain('<loc>https://corpgossip.com/</loc>')
    expect(sitemap).toContain('<loc>https://corpgossip.com/about</loc>')
    expect(sitemap).toContain('<loc>https://corpgossip.com/companies</loc>')
    expect(sitemap).toContain('<loc>https://corpgossip.com/tags</loc>')
  })
})

