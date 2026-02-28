const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const puppeteer = require('puppeteer-core')

const devBaseUrl = process.env.DEV_BASE_URL || 'http://127.0.0.1:3000'
const prodBaseUrl = process.env.PROD_BASE_URL || 'https://corpgossip.com'

const headless = !['0', 'false', 'no'].includes(String(process.env.E2E_HEADLESS || '1').toLowerCase())
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS || 60_000)
const diffMaxPixelsDefault = Number(process.env.E2E_DIFF_MAX_PIXELS || 0)
const diffFuzz = String(process.env.E2E_DIFF_FUZZ || '0%')

const outDir = process.env.E2E_COMPARE_OUT_DIR || path.join(process.cwd(), 'tests/puppeteer/out/compare')

const screenshotWidth = Number(process.env.E2E_SCREENSHOT_WIDTH || 1280)
const screenshotHeight = Number(process.env.E2E_SCREENSHOT_HEIGHT || 800)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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

const getPathname = (url, fallback = '/') => {
  try {
    return new URL(url).pathname || fallback
  } catch (_) {
    return fallback
  }
}

const getSearchParams = (url) => {
  try {
    return new URL(url).searchParams
  } catch (_) {
    return new URLSearchParams()
  }
}

const waitForUrlToSettle = async (page) => {
  const startedAt = Date.now()
  let lastUrl = page.url()
  let stableSince = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    await sleep(125)
    const nextUrl = page.url()
    if (nextUrl !== lastUrl) {
      lastUrl = nextUrl
      stableSince = Date.now()
      continue
    }
    if (Date.now() - stableSince >= 750) return lastUrl
  }

  return lastUrl
}

const waitForElementCountToStabilize = async (page, selector, stableMs = 750) => {
  const startedAt = Date.now()
  let lastCount = -1
  let stableSince = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const count = await page.$$eval(selector, (els) => els.length).catch(() => 0)
    if (count !== lastCount) {
      lastCount = count
      stableSince = Date.now()
    } else if (Date.now() - stableSince >= stableMs) {
      return
    }
    await sleep(125)
  }
}

