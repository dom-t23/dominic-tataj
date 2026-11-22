"""One-off: move the four write-ups out of index.html into a page each (Nov 2026).

    python tools/split_projects.py

Kept in the repo as the record of how the pages were made. It is not a build step: the pages are
edited by hand from here on. Each page gets its own <head> (title, description, canonical, link
preview), the shared nav with the Work menu, the article (its title becomes the page's h1, its
section headings h2, and every prose section after the first becomes a <details> that phones
collapse), the footer, and js/project.js, which loads only the figures on that page.
"""
import re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://dom-t23.github.io/dominic-tataj/"

PROJECTS = [
    dict(id="e-04", no="E-04", slug="drone-racing", short="Vision-based autonomous drone racing",
         result="98.6% of gates by camera, with clutter",
         title="Vision-based autonomous drone racing",
         desc="A simulated racing drone that flies through gates by camera, with no GPS or map: 99.8% of gates in a clean world and 98.6% with clutter, over 300 seeded courses. Python, OpenCV, an error-state Kalman filter."),
    dict(id="e-03", no="E-03", slug="drone-frame", short="Generative FPV drone frame",
         result="246 g drone; frame 36% lighter",
         title="Generative FPV drone frame",
         desc="A generatively designed 3-inch FPV frame: 38 g printed, 36% lighter than a comparable plate frame, keeping the drone at 246 g, under the UK CAA's 250 g. Fusion generative design and Ansys."),
    dict(id="e-02", no="E-02", slug="pipe-climber", short="Pipe-climbing robot",
         result="Climbed the 2 m pipe, IMechE challenge",
         title="Pipe-climbing robot, IMechE Design Challenge",
         desc="A pipe-climbing robot whose drivetrain was chosen by simulation from more than 20 setups; it completed the climb at the IMechE Design Challenge. Excel dynamic model and Fusion CAD."),
    dict(id="e-01", no="E-01", slug="ai-scaling", short="AI training-power scaling analysis",
         result="P ∝ N^0.55 across 358 models",
         title="AI training-power scaling analysis",
         desc="Statistical analysis of AI training power against model size: a fitted scaling law, P ∝ N^0.55 (R² 0.44), and an order-of-magnitude estimate for GPT-5. MATLAB."),
]
PAGE = {p["id"]: p["slug"] + ".html" for p in PROJECTS}


def menu(current=None, home=False):
    """The Work menu: every project, its number and one result, on every page."""
    items = []
    for p in PROJECTS:
        cur = ' aria-current="page"' if p["id"] == current else ""
        res = html.escape(p["result"]).replace("N^0.55", "N<sup>0.55</sup>")
        items.append(f'            <li><a href="{p["slug"]}.html"{cur}><span class="m-no">{p["no"]}</span><span class="m-t">{p["short"]}</span><span class="m-r">{res}</span></a></li>')
    allp = "#work" if home else "./#work"
    return ('      <li class="menu-li"><details class="menu" id="work-menu"><summary>Work</summary>\n'
            '        <div class="menu-panel">\n'
            '          <ol class="menu-list">\n' + "\n".join(items) + '\n          </ol>\n'
            f'          <a class="m-all" href="{allp}">All projects, with the problem, role and outcome of each</a>\n'
            '        </div></details></li>\n')


def nav(current=None, home=False):
    h = "" if home else "./"
    return f'''<nav class="nav" aria-label="Main">
  <div class="wrap">
    <div class="brand"><a class="name" href="./">Dominic Tataj</a></div>
    <ul>
{menu(current, home)}      <li class="opt"><a href="{h}#about">About</a></li>
      <li class="opt"><a href="photography.html">Photos</a></li>
      <li><a href="{h}#contact">Contact</a></li>
      <li><button class="theme-btn" id="theme" type="button" aria-pressed="false" aria-label="Switch to light mode"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.8a6.2 6.2 0 0 1 0 12.4z" fill="currentColor"/></svg><span class="tl">Light</span></button></li>
      <li><a class="nav-cv" href="Dominic-Tataj-CV.pdf" download>CV</a></li>
    </ul>
  </div>
</nav>
'''


FOOTER = '''<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <p class="foot-line"><span>Dominic Tataj</span><span>MEng Mechanical Engineering, UCL</span><span>Updated November 2026</span></p>
      <p class="links"><a href="mailto:dominic_tataj@icloud.com">dominic_tataj@icloud.com</a> <a href="Dominic-Tataj-CV.pdf" download>CV</a> <a href="photography.html">Photography</a> <a href="https://www.linkedin.com/in/dominic-tataj" target="_blank" rel="noopener">LinkedIn ↗</a> <a href="https://github.com/dom-t23" target="_blank" rel="noopener">GitHub ↗</a></p>
    </div>
    <p class="colophon">Plain HTML, CSS and JavaScript, no framework; the source is on <a href="https://github.com/dom-t23/dominic-tataj" target="_blank" rel="noopener">GitHub ↗</a>. The figures run on each project's own data, and the drone at the top of the homepage is drawn from its CAD model. Set in Source Serif 4 and IBM Plex.</p>
  </div>
</footer>
'''

