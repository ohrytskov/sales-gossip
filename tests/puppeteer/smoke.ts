import fs from 'fs'
import os from 'os'
import path from 'path'
import puppeteer from 'puppeteer-core'

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const gotoPath = async (page, urlPath) => {
  const url = urlPath.startsWith('http') ? urlPath : `${baseUrl}${urlPath}`
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
  await waitForPageLoadComplete(page)
  const status = res ? res.status() : 'no-response'
  if (!res || status >= 400) {
    throw new Error(`Navigation failed (${status}): ${url}`)
  }
}

const expectRedirectToLogin = async (page, returnTo) => {
  await page.waitForFunction((expectedReturnTo) => {
    const params = new URLSearchParams(window.location.search)
    return window.location.pathname === '/login' && params.get('returnTo') === expectedReturnTo
  }, { timeout: timeoutMs }, returnTo)
}

const getNextPageProps = async (page) => {
  return page.evaluate(() => window.__NEXT_DATA__?.props?.pageProps || {})
}

const typeInto = async (page, selector, value) => {
  await page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
  await page.click(selector, { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type(selector, value, { delay: 25 })
}

const clickHeaderButtonByExactText = async (page, text) => {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const clicked = await page.evaluate((targetText) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim()
      const isVisible = (el) => {
        const style = window.getComputedStyle(el)
        if (!style || style.display === 'none' || style.visibility === 'hidden') return false
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }

      const header = document.querySelector('header')
      if (!header) return false

      const button = Array.from(header.querySelectorAll('button')).find(
        (node) => normalize(node.innerText) === targetText && isVisible(node)
      )
      if (!button) return false

      button.scrollIntoView({ block: 'center', inline: 'center' })
      button.click()
      return true
    }, text).catch(() => false)

    if (clicked) return
    await sleep(200)
  }

  throw new Error(`Could not find header button "${text}"`)
}

const clickButtonByExactText = async (page, text) => {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const clicked = await page.evaluate((targetText) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim()
      const isVisible = (el) => {
        const style = window.getComputedStyle(el)
        if (!style || style.display === 'none' || style.visibility === 'hidden') return false
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }

      const button = Array.from(document.querySelectorAll('button')).find(
        (node) => normalize(node.innerText) === targetText && isVisible(node)
      )
      if (!button) return false

      button.scrollIntoView({ block: 'center', inline: 'center' })
      button.click()
      return true
    }, text).catch(() => false)

    if (clicked) return
    await sleep(200)
  }

  throw new Error(`Could not find button "${text}"`)
}

