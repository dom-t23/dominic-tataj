# Verification round 2: independent verifier

Date: 21 Nov 2026. Branch `claude/design-review`, served by `tests/serve.cjs` on 127.0.0.1:4173 (gzips like GitHub Pages).

## Method

- **Inputs used:** `review/BRIEF.md` (sections 1 to 3), the live branch, `review/after/` (NOTES.md, metrics.json, the fold shots, all 22 `scroll/phone-light-*` screens, some laptop scroll screens and dark full-page parts), the site's own `index.html`, `css/site.css` and `js/sheets.js`, and `og-image.png`. I didn't open REVIEW.md, DESIGN_PLAN.md, IMPROVEMENTS.md, review/findings, review/directions, review/baseline, review/verify (except to write this file), the other review/scratch folders, or the git log or diff.
- **Scripts:** in `review/scratch/verifier-2/`. They are `axe.cjs`, `contrast.cjs` (contrast computed against the resolved background, including opacity), `manual.cjs` (keyboard path, headings, landmarks, phone target sizes, 320 px reflow, reduced motion, frame-0 text), `focus2.cjs` (whether focus is visible after scrolling settles), `perf.cjs`, `cls*.cjs` (layout-shift sources) and `reflow.cjs`. Focus and reflow screenshots are in `review/scratch/verifier-2/shots/`.
- **Browser:** Playwright Chromium with SwiftShader WebGL, one browser at a time. The phone runs use the iPhone 13 preset from `tests/helpers.js` (390×664 CSS), except where 375×812 or 320×640 is stated.

## A. Recruiter panel

### What LinkedIn shows

- `<title>`: "Dominic Tataj · Engineering portfolio: software, autonomy and systems"
- `og:title`: "Dominic Tataj, engineering portfolio: software, autonomy and systems"
- `og:description`: "MEng Mechanical Engineering at UCL. Looking for software, autonomy and systems roles: a summer 2027 internship or a 2027–28 placement year in the UK. Projects: vision-based autonomous drone racing, a generatively designed drone frame, a pipe-climbing robot."
- `og-image.png`: 1200×630, 80 KB. The left half shows the name, "Software, autonomy and systems", "MEng Mechanical Engineering, UCL", **Looking for:** "Summer 2027 internship or 2027–28 placement year" and **Right to work:** "Full right to work in the UK". The right half shows "Projects and results": E-04 98.6%, E-03 246 g, E-02 Climbed, E-01 P ∝ N^0.55, plus the URL. The image stays legible at LinkedIn's card size, and it answers who Dom is, what he wants and right to work before anyone clicks. It doesn't give the start date (27 June 2027). That's minor.

### 10-second test (phone-light-fold.png only)

The fold shows the name in very large type, "Software, autonomy and systems / MEng, UCL", and a key-value table: Looking for, Available, Right to work, Based, Degree and Email. Below it are **Email me** (filled), **LinkedIn ↗** and **GitHub ↗**, then the start of the lede ("…particularly in UK defence…").

| | Early-careers recruiter, UK defence prime | Engineering manager, UK autonomy/defence startup | Graduate recruiter, software firm |
|---|---|---|---|
| Who | "Dominic Tataj, MEng student at UCL, software/autonomy/systems." | Same, plus "second year, graduating 2029, predicted 2:1." | "Engineering student at UCL heading for software." |
| Roles wanted | "Summer 2027 internship or 2027–28 placement year, and the lede says UK defence. That's us." | "Autonomy and systems placement. Fits." | "Software is first in the list. It's a mech-eng degree, though." |
| When | "From 27 June 2027." | Same | Same |
| Right to work | "Full right to work in the UK. It doesn't say whether he's eligible for security clearance, which I'd need to ask." | "Fine." | "No sponsorship needed." |
| Contact or CV | "Email is on screen, plus a big Email me button and LinkedIn. **No CV.**" | "Email and GitHub. Good enough." | "Email, LinkedIn and GitHub. I'd want a CV to forward." |

