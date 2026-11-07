# Portfolio redesign contract

Purpose: introduce Joel Prentiss across operations, applied AI, app building, and storytelling, then help visitors inspect actual work and start a conversation.

Primary actions: view selected work and contact Joel. Secondary actions: visit the linked projects, creator channels, professional profiles, and existing October 17, 2026 PDF media kit.

Hierarchy: introduction and portrait → selected work → four capabilities → background and credentials → GI Joel and partnerships → contact.

Direction: editorial, human, confident. Keep the existing near-black, olive, cream, and red; use condensed type selectively, readable DM Sans for most content, fine rules, open layouts, and deliberate changes in section composition. Reuse local fonts, existing icons, and actual imagery.

Reference observations: the deployed page repeats credentials and creator copy, puts projects below lengthy introductory sections, uses the same outlined cards throughout, says three disciplines while listing four, and has a redundant floating Start link. The supplied logo.png is a brand sheet; extract the actual circular monogram without redrawing its shapes. Existing project images and PDF edits are user work and must be retained.

Verified November 7, 2026 by read-only browser visits: Trial Born is usable in the browser with mobile apps coming; Rephra explicitly says in testing and offers a waitlist; Fairhaven has a public website with demonstration designs; Ironclad AI is the existing AI assistant demo, with a revised missed-call/follow-up focus. No claim of customer results, app-store availability, or commercial maturity follows from this inspection.

Viewports: 390x844, 768x1024, 1440x1000. Also stress-check 320px, 1024px, and 1920px widths.

Motion: no new dependency. Use transform/opacity only for restrained reveals and a small, requestAnimationFrame-coalesced portrait parallax on larger, fine-pointer screens. Text and controls stay fixed. Reduced motion disables all movement and smooth scrolling; default content is visible without animation initialization.

Contact: preserve Google Apps Script endpoint, POST, no-cors, text/plain and the six JSON keys. Required name, email, and message; context fields optional. Preserve inputs on errors. Prevent duplicate submissions. Announce validation, pending, dispatched, and failed states. The opaque no-cors response cannot prove delivery; confirmation must explain that limitation. Test by intercepting requests locally only.

State coverage: loading = pending contact request; empty = validation of missing required fields; error = offline/server response when observable; partial = mixed project release states; success = request dispatched (delivery unverified); permission = not applicable, no authentication or permission-gated controls.

No deploy, push, form delivery, or external publication.