const runOptionalAuthenticatedSmoke = async (page) => {
  const email = String(process.env.E2E_EMAIL || '').trim()
  const password = String(process.env.E2E_PASSWORD || '').trim()

  if (!email || !password) {
    console.log('[smoke] Skipping authenticated flow (set E2E_EMAIL and E2E_PASSWORD to enable it)')
    return
  }

  await gotoPath(page, '/login')
  await typeInto(page, '#email', email)
  await typeInto(page, '#password', password)
  await clickButtonByExactText(page, 'Continue')

  await page.waitForSelector('button[aria-haspopup="menu"]', { timeout: timeoutMs })

  await gotoPath(page, '/settings')
  await page.waitForFunction(() => window.location.pathname === '/settings', { timeout: timeoutMs })

  await gotoPath(page, '/')
  await clickHeaderButtonByExactText(page, 'Create')
  await page.waitForSelector('[role="dialog"][aria-label="Create post"]', { visible: true, timeout: timeoutMs })
  await page.click('[role="dialog"][aria-label="Create post"] [aria-label="Close"]')
  await page.waitForSelector('[role="dialog"][aria-label="Create post"]', { hidden: true, timeout: timeoutMs })

  await page.waitForSelector('input[id^="comment-"]', { visible: true, timeout: timeoutMs })
  await typeInto(page, 'input[id^="comment-"]', 'Smoke draft comment')
  await page.waitForFunction(() => {
    const input = document.querySelector('input[id^="comment-"]')
    if (!input) return false
    const wrapper = input.parentElement
    const button = wrapper ? wrapper.querySelector('button') : null
    return Boolean(button && !button.disabled)
  }, { timeout: timeoutMs })
  await page.click('input[id^="comment-"]', { clickCount: 3 })
  await page.keyboard.press('Backspace')

  await page.click('button[aria-haspopup="menu"]')
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('button')).some(
      (node) => (node.innerText || '').replace(/\s+/g, ' ').trim() === 'Log out'
    )
  }, { timeout: timeoutMs })
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll('button')).find(
      (node) => (node.innerText || '').replace(/\s+/g, ' ').trim() === 'Log out'
    )
    if (button) button.click()
  })
  await page.waitForFunction(() => window.location.pathname !== '/settings', { timeout: timeoutMs })
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

    await gotoPath(page, '/settings')
    await expectRedirectToLogin(page, '/settings')
    const signupHref = await page.$eval('a[href*="/signup"]', (element) => element.getAttribute('href') || '')
    if (signupHref !== '/signup?returnTo=%2Fsettings') {
      throw new Error(`[auth] signup link did not preserve returnTo: ${signupHref}`)
    }

    await runOptionalAuthenticatedSmoke(page)

    await gotoPath(page, '/about')
    await page.waitForSelector('h1', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/about', expectJsonLdTypes: ['FAQPage', 'Organization'] })

    await gotoPath(page, '/')
    const homeProps = await getNextPageProps(page)
    const firstPostId = Array.isArray(homeProps.initialFeaturedPosts)
      ? homeProps.initialFeaturedPosts.find((post) => post && post.id)?.id
      : ''
    if (firstPostId) {
      await gotoPath(page, `/postDetails?postId=${encodeURIComponent(firstPostId)}`)
      await page.waitForSelector('main', { timeout: timeoutMs })
      await assertSeoBasics(page, {
        path: `/postDetails?postId=${firstPostId}`,
        expectJsonLdTypes: ['DiscussionForumPosting'],
      })
    }

    await gotoPath(page, '/companies')
    await page.waitForSelector('#companies-search', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/companies', expectJsonLdTypes: ['CollectionPage'] })
    const companyProps = await getNextPageProps(page)
    const firstCompany = Object.values(companyProps.initialPostCompanies || {})
      .map((entry) => entry?.meta?.title || '')
      .find(Boolean)
    if (firstCompany) {
      await gotoPath(page, `/companies?id=${encodeURIComponent(firstCompany)}`)
      await page.waitForSelector('main', { timeout: timeoutMs })
      await page.waitForFunction(() => {
        const text = document.body.innerText || ''
        return text.includes('No posts yet for this company') || text.length > 100
      }, { timeout: timeoutMs })
    }

    await gotoPath(page, '/tags')
    await page.waitForSelector('#tags-search', { timeout: timeoutMs })
    await assertSeoBasics(page, { path: '/tags', expectJsonLdTypes: ['CollectionPage'] })
    const tagProps = await getNextPageProps(page)
    const initialTagsData = tagProps.initialTagsData
    const firstTag = Array.isArray(initialTagsData)
      ? initialTagsData.find((entry) => entry?.tag || entry?.name || entry?.key)?.tag ||
        initialTagsData.find((entry) => entry?.tag || entry?.name || entry?.key)?.name ||
        initialTagsData.find((entry) => entry?.tag || entry?.name || entry?.key)?.key
      : Object.keys(initialTagsData || {}).find(Boolean)
    if (firstTag) {
      await gotoPath(page, `/tags?id=${encodeURIComponent(String(firstTag).replace(/^#/, ''))}`)
      await page.waitForSelector('main', { timeout: timeoutMs })
      await page.waitForFunction(() => {
        const text = document.body.innerText || ''
        return text.includes('No posts yet for this tag') || text.length > 100
      }, { timeout: timeoutMs })
    }

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
