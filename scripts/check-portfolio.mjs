import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import axe from 'axe-core'

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Run against a local preview only.')
const artifacts = 'artifacts/redesign'
await mkdir(artifacts, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
const runtimeErrors = []
const viewports = [[320, 812], [390, 844], [768, 1024], [1024, 900], [1440, 1000], [1920, 1080]]
const captures = [390, 768, 1440]
const pass = (name, detail) => { results.push({ name, status: 'pass', detail }); console.log('PASS ' + name) }
const newContext = async (options = {}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', ...options })
  // No test is allowed to reach the real inquiry endpoint.
  await context.route('https://script.google.com/**', (route) => route.abort('blockedbyclient'))
  return context
}
const load = async (page) => {
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
}
const loadImages = async (page) => {
  for (const img of await page.locator('img[loading="lazy"]').all()) {
    await img.scrollIntoViewIfNeeded()
    await img.evaluate(async (image) => {
      // Responsive candidates can change as an offscreen lazy image is selected.
      if (!image.complete || !image.naturalWidth) await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', reject, { once: true })
      })
      await image.decode()
    })
  }
}

try {
  for (const [width, height] of viewports) {
    const context = await newContext({ viewport: { width, height }, hasTouch: width < 900 })
    const page = await context.newPage()
    await load(page)
    await loadImages(page)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Horizontal overflow at ' + width)
    assert.equal(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true)
    assert.equal(await page.locator('h1').count(), 1)
    const missingAnchors = await page.locator('a[href^="#"]').evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')).filter((href) => !document.getElementById(href.slice(1))))
    assert.deepEqual(missingAnchors, [])
    if (captures.includes(width)) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.screenshot({ path: artifacts + '/desktop-' + width + '.png', fullPage: true })
      await page.screenshot({ path: artifacts + '/hero-' + width + '.png' })
      await page.addScriptTag({ content: axe.source })
      const audit = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }))
      await writeFile(artifacts + '/axe-' + width + '.json', JSON.stringify({ violations: audit.violations, incomplete: audit.incomplete.map((item) => ({ id: item.id, impact: item.impact })) }, null, 2))
      assert.deepEqual(audit.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], 'Accessibility violations at ' + width)
      pass('Accessibility at ' + width, 'No axe WCAG A/AA violations; keyboard and motion checked separately.')
    }
    if (width === 390 || width === 1440) {
      for (const id of ['projects', 'services', 'about', 'creator', 'contact']) {
        if (width === 390) {
          await page.getByRole('button', { name: 'Menu', exact: true }).tap()
          await page.locator('.nav-links.is-open').waitFor()
        }
        await page.locator('.nav-links a[href="#' + id + '"]').click()
        const top = await page.locator('#' + id).evaluate((section) => section.getBoundingClientRect().top)
        const headerBottom = await page.locator('.site-header').evaluate((header) => header.getBoundingClientRect().bottom)
        assert(top >= headerBottom && top <= headerBottom + 40, id + ' anchor is covered or offset too far')
        if (width === 390) assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false')
      }
      pass('Navigation at ' + width, 'All five navigation links land below the sticky header; mobile disclosure closes.')
    }
    pass('Layout at ' + width + '×' + height, 'No horizontal overflow, all images decoded, one H1, all internal anchor targets exist.')
    await context.close()
  }

  const context = await newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  await load(page)
  await page.keyboard.press('Tab')
  assert.equal(await page.locator(':focus').textContent(), 'Skip to content')
  assert.equal(await page.locator(':focus').evaluate((element) => getComputedStyle(element).outlineStyle !== 'none'), true)
  await page.keyboard.press('Enter')
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main')
  await page.keyboard.press('Tab')
  assert.match(await page.locator(':focus').textContent(), /Explore my work/)
  pass('Keyboard skip link', 'First Tab shows the focused skip link; Enter moves to main and the next Tab reaches the hero action.')

  const pdf = await page.request.get(base + '/GI-Joel-Media-Kit-2026-10-17.pdf')
  assert.equal(pdf.status(), 200)
  assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: /Media kit/ }).click()
  assert.equal((await downloadPromise).suggestedFilename(), 'GI-Joel-Media-Kit-2026-10-17.pdf')
  for (const path of ['/brand/monogram.png', '/favicon-16.png', '/favicon-32.png', '/apple-touch-icon.png']) {
    const response = await page.request.get(base + path)
    assert.equal(response.status(), 200)
    assert.match(response.headers()['content-type'], /image\/png/)
  }
  const urls = await page.locator('a[href^="https:"]').evaluateAll((anchors) => [...new Set(anchors.map((a) => a.href))])
  for (const url of ['https://trialborn.app/', 'https://rephra.app/', 'https://fairhavendesign.com/', 'https://ironclad-ops-ai.joel-prentiss89.workers.dev/', 'https://github.com/joelprentiss/ironclad-ops-ai', 'https://github.com/joelprentiss', 'https://www.linkedin.com/in/joel-prentiss/', 'https://www.instagram.com/thegijoel/', 'https://tiktok.com/@thegijoel', 'https://www.youtube.com/c/TheGIJoel']) assert(urls.includes(url), 'Missing preserved link: ' + url)
  pass('Assets and links', 'PDF download succeeds with the existing filename; PNG logo and favicons return images; all project and social destinations are preserved.')

  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.locator('#contact').scrollIntoViewIfNeeded()
  let requests = []
  let release
  let scenario = 'failure'
  await context.route('https://script.google.com/**', async (route) => {
    requests.push({ body: JSON.parse(route.request().postData()), method: route.request().method(), headers: route.request().headers() })
    if (scenario === 'failure') return route.abort('failed')
    if (scenario === 'pending') {
      await new Promise((resolve) => { release = resolve })
      return route.fulfill({ status: 200, contentType: 'text/plain', body: '{"ok":true}' })
    }
    // The timeout scenario leaves the intercepted request pending until aborted.
  })
  const form = page.getByRole('form', { name: 'Contact Joel' })
  await form.getByRole('button', { name: 'Send message' }).click()
  assert.equal(await form.locator('[aria-invalid="true"]').count(), 3)
  assert.equal(await page.locator(':focus').getAttribute('name'), 'name')
  assert.equal(requests.length, 0)
  await form.screenshot({ path: artifacts + '/contact-validation.png' })
  await form.locator('[name="name"]').fill('Portfolio QA')
  await form.locator('[name="email"]').fill('invalid-email')
  await form.locator('[name="details"]').fill('Local test only. This must never reach the real endpoint.')
  await form.getByRole('button', { name: 'Send message' }).click()
  assert.equal(await page.locator(':focus').getAttribute('name'), 'email')
  assert.equal(requests.length, 0)
  await form.locator('[name="email"]').fill('qa@example.com')
  await form.locator('summary').click()
  await form.locator('[name="link"]').fill('invalid-url')
  await form.locator('summary').click()
  await form.getByRole('button', { name: 'Send message' }).click()
  assert.equal(await page.locator(':focus').getAttribute('name'), 'link')
  assert.equal(await form.locator('details').getAttribute('open'), '')
  assert.equal(requests.length, 0)
  await form.locator('[name="link"]').fill('')
  await form.getByRole('button', { name: 'Send message' }).click()
  await form.locator('.form-error').waitFor()
  assert.equal(await form.locator('[name="name"]').inputValue(), 'Portfolio QA')
  assert.match(await form.locator('[name="details"]').inputValue(), /Local test only/)
  await form.screenshot({ path: artifacts + '/contact-error.png' })
  pass('Validation and failure recovery', 'Empty fields, malformed email, and a collapsed invalid optional URL are caught with focus and inline messages. Network failure retains the draft.')

  requests = []
  scenario = 'pending'
  await form.evaluate((element) => { element.requestSubmit(); element.requestSubmit() })
  await page.waitForFunction(() => document.querySelector('form').getAttribute('aria-busy') === 'true')
  await page.waitForTimeout(100)
  assert.equal(requests.length, 1, 'Duplicate request sent')
  assert.equal(await form.locator('[name="name"]').isDisabled(), true)
  assert.equal(await form.getByRole('button', { name: 'Sending…' }).isDisabled(), true)
  assert.match(requests[0].headers['content-type'], /text\/plain/)
  assert.equal(requests[0].method, 'POST')
  assert.deepEqual(Object.keys(requests[0].body).sort(), ['details', 'email', 'link', 'name', 'need', 'projectName'])
  assert.equal(requests[0].body.need, '')
  await form.screenshot({ path: artifacts + '/contact-pending.png' })
  release()
  await form.locator('.confirmation').waitFor()
  assert.equal(await form.locator('[name="name"]').inputValue(), '')
  assert.match(await form.locator('[role="status"]').innerText(), /can’t confirm receipt/)
  await form.screenshot({ path: artifacts + '/contact-dispatched.png' })
  pass('Pending and dispatched states', 'Duplicate submit blocked, controls disabled while pending, original POST and six payload keys preserved, form resets, and live confirmation accurately describes unverified delivery.')

  await page.clock.install()
  scenario = 'timeout'
  await form.locator('[name="name"]').fill('Timeout QA')
  await form.locator('[name="email"]').fill('qa@example.com')
  await form.locator('[name="details"]').fill('Intercepted timeout test.')
  await form.getByRole('button', { name: 'Send message' }).click()
  await page.clock.fastForward(21000)
  await form.locator('.form-error').waitFor()
  assert.match(await form.locator('.form-error').innerText(), /delivery is uncertain/)
  assert.equal(await form.locator('[name="name"]').inputValue(), 'Timeout QA')
  pass('Timeout recovery', 'After 20 seconds the request aborts, draft stays intact, and the message distinguishes uncertain delivery.')
  await context.close()

  const mobile = await newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const mobilePage = await mobile.newPage()
  await load(mobilePage)
  await mobilePage.getByRole('button', { name: 'Menu', exact: true }).focus()
  await mobilePage.keyboard.press('Enter')
  await mobilePage.keyboard.press('Tab')
  assert.equal(await mobilePage.locator(':focus').innerText(), 'Work')
  await mobilePage.keyboard.press('Escape')
  assert.equal(await mobilePage.locator(':focus').innerText(), 'Menu')
  assert.equal(await mobilePage.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false')
  await mobilePage.getByRole('button', { name: 'Menu', exact: true }).click()
  await mobilePage.screenshot({ path: artifacts + '/mobile-menu.png' })
  await mobilePage.locator('.portrait-window').click()
  assert.equal(await mobilePage.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false')
  await mobilePage.emulateMedia({ reducedMotion: 'no-preference' })
  assert.equal(await mobilePage.locator('.portrait').evaluate((el) => el.style.getPropertyValue('--parallax-y')), '')
  pass('Mobile keyboard and motion', 'Disclosure supports Enter, Tab, Escape with focus return, and outside click. Portrait parallax is disabled on mobile.')
  await mobile.close()

  const motionContext = await newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' })
  await motionContext.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }))
  const motionPage = await motionContext.newPage()
  await load(motionPage)
  const initial = await motionPage.locator('.portrait').evaluate((el) => el.style.getPropertyValue('--parallax-y'))
  assert((await motionPage.locator('.reveal-pending').count()) > 0)
  await motionPage.evaluate(() => window.scrollTo({ top: 350, behavior: 'instant' }))
  await motionPage.waitForFunction((value) => document.querySelector('.portrait').style.getPropertyValue('--parallax-y') !== value, initial)
  const shift = await motionPage.locator('.portrait').evaluate((el) => parseFloat(el.style.getPropertyValue('--parallax-y')))
  assert(shift >= -12 && shift <= 24)
  await motionPage.emulateMedia({ reducedMotion: 'reduce' })
  await motionPage.waitForFunction(() => document.querySelectorAll('.reveal-pending').length === 0)
  assert.equal(await motionPage.locator('.reveal-pending').count(), 0)
  assert.equal(await motionPage.locator('.portrait').evaluate((el) => getComputedStyle(el).transform), 'none')
  assert.equal(await motionPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto')
  assert.equal(await motionPage.locator('[data-reveal]').evaluateAll((elements) => elements.every((el) => getComputedStyle(el).opacity === '1')), true)
  pass('Motion and live reduced-motion change', 'Desktop portrait moves within a 36px range; offscreen sections reveal; changing preference immediately exposes all content and removes transforms and smooth scrolling.')
  await motionContext.close()

  const fallback = await newContext({ reducedMotion: 'no-preference' })
  await fallback.addInitScript(() => { delete window.IntersectionObserver })
  const fallbackPage = await fallback.newPage()
  await load(fallbackPage)
  assert.equal(await fallbackPage.locator('.reveal-pending').count(), 0)
  pass('Animation fallback', 'Content stays visible when IntersectionObserver is unavailable.')
  await fallback.close()
  assert.deepEqual(runtimeErrors, [])
  pass('Browser runtime', 'No uncaught page errors throughout the checks.')
} finally {
  await writeFile(artifacts + '/checks.json', JSON.stringify({ runAt: new Date().toISOString(), base, results, runtimeErrors }, null, 2))
  await browser.close()
}
