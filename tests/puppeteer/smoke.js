const fs = require('fs')
const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer-core')

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000'
const headless = !['0', 'false', 'no'].includes(String(process.env.E2E_HEADLESS || '1').toLowerCase())
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS || 45_000)

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

    await gotoPath(page, '/login')
    await page.waitForSelector('#email', { timeout: timeoutMs })

    await gotoPath(page, '/signup')
    await page.waitForSelector('#email', { timeout: timeoutMs })

    await gotoPath(page, '/about')
    await page.waitForSelector('h1', { timeout: timeoutMs })

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