**Verdict: PASS.** All three readers can say who Dom is, which roles he wants, when he's available and that he has the right to work, and they can see how to reach him, all within the first screen. The only gap is the CV, which only Dom can supply. Clearance eligibility comes up for the defence prime. That's also Dom's call.

### 30-second test (scroll/phone-light-00 to 21)

- **Defence prime recruiter.** *Remembers:* "The drone that flies through gates by camera with no GPS, 98.6% of gates; a 246 g drone under the CAA's limit; a pipe-climbing robot at an IMechE challenge; a NASA Space Center University placing." *Would click:* Email me, and possibly the E-04 row in "Projects and results". *Confusing:* "Fig. 00" and the "E-04" codes mean nothing to a recruiter, but they don't get in the way. *Shortlist:* **Yes**, for an autonomy or systems placement, pending a CV and a clearance check.
- **Startup engineering manager.** *Remembers:* "Solo project with an error-state Kalman filter, solvePnP, chi-squared outlier gating, a seeded regression harness and pooled acceptance over 300 courses. He's honest about failures (course 3) and limitations (R² 0.44, the coarse Euler step)." *Would click:* the replay ("Load replay"), the Fig. 01 table and the GitHub repo. *Confusing:* "Most of the code was written by an AI coding agent (Claude)". It's honest and they respect it, but it moves the evaluation onto system design and judgement rather than implementation. *Shortlist:* **Yes**, to talk about estimation and test design.
- **Software graduate recruiter.** *Remembers:* "Python/OpenCV drone project; lots of mechanical work; strong numbers." *Would click:* GitHub. *Confusing:* the degree is mechanical, and the only software project discloses AI-written code, so the evidence of hands-on coding is thin. *Shortlist:* **Maybe.** It hinges on GitHub and a CV.

## B. Accessibility (WCAG 2.2 AA)

### axe-core (wcag2a, wcag2aa, wcag21aa, wcag22aa), after a full scroll so lazy content is present

| Config | Violations | Incomplete (needs review) |
|---|---|---|
| 1440×900 light | **0** | color-contrast 153, th-has-data-cells 1 |
| 1440×900 dark | **0** | color-contrast 170, th-has-data-cells 1 |
| 375×812 light (phone preset) | **0** | color-contrast 148, th-has-data-cells 1 |
| 375×812 dark | **0** | color-contrast 148, th-has-data-cells 1 |

To resolve the incomplete colour-contrast items, I computed contrast for every visible text node against its resolved background, including inherited opacity (`contrast.cjs`). The results:

- **Light:** one real failure. The current-step number in Fig. 02's step buttons ("01 / 02 / 03 Assembly / Exploded / Frame only", `figure#frame3d .f3-steps button[aria-current] span`) is `#FF4F00` on `#F7F6F3` at 11 px, which gives **3.05:1** (4.5 needed). The Play button and the replay clock come out at 3.5:1, but they're half-opacity while `aria-disabled` before the replay loads, so they're exempt. Two SVG labels in Fig. 03 at opacity 0 are hidden, so they don't count either.
- **Dark:** no real failures.

### Manual checks

