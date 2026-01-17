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

const waitForPageLoadComplete = async (page) => {
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: timeoutMs })
}

const gotoPath = async (page, urlPath, options = {}) => {
  const url = urlPath.startsWith('http') ? urlPath : `${baseUrl}${urlPath}`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs, ...options })
  await waitForPageLoadComplete(page)
}

const typeInto = async (page, selector, value) => {
  await page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
  await page.click(selector, { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type(selector, value, { delay: 35 })
}

const typeIntoQuill = async (page, selector, value) => {
  await page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
  await page.click(selector)
  await page.keyboard.down('Control')
  await page.keyboard.press('A')
  await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
  await page.type(selector, value, { delay: 25 })
}

const clickButtonByExactText = async (page, text) => {
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

        const candidates = Array.from(document.querySelectorAll('button'))
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

  throw new Error(`Could not find visible button "${text}"`)
}

const clickHeaderButtonByExactText = async (page, text) => {
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

        const header = document.querySelector('header')
        if (!header) return false
        const candidates = Array.from(header.querySelectorAll('button'))
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

  throw new Error(`Could not find header button "${text}"`)
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

const waitForLoggedInHeader = async (page) => {
  await waitForAppHeader(page)
  await page.waitForSelector('button[aria-haspopup="menu"]', { timeout: timeoutMs })
}

const waitForFollowSearchLabel = async (page, label) => {
  await page.waitForFunction((expected) => {
    const el = document.querySelector('label[for="picker-search"]')
    if (!el) return false
    return (el.innerText || '').includes(expected)
  }, { timeout: timeoutMs }, label)
}

const skipFollowSetup = async (page) => {
  const labels = ['Search topics', 'Search companies', 'Search people']
  for (const label of labels) {
    await waitForFollowSearchLabel(page, label)
    await clickByExactText(page, 'Skip')
  }
}

const waitForSelectorOrDebug = async (page, selector, label) => {
  try {
    await page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
  } catch (err) {
    const debug = await page.evaluate((sel) => {
      const headerButtons = Array.from(document.querySelectorAll('header button'))
        .map((btn) => (btn && btn.innerText ? btn.innerText : ''))
        .map((txt) => (txt || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)

      const dialogs = Array.from(document.querySelectorAll('[role="dialog"]')).map((node) => ({
        ariaLabel: node.getAttribute('aria-label') || '',
        ariaModal: node.getAttribute('aria-modal') || ''
      }))

      const hasSelector = Boolean(document.querySelector(sel))
      const url = window.location.href
      return { url, hasSelector, headerButtons, dialogs }
    }, selector)

    throw new Error(`${label} not found (${selector}). Debug: ${JSON.stringify(debug)}`)
  }
}

const clickInCreatePostModalByExactText = async (page, text) => {
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

        const root = document.querySelector('[role="dialog"][aria-label="Create post"]')
        if (!root) return false

        const candidates = Array.from(root.querySelectorAll('button, a, [role="button"], div'))
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

  throw new Error(`Could not find "${text}" inside create post modal`)
}

const waitForCreatePostModalCanPost = async (page) => {
  await page.waitForFunction(() => {
    const root = document.querySelector('[role="dialog"][aria-label="Create post"]')
    if (!root) return false
    const btn = root.querySelector('[data-layer="Frame 48097040"] [data-layer="Primary Button"]')
    return Boolean(btn && typeof btn.className === 'string' && btn.className.includes('cursor-pointer'))
  }, { timeout: timeoutMs })
}

const clickCreatePostModalPostButton = async (page) => {
  await page.click('[role="dialog"][aria-label="Create post"] [data-layer="Frame 48097040"] [data-layer="Primary Button"]')
}

const waitForPostTitleVisible = async (page, title) => {
  await page.waitForFunction((postTitle) => {
    const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim()
    const isVisible = (el) => {
      const style = window.getComputedStyle(el)
      if (!style || style.display === 'none' || style.visibility === 'hidden') return false
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }

    return Array.from(document.querySelectorAll('h2')).some(
      (h) => normalize(h.innerText) === postTitle && isVisible(h)
    )
  }, { timeout: timeoutMs }, title)
}

const openPostMenuByTitle = async (page, title) => {
  const opened = await page.evaluate((postTitle) => {
    const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim()
    const isVisible = (el) => {
      const style = window.getComputedStyle(el)
      if (!style || style.display === 'none' || style.visibility === 'hidden') return false
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }
    const headings = Array.from(document.querySelectorAll('h2'))
    const heading = headings.find(h => normalize(h.innerText) === postTitle && isVisible(h))
    if (!heading) return false

    let node = heading
    while (node && node !== document.body) {
      const menuButton = node.querySelector('button[aria-haspopup="true"]')
      if (menuButton) {
        menuButton.scrollIntoView({ block: 'center', inline: 'center' })
        menuButton.click()
        return true
      }
      node = node.parentElement
    }

    return false
  }, title)

  if (!opened) throw new Error(`Could not open post menu for "${title}"`)
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
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-notifications',
      '--window-size=1280,800',
      `--user-data-dir=${profileDir}`,
    ],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(timeoutMs)

	const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
	const email = process.env.E2E_EMAIL || `demo+${suffix}@hello.localhost`
	const password = process.env.E2E_PASSWORD || `DemoPassword!${suffix}`
	const username = process.env.E2E_USERNAME || `_${suffix.replace(/[^a-z0-9]/gi, '')}`
	const usernameUpdated = process.env.E2E_USERNAME_UPDATED || `_${suffix.replace(/[^a-z0-9]/gi, '')}x`
	const postTitle = process.env.E2E_POST_TITLE || `E2E demo post ${suffix}`
	const postTitleUpdated = process.env.E2E_POST_TITLE_UPDATED || `E2E demo post updated ${suffix}`

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

      await skipFollowSetup(page)
			await waitForAppHeader(page)
		})

		await step('Choose username (demo)', async () => {
			await gotoPath(page, '/choose-username')
			await page.waitForSelector('#username', { visible: true, timeout: timeoutMs })
			await typeInto(page, '#username', usernameUpdated)
      await page.waitForSelector('[data-testid="choose-username-continue"]:not([disabled])', { visible: true, timeout: timeoutMs })
			await page.click('[data-testid="choose-username-continue"]')
			await page.waitForFunction(() => window.location.pathname === '/', { timeout: timeoutMs })
			await waitForAppHeader(page)
		})

		await step('Logout', async () => {
			await page.waitForSelector('button[aria-haspopup=\"menu\"]', { visible: true, timeout: timeoutMs })
			await page.click('button[aria-haspopup=\"menu\"]')
			await clickByExactText(page, 'Log out')
			await sleep(stepDelayMs)
		})

			await step('Signup (existing email shows error)', async () => {
				await gotoPath(page, '/signup')
				await typeInto(page, '#email', email)
				await clickByExactText(page, 'Continue')
				await page.waitForFunction(
					() => document.body.innerText.includes('This email is already in use'),
					{ timeout: timeoutMs }
				)
				await page.waitForFunction(() => !document.querySelector('#code'), { timeout: timeoutMs })
				await sleep(Math.max(stepDelayMs, 2500))
			})

		await step('Login', async () => {
			await gotoPath(page, '/login')
			await typeInto(page, '#email', email)
			await typeInto(page, '#password', password)
      await clickByExactText(page, 'Continue')
      await waitForAppHeader(page)
    })

    await step('Create, edit, delete post', async () => {
      await gotoPath(page, '/')
      await waitForLoggedInHeader(page)

      await clickHeaderButtonByExactText(page, 'Create')
      await waitForSelectorOrDebug(page, '[role="dialog"][aria-label="Create post"]', 'Create post modal')

      await typeInto(page, '#post-title', postTitle)
      await typeIntoQuill(page, '[aria-label="Create post"] .create-post-quill .ql-editor', `Hello from Puppeteer (${suffix})`)
      await waitForCreatePostModalCanPost(page)
      await clickCreatePostModalPostButton(page)
      await page.waitForSelector('[aria-label="Create post"]', { hidden: true, timeout: timeoutMs })

      await waitForPostTitleVisible(page, postTitle)

      await openPostMenuByTitle(page, postTitle)
      await clickByExactText(page, 'Edit post')
      await page.waitForSelector('[aria-label="Create post"]', { visible: true, timeout: timeoutMs })

      await typeInto(page, '#post-title', postTitleUpdated)
      await typeIntoQuill(page, '[aria-label="Create post"] .create-post-quill .ql-editor', `Updated by Puppeteer (${suffix})`)
      await waitForCreatePostModalCanPost(page)
      await clickCreatePostModalPostButton(page)
      await page.waitForSelector('[aria-label="Create post"]', { hidden: true, timeout: timeoutMs })

      await waitForPostTitleVisible(page, postTitleUpdated)

      await openPostMenuByTitle(page, postTitleUpdated)
      await clickByExactText(page, 'Delete')
      await page.waitForFunction((title) => !document.body.innerText.includes(title), { timeout: timeoutMs }, postTitleUpdated)
    })

    await step('Home → post details', async () => {
      await gotoPath(page, '/')
      await waitForAppHeader(page)
      const firstPostLink = await page.waitForSelector('a[href^=\"/postDetails?postId=\"]', { timeout: timeoutMs })
      await firstPostLink.click()
      await page.waitForFunction(() => window.location.pathname === '/postDetails', { timeout: timeoutMs })
      await waitForPageLoadComplete(page)
    })

    await step('Companies → detail', async () => {
      await gotoPath(page, '/companies')
      await waitForAppHeader(page)
      const firstCompanyLink = await page.waitForSelector('a[href^=\"/companies?id=\"]', { timeout: timeoutMs })
      await firstCompanyLink.click()
      await page.waitForFunction(() => window.location.pathname === '/companies' && window.location.search.includes('id='), { timeout: timeoutMs })
      await waitForPageLoadComplete(page)
    })

    await step('Tags → detail', async () => {
      await gotoPath(page, '/tags')
      await waitForAppHeader(page)
      const firstTagLink = await page.waitForSelector('a[href^=\"/tags?id=\"]', { timeout: timeoutMs })
      await firstTagLink.click()
      await page.waitForFunction(() => window.location.pathname === '/tags' && window.location.search.includes('id='), { timeout: timeoutMs })
      await waitForPageLoadComplete(page)
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

    await step('Admin page (may redirect)', async () => {
      await gotoPath(page, '/admin')
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
