# Joel Prentiss portfolio

A React 19 + TypeScript portfolio built with Vite and served as static assets by Cloudflare Workers. The redesign is local; deployment configuration is unchanged.

## Local development

Use Node.js 22 or newer (required by the existing Cloudflare tooling).

```sh
npm install
npm run dev -- --host 127.0.0.1
```

The usual local address is http://127.0.0.1:5173.

## Validation

With the local server running:

```sh
npm run lint
npm run build
npm run test:portfolio
```

The browser checks use the existing Playwright dependency and the development-only axe-core accessibility checker. If Chromium is unavailable, run `npx playwright install chromium`. To check a different local port, set `PORTFOLIO_URL`. The runner rejects non-local hosts and intercepts every Google Apps Script request, so it never sends a real inquiry.

Checks cover six viewport widths, image loading, anchors and sticky-header offsets, keyboard navigation, mobile navigation, WCAG automated checks, the PDF download, all preserved link destinations, form validation, network errors, pending/duplicate submissions, dispatch, timeout, reduced motion, and animation fallback. Screenshots and machine-readable results are in `artifacts/redesign/`.

`npm run preview` is the existing build-and-Wrangler command. For the production smoke check, the following explicit local command served the build successfully and kept preview state outside the watched asset directory:

```sh
npx wrangler dev --config wrangler.jsonc --assets dist --persist-to node_modules/.cache/portfolio-worker --port 8787 --local
```

The existing `npm run deploy` command publishes the site; it is not part of validation.

## Estate-business guides

The `/guides` index and eight articles are ordinary HTML in `public/guides.html` and `public/guides/*.html`, with shared `public/guides/guides.css`. Vite copies them into the build unchanged. They contain the entire article and metadata without React or JavaScript. Edit the HTML directly; no content generator, CMS, or additional production package is required.

Cloudflare's existing default HTML handling serves the `.html` files at their extensionless canonical URLs and redirects `.html` and trailing-slash variants. Keep article links, self-canonicals, Open Graph URLs, Article data, and `public/sitemap.xml` aligned when changing a URL. Update visible and structured dates only when the content changes. Preserve `public/robots.txt`.

The six blank CSV worksheets contain no client data or automatic formulas. Calculation instructions are labeled; worked monetary examples are explicitly hypothetical. The website and review-process self-assessments use native checkboxes and print styles; they do not save responses or send data. Sources are linked on each article. The writing distinguishes Joel's role as a builder from the services of appraisers and liquidators. The qualification and job-cost articles address owners, while the proposal-comparison and payout articles also help families assess services.

Run `npm run test:guides` against the production-style local Wrangler preview on port 8787 (`GUIDES_URL` can override the local URL). It checks full HTML, metadata, structured data, URL variants, local links, downloads, sitemap and robots, no-JavaScript rendering, keyboard use, three article viewport widths, and axe accessibility checks. It independently reconciles the visible job-cost, commission-comparison, and payout examples, and checks both printable self-assessments. It also checks the homepage Guides link at narrow and intermediate widths. Screenshots and results are written to `artifacts/guides/` and are review evidence, not site assets. The existing `npm run test:portfolio` covers broader homepage behavior.

## Editing content and assets

- `src/data/siteData.ts`: project descriptions, current release labels, credentials, capabilities, and external links.
- `src/App.tsx`: page composition and navigation.
- `src/components/ContactForm.tsx`: contact behavior and the existing Apps Script integration.
- `src/hooks/usePortfolioMotion.ts`: progressive scroll reveals and desktop portrait parallax.
- `src/index.css`: design tokens, responsive layouts, typography, and motion preferences.

The supplied `logo.png` brand sheet is retained. Its large circular monogram was extracted at x=576, y=46, width=384, height=384 without tracing, recoloring, or changing its proportions. PNG assets cover 16/32/48px favicons, the 44–48 CSS pixel header mark, and the 180px touch icon. The dark original background is retained; no transparent version was needed. See `public/brand/README.md`.

Original portrait and project assets remain in place. `public/images/` contains optimized WebP derivatives. The AI demo image is an actual November 7, 2026 browser capture of its linked site; the Trial Born image is existing brand artwork, not an invented app screenshot. Local fonts are retained. No new production or animation dependency was added.

## Contact integration

The endpoint, POST method, `no-cors` mode, `text/plain;charset=utf-8` content type, and the six JSON keys (`name`, `email`, `projectName`, `need`, `details`, `link`) remain intact. Name, email, and message are required. Topic and extra context are optional.

A no-cors response is opaque: the client cannot confirm receipt or see a server-side failure. The confirmation describes dispatch instead of claiming successful delivery. A future verified receipt requires a backend change (for example, a same-origin endpoint that validates and relays the request and returns a real result). That backend change is outside this redesign. No live delivery was tested.

## Motion

Only the portrait layer moves with scroll, by at most 36px across its range. The hook coalesces updates with requestAnimationFrame, uses a passive scroll listener, and avoids React updates during scrolling. It disables parallax on small/coarse-pointer screens and skips nonessential effects on low-concurrency devices. Reveals are observed once and animate only opacity and transform.

Reduced motion immediately removes transforms, reveals all content, and disables smooth scrolling and transitions. Text and controls stay fixed. The default content is visible if the observer is unavailable. There is no scroll hijacking.

## Content to strengthen next

- Short project case studies: the original problem, Joel’s exact role, key decisions, and concrete outcomes supported by evidence.
- Current in-app screenshots for Trial Born and Rephra when appropriate for their release stages.
- A few representative GI Joel videos or partnership examples, with permission and verified results.
- An original vector of the supplied monogram, if available, for future large-format use.
- Updates to release labels when product availability changes.

The public project sites and social links were inspected on November 7, 2026. LinkedIn rejects automated requests, so its existing URL was preserved without claiming a successful profile inspection.