- **Keyboard path (laptop):** Skip link → brand → Work → About → Contact → theme toggle ("Switch to dark theme") → hero email → Email me → LinkedIn → GitHub → E-04 link in the Fig. 00 caption → Replay → Try the hover controller → the four register rows → E-04 code link → Load replay → Play → Flight time slider → Fig. 01 column headers → GitHub link → Fig. 02 steps → parts list rows → Fig. 04 sliders. The order is logical and nothing traps focus. Every stop shows a **2 px solid ink outline**. Screenshots: `shots/focus-laptop-*.png`, `focus2-laptop-18.png` (Load replay) and `focus-phone-*.png`. After scrolling settles, **no stop is off screen or hidden under the sticky nav** (`focus2.cjs`, laptop and phone, 45 stops each).
- **Skip link:** first Tab stop, visible at the top left, and it targets `main#top`. The next Tab after using it lands on the hero email, so the nav is skipped. Pass.
- **Headings:** h1 (name + role) → h2 Projects and results → h2 Projects (visually hidden) → h3 for each project → h4 Approach, How it was built, Testing and so on → h2 About → h3 Outside engineering → h2 Contact. No levels are skipped. Landmarks: nav "Main", main, header, labelled sections, two labelled horizontal-scroll regions, footer. Pass.
- **Reflow at 320 px:** `scrollWidth` 320 = `clientWidth`, and `scrollTo(500, y)` leaves `scrollX` at 0. No element pokes past the viewport outside a deliberate scroll container (Fig. 05 and the contact sheet scroll sideways and have labels). Screenshots `shots/reflow2-320-*.png`. Pass.
- **Target size (phone):** 63 targets. 12 are under 24 px on one side: brand link 15 px tall, inline email and E-04 links, Replay and Try the hover controller at 20 px, the Flight time and Fig. 04 sliders at 16 px, and a 22 px Fig. 01 header button. **All 12 meet the 2.5.8 spacing exception** (no other target within the 24 px circle), so this passes. The 20 px caption links are still small for thumbs.
- **Reduced motion:** with `reducedMotion: reduce`, no text is faded or hidden at load or after a fast scroll. The phone-light-reduced shots match. The only running animations are CSS transitions. Pass.
- **Frame 0 under normal motion:** scrolling in 700 px steps with one frame of wait, no text arrives below 0.9 opacity, so there's no reveal fade. Pass.

## C. Performance and SEO

Phone: iPhone 13 preset, CDP 150 ms latency, 1.6 Mbps down / 750 kbps up, CPU ×4, cache disabled, three fresh runs.

| Measure | Run 1 | Run 2 | Run 3 | **Median** | Budget | Result |
|---|---|---|---|---|---|---|
| First contentful paint | 1056 ms | 960 ms | 984 ms | **984 ms** | 1200 ms | Pass |
| LCP (element: `h1` name span) | 1056 | 960 | 984 | **984 ms** | n/a | Good |
| DOMContentLoaded / load | 1118 / 1496 | 1029 / 1501 | 1054 / 1459 | 1054 / 1496 ms | n/a | n/a |
| CLS, load | 0.0018 | 0.0018 | 0.0018 | 0.0018 | 0.1 | Pass |
| CLS after full scroll (300 px every 120 ms, throttled) | 0.0018 | 0.0018 | 0.0018 | 0.0018 | 0.1 | Pass |
| Requests before load | 19 | 19 | 19 | 19 | n/a | n/a |
| **First-load JS, gzip on the wire (12 files)** | 21.4 KB | 21.4 | 21.4 | **21.4 KB** | 60 KB | Pass |
| CSS / HTML / fonts, gzip | 14.8 / 14.6 / 147.8 KB | n/a | n/a | n/a | n/a | Fonts are 74% of first load |
| Total before load | 198.6 KB | n/a | n/a | n/a | n/a | n/a |
| Desktop 1440×900, unthrottled | FCP 312 ms, LCP 312 ms | n/a | n/a | n/a | n/a | n/a |

First-load JS files (gzip KB): hero-flight 5.5, replay 4.5, motion 3.1, contact 2.0, frame3d-boot 1.3, theme 1.1, flights 0.8, reveals 0.8, sheets 0.8, main 0.6, util 0.5, rig-button 0.5.

**CLS while scrolling, by method:**

| Method | Result |
|---|---|
| Laptop, mouse wheel (100 px every 30 ms) | 0.0014 |
| Laptop, CDP scroll gesture | 0 |
| Phone, CDP scroll gesture | 0 |
| Phone, throttled runs | 0.0018 |
| **Instant `scrollTo` jumps, unthrottled** (400 px every 100 ms on laptop, 300 px every 120 ms on phone) | **Intermittent.** Laptop gave 0.64, 0.03, 0.64 and 0 in four runs. Phone gave 0.90, 0.14, 0 and 0. Tablet 820×1180 gave 1.0 once. |

