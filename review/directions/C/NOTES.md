# Direction C, "Field notes": prototype notes

Worktree `C:\Users\domin\dt-dir-C`, branch `proto/dir-C`. I served it on 127.0.0.1:4174 for the captures.
- Capture script: `review/scratch/dir-C/capture.cjs`.
- Hover check of the signature: `review/scratch/dir-C/hover.cjs`. Its output is `review/scratch/dir-C/hover-{light,dark}-{fig00,replay}-{truth,est}.png`.

## Starting point

The worktree branched at `113ce5f`. Like B, I first checked out `index.html`, `css/site.css` and `js/` from `claude/design-review` HEAD (`bbb3301`). That brings in the content batches every direction shares:
- the S.1 targeting copy;
- E-04 first, with the figures renumbered in page order;
- honest Fig. 00 and rig captions;
- E-04's key results;
- no count-ups;
- sentence-case figure labels;
- the `mailto:` email, the skip link, and About software-first.

The direction is built on top of those batches. They aren't part of the identity being compared.

## What I built

The page reads as a set of short illustrated essays, in the tradition of Distill. There are:
- no panels, cards, shadows, glows, dot grid or pills;
- serif reading text in a 640 px column, with a margin beside it for notes and captions;
- figures that break out wider than the text;
- journal-style tables (an ink rule above and below, hairlines between).

### Hero

- **h1 (conflict 1).** It is visible: "Dominic Tataj" at display size (Instrument Sans 600, up to 108 px, −0.04 em). Under it, inside the same h1, is the role line "Software, autonomy and systems · MEng, UCL" (copy item 2).
- **Standfirst.** Copy item 1, verbatim, in Source Serif 4.
- **Facts.** A `<dl>` set like a journal byline: an ink rule on top and hairline rows. It reads:
  - Looking for: Summer 2027 internship or 2027–28 placement year
  - Available: From 27 June 2027
  - Based: London
  - Right to work: Full right to work in the UK
  - Degree: Second-year, graduating 2029, predicted 2:1
- **Actions.** "Email me" (`mailto:`) as the one filled button, then LinkedIn ↗ and GitHub ↗ as underlined text links. The CV link is in the markup, commented out (conflict 6).
- **Fig. 00, the opening illustration.** It runs page-wide on a desktop and edge to edge on a phone, with one hairline frame. At 1440 × 900 the first screen holds:
  - the name, role, standfirst, all five facts and the email action;
  - all of Fig. 00 and its caption.

  On a 375 × 812 phone, the first screen holds the name, role, standfirst, facts and email action, and Fig. 00 begins at the foot.
- **Contents.** After Fig. 00 is a list of the four projects with one result each, ruled like a journal's contents page. It is four columns on a desktop and a list on a phone. It replaces the card register.
- **The hero drone drawing (E-03) is removed.** The brief allows one moving thing in the hero, and here that is Fig. 00, which carries data.

### In-page index (desktop, 1180 px and up)

A sticky index sits in a left column beside the essays: E-04 to E-01, then About and Contact (`nav.toc`, `js/notes.js`).
- The current part is in ink, with its code in orange.
- Each entry has a 2 px track that fills in orange as far as you have read. Earlier parts stay filled, so the whole index works as a progress bar: it shows where you are and how much is left.
- Below 1180 px it is hidden, and the top nav and Contents list do the job.

### E-04 (first project), as an essay

1. **Kicker:** "E-04 · Aug – Oct 2026 · In development".
2. **Title and summary:** copy item 7 and COPY-02. The summary ends with one added sentence, made of the figure's own caption words: "The replay below sets *its own estimate* against the *true path*." Those are the colour keys.
3. **Key results, straight under the summary.** Four big numbers between an ink rule and a hairline (a 2 × 2 grid on phones):
   - 99.8%: gates passed in a clean world, camera + IMU;
   - 98.6%: with gate-coloured clutter, camera + IMU;
   - 97.5%: with clutter, camera only;
   - None: GPS, depth sensor or map of the gates.

   A note under them reads "Pooled over 300 seeded courses: six sets of 50 random 8-gate courses".
4. **Byline:** Role (the S.5 ownership line), Tools, and Source (the repo link, moved up from the end).
5. **The replay and pipeline strip**, page-wide (edge to edge on phones), with a journal caption. Its caption is keyed too.
6. **Approach, How it was built and Testing** in the reading column, with margin notes:
   - the "Camera only" and clutter notes moved from under Fig. 01 into the margin;
   - a note keying the Fuse panel.
7. **Fig. 01**, the benchmark, as a journal table, with its caption in the margin.

### About

- The approved About paragraph is the standfirst.
- Skills and experience is a journal table, software first. The "Used in" links stay (E-04 and so on, with the title on hover or focus).
- "Outside engineering" sits in the margin: the Unsplash numbers, and Unsplash and Instagram as text links.
- **The film strip** is the one full-bleed figure after the hero. On a desktop it runs off the page's right edge, and on a phone off both edges, so it reads as a strip that carries on.
- **Phones:** the photography note and the strip come before the long table (CSS `order`), so the strip is within the first two screens of About. The table follows in full.

E-03, E-02, E-01, Contact and the footer use the new tokens only: chips become an inline meta line, stat cards become ruled numbers, and figures get hairline frames. They aren't redrawn as essays.

## Fonts (Google Fonts, one `<link>`)

| Font | Use | Notes |
|---|---|---|
| Instrument Sans (400–700) | Headings, UI and labels | Display at 600 with tight tracking |
| Source Serif 4 (opsz 8–60, 400–600) | Prose, standfirsts and table body | 19 px body on a desktop, 1.62 line height |
| JetBrains Mono (400, 500) | Data | Project codes, figure readouts, tabular numbers |

## Tokens

**Colour**

