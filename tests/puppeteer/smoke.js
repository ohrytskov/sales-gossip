const fs = require('fs')
const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer-core')

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000'
const headless = !['0', 'false', 'no'].includes(String(process.env.E2E_HEADLESS || '1').toLowerCase())
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS || 180_000)

const pickChromePath = () => {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  return null
}

const waitForPageLoadComplete = async (page) => {
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: timeoutMs })
}

const gotoPath = async (page, urlPath) => {
  const url = urlPath.startsWith('http') ? urlPath : `${baseUrl}${urlPath}`
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
  await waitForPageLoadComplete(page)
  if (!res || !res.ok()) {
    const status = res ? res.status() : 'no-response'
    throw new Error(`Navigation failed (${status}): ${url}`)
  }
}

const getSeoSnapshot = async (page) => {
  return page.evaluate(() => {
    const getMeta = (selector) => document.querySelector(selector)?.getAttribute('content') || ''
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || ''
    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((el) => el.textContent || '')
      .filter(Boolean)

    return {
      title: document.title || '',
      canonical,
      description: getMeta('meta[name="description"]'),
      robots: getMeta('meta[name="robots"]'),
      og: {
        title: getMeta('meta[property="og:title"]'),
        description: getMeta('meta[property="og:description"]'),
        url: getMeta('meta[property="og:url"]'),
        type: getMeta('meta[property="og:type"]'),
        image: getMeta('meta[property="og:image"]'),
      },
      twitter: {
        card: getMeta('meta[name="twitter:card"]'),
        title: getMeta('meta[name="twitter:title"]'),
        description: getMeta('meta[name="twitter:description"]'),
        image: getMeta('meta[name="twitter:image"]'),
      },
      jsonLd,
    }
  })
}

const assertSeoBasics = async (page, { path, expectJsonLdTypes = [] }) => {
  const seo = await getSeoSnapshot(page)

  const missing = []
  if (!seo.title) missing.push('title')
  if (!seo.description) missing.push('description')
  if (!seo.canonical) missing.push('canonical')
  if (!seo.og.title) missing.push('og:title')
  if (!seo.og.description) missing.push('og:description')
  if (!seo.og.url) missing.push('og:url')
  if (!seo.og.type) missing.push('og:type')
  if (!seo.twitter.card) missing.push('twitter:card')
  if (!seo.twitter.title) missing.push('twitter:title')
  if (!seo.twitter.description) missing.push('twitter:description')

  if (missing.length) {
    throw new Error(`[seo] ${path} missing: ${missing.join(', ')}`)
  }

  if (expectJsonLdTypes.length) {
    const parsed = seo.jsonLd.map((raw) => {
      try {
        return JSON.parse(raw)
      } catch (err) {
        throw new Error(`[seo] ${path} invalid jsonLd: ${String(err && err.message ? err.message : err)}`)
      }
    })

    for (const expectedType of expectJsonLdTypes) {
      const found = parsed.some((item) => item && item['@type'] === expectedType)
      if (!found) {
        throw new Error(`[seo] ${path} missing jsonLd type: ${expectedType}`)
      }
    }
  }
}

const run = async () => {
  console.log('Start...')

  const chromePath = pickChromePath()
  if (!chromePath) {
    throw new Error('Chrome not found. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH.')
  }

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-smoke-'))

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-notifications',
      '--window-size=1280,800',
      `--user-data-dir=${profileDir}`,
    ],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(timeoutMs)

  const pageErrors = []
  page.on('pageerror', (err) => {
    pageErrors.push(String(err && err.message ? err.message : err))
  })

  try {
    await gotoPath(page, '/')
    await page.waitForSelector('body', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/', expectJsonLdTypes: ['WebSite', 'Organization'] })

    await gotoPath(page, '/login')
    await page.waitForSelector('#email', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/login' })

    await gotoPath(page, '/signup')
    await page.waitForSelector('#email', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/signup' })

    await gotoPath(page, '/about')
    await page.waitForSelector('h1', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/about', expectJsonLdTypes: ['FAQPage', 'Organization'] })

    await gotoPath(page, '/companies')
    await page.waitForSelector('#companies-search', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/companies', expectJsonLdTypes: ['CollectionPage'] })

    await gotoPath(page, '/tags')
    await page.waitForSelector('#tags-search', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/tags', expectJsonLdTypes: ['CollectionPage'] })

    const robotsRes = await page.goto(`${baseUrl}/robots.txt`, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
    const robotsText = robotsRes ? await robotsRes.text() : ''
    if (!robotsRes || !robotsRes.ok()) {
      throw new Error(`[seo] /robots.txt request failed (${robotsRes ? robotsRes.status() : 'no-response'})`)
    }
    if (!robotsText.includes('User-agent:')) {
      throw new Error('[seo] /robots.txt missing User-agent')
    }
    if (!robotsText.includes('Sitemap:')) {
      throw new Error('[seo] /robots.txt missing Sitemap')
    }

    const sitemapRes = await page.goto(`${baseUrl}/sitemap.xml`, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
    const sitemapText = sitemapRes ? await sitemapRes.text() : ''
    if (!sitemapRes || !sitemapRes.ok()) {
      throw new Error(`[seo] /sitemap.xml request failed (${sitemapRes ? sitemapRes.status() : 'no-response'})`)
    }
    if (!sitemapText.includes('<urlset')) {
      throw new Error('[seo] /sitemap.xml missing <urlset>')
    }

    if (pageErrors.length) {
      throw new Error(`Page errors detected: ${JSON.stringify(pageErrors)}`)
    }

    console.log('Done')
  } finally {
    await browser.close()
    fs.rmSync(profileDir, { recursive: true, force: true })
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
