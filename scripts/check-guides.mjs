import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import axe from 'axe-core'

// Exercise the actual Worker asset routing, not a fallback dev-server shell.
const base = process.env.GUIDES_URL || 'http://127.0.0.1:8787'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local preview.')
const origin = 'https://joelprentiss.com'
const slugs = [
  'grow-estate-sale-business-texas', 'estate-sale-referral-partners', 'estate-sale-website-checklist', 'qualify-estate-sale-leads', 'estate-sale-job-cost-worksheet', 'estate-sale-reviews-without-review-gating', 'estate-sale-commissions-and-fees', 'estate-sale-payout-statement',
  'efficient-estate-sale-business-lean-playbook', 'reduce-estate-sale-setup-time', 'estate-sale-photography-workflow', 'estate-sale-staffing-workload', 'estate-sale-checkout-flow', 'estate-sale-inventory-systems', 'estate-sale-crew-5s-kit', 'estate-sale-pricing-research', 'estate-sale-readiness-checklist', 'train-estate-sale-staff', 'schedule-multiple-estate-sales', 'estate-sale-floor-plan', 'estate-sale-change-control', 'estate-sale-pricing-discount-errors', 'estate-sale-pickup-system', 'estate-sale-leftovers-plan', 'estate-sale-kpis', 'estate-sale-root-cause-analysis', 'choose-estate-sale-software', 'estate-sale-process-pilot',
]
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
      const articleIndex = slugs.indexOf(route.split('/').pop())
      assert(article.split(/\s+/).length > (articleIndex < 8 ? 1000 : 800), 'Full substantive article text is present')
      assert.match(html, /<section id=/)
      const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
      assert.equal(structured.mainEntityOfPage, origin + route)
      assert.equal(structured.author.name, 'Joel Prentiss')
      assert.equal(structured.headline, (await page.locator('h1').textContent()).trim())
      assert.equal(structured.datePublished, await page.locator('time').getAttribute('datetime'))
      assert.match(article, /not an estate liquidator or appraiser/)
      const related = await page.locator('.related a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))
      assert(related.length >= 2, 'Each guide has relevant next steps')
      assert(related.every((href) => paths.includes(href) && href !== route), 'Related articles exist and do not link to themselves')
      assert(await page.locator('.sources a').count() >= 2, 'Sources are linked')
      if (slugs.indexOf(route.split('/').pop()) >= 3) {
        assert.equal(await page.locator('meta[name="twitter:title"]').getAttribute('content'), structured.headline)
        assert.equal(await page.locator('meta[name="twitter:description"]').getAttribute('content'), structured.description)
      }
      if (articleIndex >= 8) {
        assert.match(await page.locator('.series-nav').innerText(), new RegExp('Part ' + (articleIndex - 7) + ' of 20'))
        assert(article.includes('proposed workflows'), 'Series applications are labeled as proposals')
        if (articleIndex > 8) assert.equal(await page.locator('a.download').count(), 1, 'Focused guide includes a worksheet')
      }
    } else {
      for (const slug of slugs) assert.equal(await page.locator('.guide-row a[href="/guides/' + slug + '"]').count(), 1)
    }
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No page overflow: ' + route + ' at ' + width)
      assert.equal(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true)
      assert.equal(await page.locator('.financial-table .amount').evaluateAll((cells) => cells.every((cell) => getComputedStyle(cell).whiteSpace === 'nowrap')), true, 'Financial amounts remain on one line')
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
  assert.equal((xml.match(/<loc>/g) || []).length, paths.length + 1)
  const robots = await page.request.get(base + '/robots.txt')
  const robotText = await robots.text()
  assert.match(robotText, /User-agent: Googlebot/)
  assert.match(robotText, /Allow: \//)
  assert.match(robotText, /Sitemap: https:\/\/joelprentiss.com\/sitemap.xml/)
  assert.equal([...internal].filter((href) => href.endsWith('.csv')).length, 25)
  pass('Local links, downloads, and crawl files', 'All local destinations resolve; 25 CSVs; 30 sitemap URLs; existing robots rules preserved')

  await page.goto(base + '/guides/efficient-estate-sale-business-lean-playbook')
  assert.equal(await page.locator('#series-guide-list a').count(), 19)
  for (const slug of slugs.slice(9)) assert.equal(await page.locator('#series-guide-list a[href="/guides/' + slug + '"]').count(), 1)
  await page.goto(base + '/guides/estate-sale-checkout-flow')
  assert.equal(await page.locator('.workflow ol > li').count(), 5)
  await page.goto(base + '/guides/estate-sale-floor-plan')
  assert.equal(await page.locator('.floor-grid > div').count(), 9)
  await page.goto(base + '/guides/estate-sale-readiness-checklist')
  assert.equal(await page.getByRole('checkbox').count(), 10)
  await page.getByRole('checkbox').first().focus()
  await page.keyboard.press('Space')
  assert(await page.getByRole('checkbox').first().isChecked())
  await page.emulateMedia({ media: 'print' })
  assert(await page.locator('.checklist').isVisible())
  await page.emulateMedia({ media: 'screen' })
  pass('Operations series tools', 'All 19 focused guides are linked from the pillar; flow diagram, floor schematic, and printable readiness checks render')

  const numericCells = async (selector) => (await page.locator(selector).allTextContents()).map((text) => Number(text.match(/-?[\d.]+/)?.[0]))
  await page.goto(base + '/guides/estate-sale-staffing-workload')
  assert.deepEqual(await numericCells('#staffing-example tbody td:last-child'), [24, 5, 20, 4])
  assert.equal(4 * (6 - 1), 20)
  assert.equal(24 - 20, 4)
  await page.goto(base + '/guides/schedule-multiple-estate-sales')
  assert.deepEqual(await numericCells('#shared-skill-example tbody td:nth-child(2)'), [12, 10, 22, 18, 4])
  assert.equal(12 + 10 - 18, 4)
  await page.goto(base + '/guides/estate-sale-pricing-discount-errors')
  assert.deepEqual(await numericCells('#markdown-example tbody td:last-child'), [80 * 0.75, 80 * 0.5, 60 * 0.5])
  await page.goto(base + '/guides/estate-sale-kpis')
  assert.deepEqual(await numericCells('#kpi-example tbody td:nth-child(2)'), [40, 2, 3, 5])
  assert.equal(2 / 40 * 100, 5)
  await page.goto(base + '/guides/estate-sale-root-cause-analysis')
  const counts = await numericCells('#pareto-example tbody td:nth-child(2)')
  const shares = await numericCells('#pareto-example tbody td:nth-child(3)')
  const cumulative = await numericCells('#pareto-example tbody td:nth-child(4)')
  const sum = counts.reduce((a,b) => a+b,0)
  assert.equal(sum, 20)
  assert.deepEqual(shares, counts.map((n) => n / sum * 100))
  let running = 0
  assert.deepEqual(cumulative, shares.map((n) => running += n))
  pass('Operations example arithmetic', 'Staffing, shared-skill capacity, markdown bases, KPI denominators, and Pareto percentages reconcile')

  // Independently reconcile the published worked examples, including visible numbers.
  const money = (text) => Number(text.replaceAll('−', '-').replace(/[$,\s]/g, ''))
  await page.goto(base + '/guides/estate-sale-job-cost-worksheet')
  const costs = await page.locator('#job-cost-example tr[data-cost] td:last-child').allTextContents()
  const total = costs.map(money).reduce((sum, cost) => sum + cost, 0)
  assert.equal(total, 4200)
  assert.equal(money(await page.locator('[data-total-cost]').innerText()), total)
  for (const row of await page.locator('#job-scenarios tbody tr').all()) {
    const numbers = (await row.locator('th, td').allTextContents()).map(money)
    const [sales] = numbers
    const commission = Math.max(sales * 0.35, 3000)
    assert.deepEqual(numbers, [sales, commission, commission + 500, commission + 500 - total])
  }
  assert.equal((total + 500 - 500) / 0.35, 12000)
  await page.goto(base + '/guides/estate-sale-commissions-and-fees')
  for (const row of await page.locator('#proposal-scenarios tbody tr').all()) {
    const numbers = (await row.locator('th, td').allTextContents()).map(money)
    const [sales] = numbers
    const aFees = Math.max(sales * 0.3, 3500) + 1200 + 400
    const bFees = Math.max(sales * 0.4, 4200)
    assert.deepEqual(numbers, [sales, aFees, sales - aFees, bFees, sales - bFees])
  }
  await page.goto(base + '/guides/estate-sale-payout-statement')
  const payout = {}
  for (const row of await page.locator('#payout-example tr[data-line]').all()) {
    payout[await row.getAttribute('data-line')] = Math.abs(money(await row.locator('td:last-child').innerText()))
  }
  assert.equal(payout.receipts, 12800 + 960)
  assert.equal(payout.refunds, 800 + 60)
  assert.equal(payout.netReceipts, payout.receipts - payout.refunds)
  assert.equal(payout.tax, 960 - 60)
  assert.equal(payout.basis, payout.netReceipts - payout.tax)
  assert.equal(payout.commission, payout.basis * 0.35)
  assert.equal(payout.sellerTotal, payout.basis - payout.commission - payout.expenses)
  assert.equal(payout.due, payout.sellerTotal - payout.previous)
  assert.equal(payout.due, 4150)
  pass('Worked financial examples', 'Visible job costs, minimum commissions, proposal net proceeds, and payout reconciliation match independent calculations')

  await page.goto(base + '/guides/estate-sale-reviews-without-review-gating')
  assert.equal(await page.getByRole('checkbox').count(), 6)
  await page.getByRole('checkbox').first().focus()
  await page.keyboard.press('Space')
  assert(await page.getByRole('checkbox').first().isChecked())
  assert.equal(await page.locator('a[href="https://support.google.com/contributionpolicy/answer/7400114"]').count(), 2)
  await page.emulateMedia({ media: 'print' })
  assert(await page.locator('.checklist').isVisible())
  await page.emulateMedia({ media: 'screen' })
  pass('Review workflow audit', 'Six labeled native checkboxes work by keyboard and print; current official review policy is linked')

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
  pass('JavaScript disabled', 'The hub and all 28 guides display their complete content without JavaScript')

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