| Token | Light | Dark | Contrast on the page |
|---|---|---|---|
| `--bg` / `--paper` | `#FBFAF7` | `#141311` (warm charcoal) | – |
| `--panel` | `#F2F0EA` | `#1E1C19` | – |
| `--ink` | `#16181B` | `#ECE8E0` | 17.0:1 / 15.2:1 |
| `--ink-2` | `#3E4147` | `#C9C4BA` | 9.8:1 / 10.7:1 |
| `--muted` | `#66655F` | `#9C978C` | 5.6:1 / 6.4:1 |
| `--rule` | ink at 15% | ink at 16% | – |
| `--rule-strong` | `#16181B` | `#ECE8E0` | – |
| `--signal` (the estimate and active state: lines and fills) | `#FF4F00` | `#FF6A1F` | – |
| `--link` (orange as text) | `#B63F00` | `#FF8A4C` | 5.4:1 / 8.0:1 |
| `--truth` (the true path, also used as text) | `#2C6E9C` | `#78AEDB` | 5.3:1 / 7.9:1 |
| `--on-signal` | `#16181B` | `#16181B` | 5.4:1 on orange |
| `--film` | `#161513` | `#2B2926` | – |

In dark, `--film` is lifted so the sprocket holes still show.

The true-path blue is now a token. `replay.js` reads it, and Fig. 00 and the pipeline strip use it from CSS (R-24).

**Type scale** (about 1.25):

| Token | Size |
|---|---|
| `--t-xs` | 13 |
| `--t-s` | 15 |
| `--t-m` (body) | 19 |
| `--t-l` (standfirst) | 18–23 |
| `--t-xl` (h4) | 24 |
| `--t-2xl` (essay titles) | 32–52 |
| `--t-h1` | 46–108 |

**Spacing:** a 4 px base, `--s-1` to `--s-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

**Layout:**
- `--measure` is 640 px for the reading column and `--col-gap` is 48 px.
- The page is 1280 px, with the index column 184 px wide and a 56 px gap.

**Radii and elevation:**
- Radii are 2, 3 and 4 px.
- Elevation is none: `--e-*` are `none`, and figures have a 1 px hairline frame.

## The signature moment: colour-keyed prose

The phrases "its own estimate" and "true path" are set in the figure's orange and blue. They appear in:
- E-04's summary;
- the replay caption;
- a margin note;
- Fig. 00's caption ("true path in blue", "the drone's own estimate dashed orange").

Each key is underlined the way its line is drawn: solid for the truth, dashed for the estimate. So the underline is itself a legend.

Each key is a `<button>`. Pointing at it or focusing it sets `data-key` on `<html>`, which does three things:
- **Fig. 00:** the chosen path thickens and the other fades to 18%.
- **The replay's top view** (canvas, `replay.js` redraws on the attribute change): the chosen line goes to 4 px and the other, with its marker and ellipse, drops to 22% opacity. This works on the pre-LOAD poster too.
- **The pipeline strip's Fuse panel:** the true-position dot or the 95% ellipse is picked out, and the panel's top rule lights in that colour. The legend entry turns bold.

Pressing a key pins the highlight (`aria-pressed`), which is how it works on touch. Escape clears it.

How it carries information: it tells the reader which of two near-identical overlapping lines is which, at the moment they read the claim. The gap between estimate and truth is the project's whole subject.

Reduced motion: the change is a state change with a 150 ms fade, which the global reduced-motion rule cuts to instant. Nothing moves on its own.

## Small JS changes (all IDs kept)

- **`js/notes.js` (new, imported by `main.js`):** the keys, and the index's current part and progress. The scroll listener only attaches at 1180 px and up.
- **`js/replay.js`:**
  - the truth colour comes from `--truth`;
  - `keyed()` changes line widths and opacities;
  - the MutationObserver also watches `data-key`.
- **Unit case fixes (R-12):**
  - `js/pipeline.js` range and scale labels: "m", not "M";
  - `js/cursor.js` readout: "mm", not "MM".
- **`js/theme.js`:** the theme-color values for the new paper colours.

## Deviations from the brief, and why

- **The hero drone drawing is gone.** It isn't moved to E-03, which is out of scope. The hero's one moving thing is Fig. 00.
- **Fig. 00 is page-wide on a desktop, not full-bleed.** The recorded course is tall and narrow, so at 1440 px full-bleed it would only add empty paper. It is edge to edge on phones.
- **The index includes Contact as well as E-04 to E-01 and About.** It is a progress bar, so it should reach the end.
- **About on phones puts the strip before the table**, so a reader sees the person before a 13-row table. This keeps photography in About and below the engineering standfirst, but it does sit above the skills table on a phone.
- **One added sentence and one margin note in E-04** describe the figures in their captions' own words ("true path", "estimate", "95% ellipse", the four stage names). They make no new claims. The Fig. 01 caption merges its existing note sentences.

## Known gaps

- E-03, E-02 and E-01 are only re-tokened, not rewritten as essays with margin captions.
- The colour keys exist only in E-04 and Fig. 00. E-03 (frame vs. all-up in Fig. 03) and E-02 (predicted vs. measured in Fig. 06) would suit the same device.
- The full-page captures can't show the sticky index's active state, because a full-page screenshot is taken at scroll 0. The hover screenshots in `review/scratch/dir-C/` show the key highlight in both themes.
- I didn't run the test suite on the prototype. Tests that look for `.hero-facts`, `#hero-drone`, the card register or the old `.specs` in E-04 will need updating if this direction wins.
- The fonts are three families from Google Fonts with no preload or metric-matched fallback (R-34). Self-hosted woff2 subsets would be the production step.
- The dark primary button (cream fill) is the loudest object in the dark hero, which R-24 warned about. It is kept here because it is the one action.
