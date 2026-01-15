const fs = require('fs')
const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer-core')

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000'
const headless = ['1', 'true', 'yes'].includes(String(process.env.E2E_HEADLESS || '').toLowerCase())
const slowMo = Number(process.env.E2E_SLOWMO_MS || 75)
const stepDelayMs = Number(process.env.E2E_STEP_DELAY_MS || 900)
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS || 60_000)

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

const step = async (label, fn) => {
  console.log(`\n[e2e] ${label}`)
  await fn()
  if (stepDelayMs > 0) await sleep(stepDelayMs)
}

const gotoPath = async (page, urlPath, options = {}) => {
  const url = urlPath.startsWith('http') ? urlPath : `${baseUrl}${urlPath}`
  await page.goto(url, { waitUntil: 'domcontentloaded', ...options })
}

const typeInto = async (page, selector, value) => {
  await page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
  await page.click(selector, { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type(selector, value, { delay: 35 })
}

const clickByExactText = async (page, text) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const clicked = await page
      .evaluate((targetText) => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim()
        const isVisible = (el) => {
          const style = window.getComputedStyle(el)
          if (!style || style.display === 'none' || style.visibility === 'hidden') return false
          const rect = el.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0
        }

        const candidates = Array.from(document.querySelectorAll('button, a, [role="button"], div'))
        const el = candidates.find(node => normalize(node.innerText) === targetText && isVisible(node))
        if (!el) return false
        el.scrollIntoView({ block: 'center', inline: 'center' })
        el.click()
        return true
      }, text)
      .catch(() => false)

    if (clicked) return
    await sleep(250)
  }

  throw new Error(`Could not find visible text "${text}"`)
}

const waitForAppHeader = async (page) => {
  await page.waitForSelector('input[aria-label="Search Gossips"]', { timeout: timeoutMs })
}

const run = async () => {
  console.log('Start...')

  const chromePath = pickChromePath()
  if (!chromePath) {
    throw new Error(
      'Chrome not found. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH to your local Chrome binary.'
    )
  }

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-e2e-'))

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless,
    slowMo,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,800',
      `--user-data-dir=${profileDir}`,
    ],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(timeoutMs)

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
  const email = process.env.E2E_EMAIL || `demo+${suffix}@example.com`
  const password = process.env.E2E_PASSWORD || `DemoPassword!${suffix}`
  const username = process.env.E2E_USERNAME || `demo_${suffix.replace(/[^a-z0-9_]/gi, '')}`

  try {
    await step('Signup (skip verification)', async () => {
      await gotoPath(page, '/signup')
      await typeInto(page, '#email', email)
      await clickByExactText(page, 'Continue')
      await page.waitForSelector('#code', { visible: true, timeout: timeoutMs })
      await clickByExactText(page, 'Skip')

      await page.waitForSelector('#username', { visible: true, timeout: timeoutMs })
      await typeInto(page, '#username', username)
      await typeInto(page, '#password', password)
      await clickByExactText(page, 'Continue')

      await clickByExactText(page, 'Skip')
      await sleep(stepDelayMs)
      await clickByExactText(page, 'Skip')
      await sleep(stepDelayMs)
      await clickByExactText(page, 'Skip')
      await sleep(stepDelayMs)

      await waitForAppHeader(page)
    })

    await step('Logout', async () => {
      await page.waitForSelector('button[aria-haspopup=\"menu\"]', { visible: true, timeout: timeoutMs })
      await page.click('button[aria-haspopup=\"menu\"]')
      await clickByExactText(page, 'Log out')
      await sleep(stepDelayMs)
    })

    await step('Login', async () => {
      await gotoPath(page, '/login')
      await typeInto(page, '#email', email)
      await typeInto(page, '#password', password)
      await clickByExactText(page, 'Continue')
      await waitForAppHeader(page)
    })

    await step('Home → post details', async () => {
      await gotoPath(page, '/')
      await waitForAppHeader(page)
      const firstPostLink = await page.waitForSelector('a[href^=\"/postDetails?postId=\"]', { timeout: timeoutMs })
      await firstPostLink.click()
      await page.waitForFunction(() => window.location.pathname === '/postDetails', { timeout: timeoutMs })
    })

    await step('Companies → detail', async () => {
      await gotoPath(page, '/companies')
      await waitForAppHeader(page)
      const firstCompanyLink = await page.waitForSelector('a[href^=\"/companies?id=\"]', { timeout: timeoutMs })
      await firstCompanyLink.click()
      await page.waitForFunction(() => window.location.pathname === '/companies' && window.location.search.includes('id='), { timeout: timeoutMs })
    })

    await step('Tags → detail', async () => {
      await gotoPath(page, '/tags')
      await waitForAppHeader(page)
      const firstTagLink = await page.waitForSelector('a[href^=\"/tags?id=\"]', { timeout: timeoutMs })
      await firstTagLink.click()
      await page.waitForFunction(() => window.location.pathname === '/tags' && window.location.search.includes('id='), { timeout: timeoutMs })
    })

    await step('About', async () => {
      await gotoPath(page, '/about')
      await page.waitForSelector('h1', { timeout: timeoutMs })
    })

    await step('Profile', async () => {
      await gotoPath(page, '/')
      await waitForAppHeader(page)
      const profileLink = await page.waitForSelector('a[href^=\"/profile?id=\"]', { timeout: timeoutMs })
      const href = await profileLink.evaluate(el => el.getAttribute('href'))
      if (!href) throw new Error('Could not find a profile link in the feed')
      await gotoPath(page, href)
      await waitForAppHeader(page)
    })

    await step('Settings', async () => {
      await gotoPath(page, '/settings')
      await waitForAppHeader(page)
    })

    await step('Notifications', async () => {
      await gotoPath(page, '/notifications')
      await waitForAppHeader(page)
    })

    await step('Admin pages (may redirect)', async () => {
      await gotoPath(page, '/admin')
      await sleep(stepDelayMs)
      await gotoPath(page, '/auth-domain')
      await sleep(stepDelayMs)
    })

    await step('Utility pages', async () => {
      await gotoPath(page, '/rtdb-root')
      await page.waitForSelector('h1', { timeout: timeoutMs })
      await sleep(stepDelayMs)
      await gotoPath(page, '/2fa')
      await page.waitForSelector('h1', { timeout: timeoutMs })
      await sleep(stepDelayMs)
      await gotoPath(page, '/quill')
      await page.waitForSelector('h1', { timeout: timeoutMs })
      await sleep(stepDelayMs)
    })

    console.log('\n[e2e] Done')
  } finally {
    await browser.close()
    fs.rmSync(profileDir, { recursive: true, force: true })
  }
}

run().catch((err) => {
  console.error('\n[e2e] Failed:', err)
  process.exitCode = 1
})