PREPAINT = '''<script>
  // The "js" class lets scripted parts of the page take their place from the first frame; a saved
  // light theme is applied here, before first paint, so the page never flashes dark first (js/theme.js).
  document.documentElement.classList.add("js");
  try { if (localStorage.getItem("theme") === "light") { document.documentElement.setAttribute("data-theme", "light"); document.querySelector('meta[name="theme-color"]').content = "#F4F1EA"; } } catch (e) {}
</script>
'''


def head(p):
    url = BASE + p["slug"] + ".html"
    og = BASE + "og/" + p["slug"] + ".png"
    t = f'{p["title"]} · Dominic Tataj'
    d = html.escape(p["desc"], quote=True)
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(t)}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#141311">
<meta name="color-scheme" content="dark light">
<meta name="author" content="Dominic Tataj">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(p["title"], quote=True)}, by Dominic Tataj">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{p["no"]}: {html.escape(p["title"], quote=True)}. {html.escape(p["result"], quote=True)}.">
<meta property="og:site_name" content="Dominic Tataj">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(p["title"], quote=True)}, by Dominic Tataj">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{og}">
{PREPAINT}<link rel="stylesheet" href="css/site.css?v=20261122p">
</head>
<body>
<a class="skip" href="#top">Skip to content</a>

'''


def adapt(article, pid):
    # the write-up's title is the page's h1; its section headings are h2
    article = re.sub(r"<h3 id=", "<h1 id=", article).replace("</h3>", "</h1>")
    article = article.replace("<h4>", "<h2>").replace("</h4>", "</h2>")
    # links to the other write-ups go to their pages
    def fix(m):
        target = m.group(1)
        return f'href="#{target}"' if target == pid else f'href="{PAGE[target]}"'
    article = re.sub(r'href="#(e-0[1-4])"', fix, article)
    # every prose section after the first can be folded away (js/more.js folds them on phones)
    def prose(m):
        block = m.group(0)
        secs = list(re.finditer(r"(\n( *))<div>\n\s*<h2>(.*?)</h2>(.*?)\n\2</div>", block, re.S))
        for s in reversed(secs[1:]):
            ind, title, body = s.group(2), s.group(3), s.group(4)
            rep = f'\n{ind}<details class="more" open>\n{ind}  <summary><h2>{title}</h2></summary>{body}\n{ind}</details>'
            block = block[:s.start()] + rep + block[s.end():]
        return block
    article = re.sub(r'<div class="prose">.*?\n          </div>\n(?=\s*<div class="fig-stack">|\s*</div>)', prose, article, flags=re.S)
    return article


def main():
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    arts = {m.group(1): m.group(0) for m in re.finditer(r'    <article class="sheet[^"]*" id="(e-0[1-4])".*?</article>', src, re.S)}
    assert len(arts) == 4, arts.keys()
    for p in PROJECTS:
        a = adapt(arts[p["id"]], p["id"])
        three = ('<!-- three.js (r170, js/vendor/three) loads only when Fig. 02 is close; its addons import "three" by name -->\n'
                 '<script type="importmap">{ "imports": { "three": "./js/vendor/three/three.module.min.js", "three/addons/": "./js/vendor/three/addons/" } }</script>\n'
                 if 'id="f3-track"' in a else "")
        page = (head(p) + nav(p["id"]) + '\n<main id="top" class="project">\n  <div class="wrap">\n' + a + '\n  </div>\n</main>\n\n'
                + FOOTER + "\n" + three + '<script type="module" src="js/project.js"></script>\n</body>\n</html>\n')
        (ROOT / (p["slug"] + ".html")).write_text(page, encoding="utf-8", newline="\n")
        print("wrote", p["slug"] + ".html", len(page))

    # the homepage: no write-ups; every link to one goes to its page; the nav gets the Work menu
    i = src.index("<!-- ============ WRITE-UPS")
    j = src.index("<!-- ============ ABOUT")
    src = src[:i] + src[j:]
    src = re.sub(r'href="#(e-0[1-4])"', lambda m: f'href="{PAGE[m.group(1)]}"', src)
    src = re.sub(r'<nav class="nav" aria-label="Main">.*?</nav>\n', lambda m: nav(None, True), src, flags=re.S)
    src = re.sub(r'<footer class="foot">.*?</footer>\n', lambda m: FOOTER.replace("at the top of the homepage", "at the top"), src, flags=re.S)
    (ROOT / "index.html").write_text(src, encoding="utf-8", newline="\n")
    print("index.html", len(src))


if __name__ == "__main__":
    main()
