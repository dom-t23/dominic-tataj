# Reviewer brief: sections 1–3 of Dom's design-review prompt (verbatim)

## 1. Context

- **Repo:** `dom-t23/dominic-tataj`. **Live:** https://dom-t23.github.io/dominic-tataj/
- **Stack:** static and build-free. GitHub Pages serves `main` as it is: `index.html`,
  `css/site.css`, ES modules in `js/`, three.js vendored in `vendor/three/`. Read `README.md`
  first for the module map.
- **Note:** `IMPROVEMENTS.md` still says the site targets mechanical roles first. That's out of
  date. Section 2 below is the current targeting, and Phase 0 step 6 updates the file.
- **History you must read before judging anything:** `DESIGN_PLAN.md` (including **Phase R**,
  the "smooth layered panels" redesign from 20 Nov 2026) and `IMPROVEMENTS.md`. They record
  decisions I've already made, and you shouldn't reopen them without a reason.
- **Tests:** Playwright. `npm install && npx playwright install chromium`, then `npm test`
  (assertions) and `npm run screens` (review screenshots in `test-results/screens/`). The
  config serves the folder on `127.0.0.1:4173`.
- **Me:** Dom, 2nd-year MEng Mechanical Engineering at UCL. My direction has shifted towards
  **software, autonomy and systems roles, particularly in UK defence**. Mechanical design
  should still read as a credible strength.

## 2. Who the site is for (optimise in this order)

1. **Engineering recruiters and early-careers teams** at UK defence and autonomy companies
   (primes and startups) and at software firms. They give it about 30 seconds, often on a phone
   from a LinkedIn link. In that time they must learn who I am, which roles I want, when I'm
   available, that I have the right to work in the UK, why I'm worth an interview, and how to
   contact me or get my CV.
2. **Engineers and hiring managers** who read the detail. They want method, ownership, real
   results, evidence of testing, and honesty about limitations.
3. **Photography**, which is a secondary strength. It stays in About as the film strip and
   must never compete with the engineering work.

The standard to hit: **a recruiter remembers the site a week later and an engineer respects
it.** Professional first, delight second, and never at the expense of reading speed.

## 3. Constraints

**Hard (don't break these):**
- Stay build-free with no framework. Vanilla HTML, CSS and JS modules only. Don't add
  dependencies to the shipped site.
- **Never push to or merge into `main`**, because that deploys live. Work on a new branch
  `claude/design-review` and open a PR when you're done (see section 9).
- Don't invent facts. Every claim, number, result, date and role must already be in the repo
  or its data files. If the design needs content that doesn't exist (a CV link, a photo, a
  metric), put in a clearly marked placeholder or leave the element out, and list it under
  **Needed from Dom**.
- Phase R decisions stay: light theme first, with dark only through the toggle; no return to
  the engineering-drawing or "drawing set" identity (no revision clouds, title blocks or sheet
  numbers); keep the crosshair cursor and the film-strip photos; no sound.
- Keep the quality gates in `DESIGN_PLAN.md` §5: every animation carries information about my
  work, content is readable at frame 0, full `prefers-reduced-motion` fallbacks, light and dark
  parity from tokens, keyboard operable, no horizontal scroll on phones, the performance budget
  in §0.3 passes, and rAF loops pause off screen.
- All existing tests pass at the end. Update tests that a deliberate change breaks, and add
  tests for new behaviour.

**Open (you may change these, with justification):** layout, section order, visual hierarchy,
type scale and font choices (keep a geometric or modern sans for headings), colour palette and
accent use, component styling, spacing system, copy, nav, the hero composition, and which
interactive figures sit where, including demoting or simplifying a figure if it hurts the
30-second read. **A bigger redesign is allowed** if the audit shows the current direction is
the problem (see Phase 3).

---