The source in every case was `.sheet-body` or `.sheet-meta` of the *next* project moving into view (E-03 on laptop, E-02 on phone). A `ResizeObserver` showed `#e-02` and its `#climb-fig` resizing in the same frame. This matches `.sheet { content-visibility: auto; contain-intrinsic-size: auto 1400px }` laying a sheet out late. Normal wheel or touch scrolling doesn't reproduce it, and with screenshots slowing the loop it never fired. So the field impact is probably small, but the lab measure isn't stable.

**Metadata:**
- Pass: `lang="en-GB"`, title, meta description (about 155 characters), canonical, SVG favicon and apple-touch-icon.
- Pass: `theme-color` `#F7F6F3`, switched to `#0E1012` by the pre-paint script when the saved theme is dark.
- Pass: full OG set with image width, height, alt, locale and site_name; `twitter:card` summary_large_image (title and description fall back to OG); og-image 1200×630 and legible.
- Pass: JSON-LD `ProfilePage` → `Person` with jobTitle, description, alumniOf UCL, address London/GB, knowsAbout and sameAs (LinkedIn, GitHub, Unsplash).
- No robots.txt or sitemap checked. That's not needed for a one-page site.

## D. Rescoring (1 to 10, from what a visitor gets now)

| Reviewer | Dimension | Score | Why |
|---|---|---|---|
| recruiter | 10-second clarity | 9 | The fold answers who, roles, when, right to work, location and contact in one table |
| recruiter | 30-second skim | 8 | The register with one headline number per project sits right under the hero; 22 phone screens in all, but the skim path is in the first three |
| recruiter | CTA and CV findability | 7 | Email me, LinkedIn and GitHub sit on the fold and again in Contact, with Copy email; there's no CV anywhere |
| recruiter | Fit for defence/autonomy recruiters | 8 | "Particularly in UK defence", and the lead project is vision-based autonomy; no clearance-eligibility line |
| recruiter | Fit for software recruiters | 7 | Python/OpenCV skills are listed, but the degree is mechanical and the main software project discloses AI-written code |
| recruiter | Memorability | 7 | The animated flight trace and the "no GPS or map" drone stick; the overall look is clean rather than unforgettable |
| hiring-engineer | Ownership clarity | 9 | Role line on every project ("Solo; set the design and test rules, directed an AI coding agent", "Team of 6 · model and CAD") |
| hiring-engineer | Quantified results | 9 | Pooled pass rates with a per-set table, 246 g against 250 g, 18% FEA agreement, 22% predicted against 16% measured, R² 0.44 |
| hiring-engineer | Method, testing and limitations | 9 | ESKF, solvePnP IPPE_SQUARE, chi-squared gating, seeded A/B harness; explicit limitations and a failure case |
| hiring-engineer | Value of the interactive figures | 8 | The replay, pipeline strip, sortable result table and climb simulator all carry data; the replay needs a click before it plays |
| hiring-engineer | Project ordering for target roles | 9 | Autonomy first, mechanical second and third, analysis last; newest first matches the target |
| hiring-engineer | Technical credibility | 8 | Honest and specific; credibility would rise with repo evidence of hand-written code and hardware photos |
| visual-design | Typography | 8 | Wide Archivo display with Plex Sans and Mono reads well; tight-tracked mono numerals render as "99 . 8%" |
| visual-design | Grid and alignment | 8 | 12-column sheets with a sticky meta column on desktop; a clean single column on phone |
| visual-design | Spacing system | 8 | Consistent rhythm; a few long empty stretches (after the contact sheet, around the pinned Fig. 02) |
| visual-design | Colour and contrast | 8 | Restrained ink and paper with one orange accent and a semantic blue; one 3:1 orange numeral |
| visual-design | Hierarchy | 9 | Name, then the role table, then CTAs, then the register; each project goes title, lede, key numbers, figure, method |
| visual-design | Component consistency | 7 | Several panel treatments (shadowed card, bordered figure, segmented control, step tabs) and mixed numeral styling |
| visual-design | Depth and elevation | 7 | Soft shadow on the Fig. 00 and replay panels; otherwise flat. Coherent but thin |
| visual-design | Imagery | 7 | Line-art CAD renders, simulator frames and real photographs in the film strip; no hardware photos |
| visual-design | Dark theme | 8 | Full parity from tokens; the charts and replay hold up |
| visual-design | Distinctiveness and premium feel | 7 | Polished and engineered; the identity comes from content more than form |
| visual-design | OVERALL | 8 | A professional, calm, readable system with a few rough edges |
| interaction-motion | Purposefulness | 8 | Every animation shows data (flight trace, estimate error, climb) |
| interaction-motion | Smoothness | 7 | Fine in lab runs; judged under SwiftShader, so not fully assessable |
| interaction-motion | Discoverability | 7 | Captions say what to do ("Drag to turn it", "Select a column header"); the replay is gated behind Load replay |
| interaction-motion | Interruptibility and control | 8 | Replay, Play and a scrubber; step tabs on Fig. 02; Reset on the climb simulator |
| interaction-motion | Reduced-motion fallbacks | 9 | Content complete at load with no fades |
| interaction-motion | Touch behaviour | 7 | Works; some 16 to 20 px controls (sliders, caption links) are small for thumbs |
| interaction-motion | Scroll-linked effects | 7 | Pinned Fig. 02 on wide screens is good; intermittent content-visibility shift on fast jumps |
| interaction-motion | Cursor and micro-interactions | 7 | Clear focus and hover states; the "Type FPV" easter egg is fun but invisible to most visitors |
| accessibility | Contrast (light) | 8 | axe clean; one 3.05:1 step numeral in Fig. 02 |
| accessibility | Contrast (dark) | 9 | No real failures found |
| accessibility | Keyboard and focus | 9 | Logical order, 2 px outline everywhere, never obscured, working skip link |
| accessibility | Semantics, landmarks and headings | 9 | Clean h1–h4 outline, labelled regions, `aria-current` on steps |
| accessibility | Alternatives for non-text content | 8 | Figures have captions and labelled SVGs; the replay is backed by a text results table |
| accessibility | Target size | 8 | Passes 2.5.8 through spacing; several targets under 24 px |
| accessibility | Reflow and zoom | 9 | No sideways scroll at 320 px; wide figures scroll inside labelled regions |
| accessibility | Motion and reduced motion | 9 | Full fallback; nothing hidden at frame 0 |
| performance-seo | First-load weight | 8 | 199 KB in all, 21 KB of JS; fonts are 148 KB of it |
| performance-seo | LCP | 9 | 984 ms median on a throttled phone |
| performance-seo | CLS | 8 | 0.002 in normal use; unstable under instant scroll jumps |
| performance-seo | Font loading | 7 | Third-party Google Fonts, 90 KB Archivo variable file; display=swap gives a small 0.001 shift at load |
| performance-seo | Images | 8 | No image on the critical path; photos and models load lazily |
| performance-seo | Lazy-loading and main thread | 8 | Heavy modules deferred (684 KB only after a full scroll); content-visibility used, though it causes the jump artefact |
| performance-seo | Metadata and SEO | 9 | Title, description, canonical, lang and theme-color all right |
| performance-seo | Social cards | 9 | The OG image works as a recruiter card in its own right |
| performance-seo | Structured data | 9 | ProfilePage + Person with sameAs |
| copy | Headline and first impression | 9 | Name plus "Software, autonomy and systems · MEng, UCL" |
| copy | Role and target clarity | 9 | Explicit role types, timing and sector |
| copy | Availability and logistics | 9 | Date, right to work, location; repeated in Contact |
| copy | Project titles and summaries | 8 | Plain-English titles with a result; the E-02 register line "from more than 20 simulated" trails off |
| copy | Scanability | 8 | Key-figure blocks and h4s help; the E-04 Testing paragraphs are long on a phone |
| copy | Voice and consistency | 9 | First person, precise, honest about limits |
| copy | UK spelling and mechanics | 9 | Coloured, modelled, centre; en dashes in ranges |
| copy | Microcopy and CTAs | 8 | "Email me", "Copy email", "Reset to team's setup" are clear; "Fig. 00" and "E-04" are jargon to recruiters but harmless |
| benchmark | Memorability | 7 | Below bps.space and ciechanow.ski; on a par with good student portfolios |
| benchmark | 10-second clarity | 9 | Clearer than most of the benchmarks for a recruiter |
| benchmark | Craft | 8 | Data figures are built with care; short of ciechanow.ski or rauno.me polish |
| benchmark | Proof of work | 8 | Strong quantified evidence; lacks hardware photos and video that henryburon.github.io has |
| benchmark | Credibility for engineering hiring | 8 | Method and limitations are at a level few student sites reach |
| benchmark | Distinctiveness | 6 | Tasteful neutral system; doesn't yet have a signature look |