const waitForStableSelector = async (page, routePathname, finalUrl) => {
  if (routePathname === '/login' || routePathname === '/signup') {
    await page.waitForSelector('#email', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/about') {
    await page.waitForSelector('h1', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/') {
    await page.waitForSelector('#home-search', { timeout: timeoutMs })
    await page.waitForSelector('div[id^="post-"]', { timeout: timeoutMs })
    await page.waitForSelector('main aside img', { timeout: timeoutMs })
    await waitForElementCountToStabilize(page, 'div[id^="post-"]', 1000)
    return
  }

  if (routePathname === '/companies') {
    await page.waitForSelector('#companies-search', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/tags') {
    await page.waitForSelector('#tags-search', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/choose-username') {
    await page.waitForSelector('#username', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/settings') {
    await page.waitForFunction(() => {
      return Boolean(
        document.querySelector('#email') ||
          document.querySelector('[role="tablist"][aria-label="Settings tabs"]')
      )
    }, { timeout: timeoutMs })
    return
  }

  if (routePathname === '/postDetails') {
    await page.waitForFunction(() => {
      const text = (document.body?.innerText || '').toLowerCase()
      if (text.includes('post not found')) return true
      return !!document.querySelector('div[id^="post-"]')
    }, { timeout: timeoutMs })
    return
  }

  if (routePathname === '/profile') {
    await page.waitForSelector('h1', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/admin') {
    await page.waitForSelector('h1', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/2fa') {
    await page.waitForSelector('h1', { timeout: timeoutMs })
    return
  }

  if (routePathname === '/rtdb-root') {
    await page.waitForSelector('h1', { timeout: timeoutMs })
    return
  }

  await page.waitForSelector('body', { timeout: timeoutMs })
}

const safeNameForRoute = (route) => {
  if (!route || route === '/') return 'home'
  return route
    .replace(/^\//, '')
    .replace(/[^a-z0-9_-]+/gi, '_')
}

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true })
}

const discoverRoutesFromPages = () => {
  const pagesDir = path.join(process.cwd(), 'src/pages')
  const extensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
  const routes = new Set()

  const walk = (dirRel) => {
    const absDir = path.join(pagesDir, dirRel)
    if (!fs.existsSync(absDir)) return

    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      if (entry.name === 'api') continue

      const nextRel = path.join(dirRel, entry.name)
      const absPath = path.join(pagesDir, nextRel)

      if (entry.isDirectory()) {
        walk(nextRel)
        continue
      }

      const ext = path.extname(entry.name)
      if (!extensions.has(ext)) continue

      const baseName = path.basename(entry.name, ext)
      if (baseName.startsWith('_')) continue

      const relNoExt = nextRel.slice(0, -ext.length)
      const segments = relNoExt.split(path.sep).filter(Boolean)

      const routePath = baseName === 'index'
        ? `/${segments.slice(0, -1).join('/')}`
        : `/${segments.join('/')}`

      routes.add(routePath === '/' ? '/' : routePath.replace(/\/+$/g, ''))
    }
  }

  walk('')

  const sorted = [...routes]
    .filter(Boolean)
    .filter((r) => r !== '/_app' && r !== '/_document')
    .sort((a, b) => {
      if (a === '/') return -1
      if (b === '/') return 1
      return a.localeCompare(b)
    })

  if (!sorted.includes('/')) sorted.unshift('/')
  return sorted
}

const injectStabilizeCss = async (page) => {
  await page.addStyleTag({
    content: [
      '*{animation:none !important;transition:none !important;caret-color:transparent !important}',
      '*:focus{outline:none !important}',
      'html{scroll-behavior:auto !important}',
    ].join('\n')
  }).catch(() => {})
}

const waitForFontsAndImages = async (page, waitMs = 2000) => {
  await page.evaluate(async (ms) => {
    const sleep = (t) => new Promise(resolve => setTimeout(resolve, t))

    try {
      const ready = document.fonts && document.fonts.ready
      if (ready) {
        await Promise.race([ready, sleep(ms)])
      }
    } catch (_) {}

    try {
      const imgs = Array.from(document.images || [])
      const pending = imgs
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        }))
      if (pending.length) {
        await Promise.race([Promise.all(pending), sleep(ms)])
      }
    } catch (_) {}

    await sleep(50)
  }, waitMs).catch(() => {})
}

const capture = async (page, baseUrl, route, outPath) => {
  const url = `${baseUrl}${route}`

  const pageErrors = []
  const onPageError = (err) => {
    pageErrors.push(String(err && err.message ? err.message : err))
  }
  page.on('pageerror', onPageError)

  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
    await waitForPageLoadComplete(page)
    const settledUrl = await waitForUrlToSettle(page)
    const settledFinalUrl = settledUrl || page.url()
    const settledPathname = getPathname(settledFinalUrl, route)

    await waitForStableSelector(page, settledPathname, settledFinalUrl)
    const postWaitUrl = await waitForUrlToSettle(page)
    const finalUrl = postWaitUrl || page.url()
    const finalPathname = getPathname(finalUrl, route)
    await injectStabilizeCss(page)

    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {})
    await page.evaluate(() => {
      try {
        const el = document.activeElement
        if (el && typeof el.blur === 'function') el.blur()
      } catch (_) {}
    }).catch(() => {})
    await waitForFontsAndImages(page, 2500)

    await page.screenshot({ path: outPath, fullPage: false })

    const status = res ? res.status() : null
    const title = await page.title().catch(() => '')
    return { url, status, finalUrl, finalPathname, title, pageErrors }
  } finally {
    if (typeof page.off === 'function') page.off('pageerror', onPageError)
    else if (typeof page.removeListener === 'function') page.removeListener('pageerror', onPageError)
  }
}

