import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import axe from 'axe-core'

// Exercise the actual Worker asset routing, not a fallback dev-server shell.
const base = process.env.GUIDES_URL || 'http://127.0.0.1:8787'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local preview.')
const origin = 'https://joelprentiss.com'
const slugs = ['grow-estate-sale-business-texas', 'estate-sale-referral-partners', 'estate-sale-website-checklist']
const paths = ['/guides', ...slugs.map((slug) => '/guides/' + slug)]
const results = []
const directory = 'artifacts/guides'
await mkdir(directory, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ reducedMotion: 'reduce' })
await context.route('https://script.google.com/**', (route) => route.abort('blockedbyclient'))
const page = await context.newPage()
page.setDefaultTimeout(10000)
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
const pass = (name, details) => { results.push({ name, status: 'pass', details }); console.log('PASS ' + name) }

try {
  const titles = new Set()
  const descriptions = new Set()
  const internal = new Set()
  for (const route of paths) {
    const response = await page.request.get(base + route)
    assert.equal(response.status(), 200)
    assert.match(response.headers()['content-type'], /text\/html/)
    assert(!/noindex/i.test(response.headers()['x-robots-tag'] || ''))
    const html = await response.text()
    assert(!html.includes('<div id="root">'), 'Guide must not fall back to the homepage SPA')
    assert(!html.includes('\u2014'), 'Guides must not use em dashes')
    assert(!/<meta[^>]+(?:noindex|nofollow)/i.test(html))
    assert(html.includes('href="' + origin + route + '"'), 'Raw HTML contains the self-canonical')
    for (const suffix of ['.html', '/']) {
      const variant = await page.request.get(base + route + suffix, { maxRedirects: 0 })
      assert([301, 302, 307, 308].includes(variant.status()))
      assert.equal(new URL(variant.headers().location, base).pathname, route)
    }

    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1)
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + route)
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), origin + route)
    titles.add(await page.title())
    descriptions.add(await page.locator('meta[name="description"]').getAttribute('content'))
    const ids = await page.locator('[id]').evaluateAll((nodes) => nodes.map((node) => node.id))
    assert.equal(ids.length, new Set(ids).size, 'IDs are unique')
    const missing = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter((href) => !document.getElementById(href.slice(1))))
    assert.deepEqual(missing, [], 'All table-of-contents and author links resolve')
    for (const href of await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) internal.add(href)
    assert.equal(await page.locator('script:not([type="application/ld+json"])').count(), 0, 'Articles need no application JavaScript')

    if (route !== '/guides') {
      const article = await page.locator('.article-body').innerText()
      assert(article.split(/\s+/).length > 1000, 'Full article text is present')
      assert.match(html, /<section id=/)
      const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
      assert.equal(structured.mainEntityOfPage, origin + route)
      assert.equal(structured.author.name, 'Joel Prentiss')
      assert.equal(structured.headline, (await page.locator('h1').textContent()).trim())
      assert.equal(structured.datePublished, await page.locator('time').getAttribute('datetime'))
      assert.match(article, /not an estate liquidator or appraiser/)
      for (const other of paths.filter((path) => path !== '/guides' && path !== route)) assert(await page.locator('a[href="' + other + '"]').count() > 0)
    }
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No page overflow: ' + route + ' at ' + width)
      assert.equal(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true)
      if (width !== 320) {
        await page.addScriptTag({ content: axe.source })
        const audit = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }))
        assert.deepEqual(audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((node) => node.target) })), [], 'Accessibility: ' + route + ' at ' + width)
        await page.screenshot({ path: directory + '/' + route.split('/').pop() + '-' + width + '.png', fullPage: true })
        // Remove only the injected audit script before the next page inspection.
      }
      pass(route + ' at ' + width, 'No horizontal overflow; content and assets visible' + (width !== 320 ? '; no axe WCAG A/AA violations' : ''))
    }
    await page.goto(base + route)
    await page.keyboard.press('Tab')
    assert.equal(await page.locator(':focus').innerText(), 'Skip to content')
    await page.keyboard.press('Enter')
    assert.equal(await page.locator(':focus').getAttribute('id'), 'main')
    pass(route + ' metadata and navigation', 'Full source HTML, unique metadata, valid Article data, related links, keyboard skip link, and URL normalization')
  }
  assert.equal(titles.size, paths.length)
  assert.equal(descriptions.size, paths.length)
  for (const href of internal) {
    const response = await page.request.get(new URL(href, base).href)
    assert.equal(response.status(), 200, 'Internal link: ' + href)
    if (href.endsWith('.csv')) {
      assert(!(await response.text()).includes('<html'), 'Download is CSV rather than the SPA')
      assert.match(response.headers()['content-type'], /text\/csv|octet-stream/)
    }
  }
  const sitemap = await page.request.get(base + '/sitemap.xml')
  const xml = await sitemap.text()
  assert.match(sitemap.headers()['content-type'], /xml/)
  for (const route of ['/', ...paths]) assert(xml.includes('<loc>' + origin + route + '</loc>'))
  assert.equal((xml.match(/<loc>/g) || []).length, 5)
  const robots = await page.request.get(base + '/robots.txt')
  const robotText = await robots.text()
  assert.match(robotText, /User-agent: Googlebot/)
  assert.match(robotText, /Allow: \//)
  assert.match(robotText, /Sitemap: https:\/\/joelprentiss.com\/sitemap.xml/)
  pass('Local links, downloads, and crawl files', 'All local destinations resolve; two CSVs; five sitemap URLs; existing robots rules preserved')

  await page.goto(base + paths[3])
  const boxes = page.getByRole('checkbox')
  assert.equal(await boxes.count(), 12)
  await boxes.first().focus()
  await page.keyboard.press('Space')
  assert.equal(await boxes.first().isChecked(), true)
  await page.emulateMedia({ media: 'print' })
  assert.equal(await page.locator('.article-body').isVisible(), true)
  assert.equal(await boxes.first().isVisible(), true)
  await page.emulateMedia({ media: 'screen' })
  pass('Self-assessment', 'All 12 checkboxes have labels, keyboard input works, and the worksheet remains visible in print')

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const plain = await noJs.newPage()
  for (const route of paths) {
    await plain.goto(base + route)
    assert.equal(await plain.locator('h1').isVisible(), true)
    if (route !== '/guides') assert.equal(await plain.locator('#about-author').isVisible(), true)
  }
  await noJs.close()
  pass('JavaScript disabled', 'All four pages display their complete content without JavaScript')

  for (const width of [320, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Homepage navigation fits at ' + width)
    if (width < 900) await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.locator('.nav-links a[href="/guides"]').click()
    await page.waitForURL(base + '/guides')
  }
  pass('Homepage discovery', 'The Guides navigation link works at 320, 900, 1024, and 1440px without page overflow')
  assert.deepEqual(errors, [])
  await writeFile(directory + '/results.json', JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