**Overall by reviewer:** recruiter 8, hiring-engineer 9, visual-design 8, interaction-motion 7, accessibility 9, performance-seo 8, copy 9, benchmark 7.

## E. Remaining issues

### P0 (broken, or blocks the 30-second read)

None found.

### P1 (clearly hurts)

None found. The fold, the skim path, contact, accessibility, the FCP and JS budgets, and the metadata all hold up under independent measurement.

### P2 (worth fixing, not blocking)

1. **Intermittent large CLS on fast scroll jumps.**
   - *Where:* `.sheet { content-visibility: auto; contain-intrinsic-size: auto 1400px }` (`css/site.css` line 313), with E-03 on laptop and E-02 on phone.
   - *Evidence:* `cls.cjs` and `cls3.cjs` gave 0.64 (laptop), 0.90 (phone) and 1.0 (tablet) in some runs and 0 in others. The source is the next `.sheet-body` moving into view. Wheel and gesture scrolling give 0.
   - *Fix:* drop `content-visibility` from the sheets (the first-paint gain is small, since the JS is 21 KB and LCP is the h1), or keep it only on E-01. Alternatively, set `contain-intrinsic-size` per sheet from measured heights.
2. **Fig. 02 current-step numeral fails 1.4.3.**
   - *Where:* `#frame3d .f3-steps button[aria-current] span`.
   - *Evidence:* `#FF4F00` on `#F7F6F3` at 11 px is 3.05:1.
   - *Fix:* use the darker accent text token already used for "01 Detect" and the E-04 register code.