const compareImages = (aPath, bPath, diffPath) => {
  const result = spawnSync('compare', ['-metric', 'AE', '-fuzz', diffFuzz, aPath, bPath, diffPath], { encoding: 'utf8' })
  const metricText = String(result.stderr || '').trim()

  if (result.status === 2) {
    throw new Error(metricText || 'ImageMagick compare failed')
  }

  const diffPixels = Number(metricText)
  if (!Number.isFinite(diffPixels)) {
    throw new Error(`Unexpected compare output: ${metricText}`)
  }

  return diffPixels
}

const run = async () => {
  console.log('Start...')
  console.log(`[compare] dev:  ${devBaseUrl}`)
  console.log(`[compare] prod: ${prodBaseUrl}`)
  console.log(`[compare] out:  ${outDir}`)
  console.log(`[compare] fuzz: ${diffFuzz}`)

  const chromePath = pickChromePath()
  if (!chromePath) {
    throw new Error('Chrome not found. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH.')
  }

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-compare-'))

  const routes = discoverRoutesFromPages()

  ensureDir(outDir)
  ensureDir(path.join(outDir, 'dev'))
  ensureDir(path.join(outDir, 'prod'))
  ensureDir(path.join(outDir, 'diff'))

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless,
    defaultViewport: { width: screenshotWidth, height: screenshotHeight },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-notifications',
      `--window-size=${screenshotWidth},${screenshotHeight}`,
      `--user-data-dir=${profileDir}`,
    ],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(timeoutMs)

  const report = []
  let hasDiff = false
  const seeds = {
    postId: String(process.env.E2E_POST_ID || 'does_not_exist'),
    profileUid: String(process.env.E2E_PROFILE_UID || 'does_not_exist'),
  }

  try {
    for (const route of routes) {
      const name = safeNameForRoute(route)
      const devPng = path.join(outDir, 'dev', `${name}.png`)
      const prodPng = path.join(outDir, 'prod', `${name}.png`)
      const diffPng = path.join(outDir, 'diff', `${name}.png`)

      let resolvedRoute = route
      if (route === '/postDetails' && seeds.postId) {
        resolvedRoute = `/postDetails?postId=${encodeURIComponent(seeds.postId)}`
      }
      if (route === '/profile' && seeds.profileUid) {
        resolvedRoute = `/profile?id=${encodeURIComponent(seeds.profileUid)}`
      }

      console.log(`\n[compare] ${route}`)
      const dev = await capture(page, devBaseUrl, resolvedRoute, devPng)
      const prod = await capture(page, prodBaseUrl, resolvedRoute, prodPng)

      const diffPixels = compareImages(devPng, prodPng, diffPng)
      const diffMaxPixels = route === '/2fa' ? Math.max(diffMaxPixelsDefault, 1500) : diffMaxPixelsDefault
      const ok = diffPixels <= diffMaxPixels
      if (!ok) hasDiff = true

      console.log(`[compare] diffPixels=${diffPixels} (max=${diffMaxPixels})`)
      if (dev.pageErrors.length || prod.pageErrors.length) {
        console.log(`[compare] pageErrors dev=${dev.pageErrors.length} prod=${prod.pageErrors.length}`)
      }

      report.push({
        route,
        resolvedRoute,
        seeds: route === '/' ? { ...seeds } : undefined,
        dev,
        prod,
        diffPixels,
        diffMaxPixels,
        ok,
        paths: { devPng, prodPng, diffPng },
      })
    }

    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
    console.log('\n[compare] Done')
  } finally {
    await browser.close()
    fs.rmSync(profileDir, { recursive: true, force: true })
  }

  if (hasDiff) process.exitCode = 1
}

run().catch((err) => {
  console.error('\n[compare] Failed:', err)
  process.exitCode = 1
})