3. **Tight-tracked mono numerals read as "99 . 8%".**
   - *Where:* `.specs .n` (letter-spacing −0.06em on IBM Plex Mono) and the register's big numbers.
   - *Fix:* set letter-spacing to 0 for mono numerals, or set the numbers in the display face with tabular figures.
4. **Fig. 01 headers have duplicate accessible names** ("Camera + IMU" ×2, "Camera only" ×2).
   - *Fix:* add the world to the names, e.g. `aria-label="Clean world, camera + IMU"`.
5. **E-02 register summary trails off.**
   - *Evidence:* "A dynamic model that picked the drivetrain from more than 20 simulated".
   - *Fix:* "…from more than 20 simulated setups".
6. **Small caption controls on phone.** Replay and Try the hover controller are 20 px tall, and the sliders are 16 px. They pass 2.5.8 through spacing.
   - *Fix:* add `min-height: 24px` and padding to the caption link-buttons.

### Needs Dom (content only he can supply)

1. **A CV PDF.** None is linked anywhere. Add a "CV (PDF)" button next to Email me and in Contact.
2. **Security clearance eligibility.** UK defence primes will ask about SC/BPSS eligibility. A line such as "Eligible for SC clearance", if true, would answer it on the fold.
3. **Hardware photos or short video** of the printed E-03 frame, the deflection test and the E-02 robot at the challenge. These would raise proof of work and memorability.
4. **Evidence of hands-on code for software readers.** A file or module in the repo Dom wrote himself, or a sentence naming which parts he wrote, to balance "most of the code was written by an AI coding agent".
5. Optional: the start date (27 June 2027) on the OG image, which currently shows Looking for and Right to work only.
