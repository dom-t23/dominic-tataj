// Fig. 02, the drone in 3D (js/frame3d-boot.js, js/frame3d.js): V2 first, V1 on its button.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

// ANGLE's software renderer here: headless Chromium's default software path clips a WebGL
// canvas that is partly scrolled off screen.
test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

const fig = (page) => page.locator("#frame3d");
const step = (page) => fig(page).getAttribute("data-step");
const parts = (page) => page.locator(".f3-parts:not([hidden])");   // the shown version's list

// Scroll to progress p (0 to 1) through the pinned figure, or to the figure if it isn't pinned.
async function scrollTo(page, p) {
  await page.evaluate((p) => {
    const t = document.getElementById("f3-track"), f = t.querySelector(".f3"), r = t.getBoundingClientRect();
    const top = t.classList.contains("pinned") ? parseFloat(getComputedStyle(f).top) : 80;
    window.scrollTo(0, scrollY + r.top - top + p * (t.offsetHeight - f.offsetHeight));
  }, p);
}
async function reach(page) {
  await page.goto("/drone-frame.html", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollBy(0, 1));
  await scrollTo(page, 0);
  await expect(page.locator(".f3-view")).toHaveClass(/ready/, { timeout: 30000 });
}
// Pixels of ink (near-black) in the figure's drawing area.
async function ink(page) {
  const png = await page.locator(".f3-view").screenshot();
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 200) n++;
    return n;
  }, png.toString("base64"));
}

test("three.js loads only once the visitor scrolls near; scrolling moves through the three views", async ({ page }) => {
  const errors = trackErrors(page), three = [];
  page.on("request", (r) => { if (/three\.module|frame(-v2)?\.glb/.test(r.url())) three.push(r.url()); });
  await page.goto("/drone-frame.html", { waitUntil: "networkidle" });
  expect(three).toEqual([]);
  await expect(page.locator("#f3-track")).toHaveClass(/is-3d/);
  await expect(page.locator(".f3-renders")).toBeHidden();

  await page.evaluate(() => window.scrollBy(0, 1));
  await scrollTo(page, 0);
  await expect(page.locator(".f3-view")).toHaveClass(/ready/, { timeout: 30000 });
  expect(three.length).toBe(2);   // three.js and V2; V1 waits for its button
  expect(three.some((u) => /frame-v2\.glb/.test(u))).toBe(true);
  await expect(page.locator("#f3-track")).toHaveClass(/pinned/);
  expect(await step(page)).toBe("0");
  await expect(fig(page).locator("figcaption")).toContainText("V2 as modelled in Fusion: 25 parts, about 240 g all-up");

  await scrollTo(page, 0.5);
  await expect.poll(() => step(page)).toBe("1");
  await expect(fig(page).locator("figcaption")).toContainText("V2, exploded");
  await expect(page.locator(".f3-steps button").nth(1)).toHaveAttribute("aria-current", "step");

  await scrollTo(page, 0.97);
  await expect.poll(() => step(page)).toBe("2");
  await expect(fig(page).locator("figcaption")).toContainText("125 × 98 mm apart, 159 mm across the diagonal");
  await expect(parts(page).locator("tr.off")).toHaveCount(11);   // all but the frame
  // the figure stays pinned under the nav the whole way
  const navBottom = await page.locator(".nav").evaluate((n) => n.getBoundingClientRect().bottom);
  expect((await fig(page).boundingBox()).y).toBeCloseTo(navBottom + 12, 0);
  expect(await fig(page).evaluate((f) => f.getBoundingClientRect().bottom)).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  expect(errors).toEqual([]);
});

test("the view buttons scroll to their view", async ({ page }) => {
  await reach(page);
  const y0 = await page.evaluate(() => scrollY);
  await page.click(".f3-steps button:nth-child(3)");
  await expect.poll(() => step(page), { timeout: 8000 }).toBe("2");
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(y0 + 500);
  await page.click(".f3-steps button:nth-child(1)");
  await expect.poll(() => step(page), { timeout: 8000 }).toBe("0");
});

test("the parts list and the model pick parts out", async ({ page }) => {
  await reach(page);
  const row = parts(page).locator('tr[data-part="motor"]');
  await row.locator("button").hover();
  await expect.poll(() => fig(page).getAttribute("data-focus")).toBe("motor");
  await expect(row).toHaveClass(/\bon\b/);
  await expect(page.locator(".f3-ov .tag")).toHaveAttribute("opacity", "1");
  await row.locator("button").click();
  await expect(row.locator("button")).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(5, 5);   // off the list: the click keeps it picked out
  await expect.poll(() => fig(page).getAttribute("data-focus")).toBe("motor");
  await row.locator("button").click();
  await page.mouse.move(5, 5);
  await expect.poll(() => fig(page).getAttribute("data-focus")).toBe("");
  // the middle of the drawing is a part (the battery or the stack under it)
  const box = await page.locator(".f3-view canvas").boundingBox();
  await page.mouse.move(box.x + box.width * 0.47, box.y + box.height * 0.45);
  await expect.poll(() => fig(page).getAttribute("data-focus")).not.toBe("");
  await expect(page.locator(".f3-view")).toHaveClass(/\bover\b/);
});

test("the version buttons switch to V1 and back: its model, parts list, captions and dimensions", async ({ page }) => {
  const errors = trackErrors(page), glb = [];
  page.on("request", (r) => { if (/\.glb/.test(r.url())) glb.push(r.url().split("/").pop()); });
  await reach(page);
  expect(glb).toEqual(["frame-v2.glb"]);
  await expect(fig(page)).toHaveAttribute("data-ver", "v2");
  await expect(page.locator('.f3-ver button[data-ver="v2"]')).toHaveAttribute("aria-pressed", "true");
  await expect(parts(page).locator("caption")).toHaveText("Parts list, V2");

  await page.click('.f3-ver button[data-ver="v1"]');
  await expect(fig(page)).toHaveAttribute("data-ver", "v1");
  await expect(page.locator(".f3-view")).toHaveClass(/ready/, { timeout: 30000 });
  expect(glb).toEqual(["frame-v2.glb", "frame.glb"]);
  await expect(page.locator('.f3-ver button[data-ver="v1"]')).toHaveAttribute("aria-pressed", "true");
  await expect(parts(page)).toHaveCount(1);
  await expect(parts(page).locator("caption")).toHaveText("Parts list, V1");
  await expect(fig(page).locator("figcaption")).toContainText("V1 as modelled in Fusion: 47 parts, 246 g all-up");
  await scrollTo(page, 0.97);
  await expect.poll(() => step(page)).toBe("2");
  await expect(fig(page).locator("figcaption")).toContainText("96 mm apart, 136 mm across the diagonal");
  await expect(page.locator(".f3-ov text.dim-t").first()).toHaveText("96.0");   // V1's, measured off its model
  await expect(page.locator(".f3-ov text.dim-t").nth(1)).toHaveText("135.8");
  await expect(parts(page).locator("tr.off")).toHaveCount(8);

  await page.click('.f3-ver button[data-ver="v2"]');   // built already: no second load
  await expect(fig(page)).toHaveAttribute("data-ver", "v2");
  await expect(fig(page).locator("figcaption")).toContainText("The V2 frame alone: 52 g");
  await expect(page.locator(".f3-ov text.dim-t").first()).toHaveText("125.0");
  expect(glb).toEqual(["frame-v2.glb", "frame.glb"]);
  expect(errors).toEqual([]);
});

test("dragging turns it, and the turn springs back square outside the assembly view", async ({ page }) => {
  await reach(page);
  await scrollTo(page, 0.97);
  await expect(page.locator(".f3-view")).toHaveClass(/still/, { timeout: 30000 });
  const before = await ink(page);
  const box = await page.locator(".f3-view canvas").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 6 });
  await expect(page.locator(".f3-view")).toHaveClass(/dragging/);
  await page.mouse.up();
  await expect(page.locator(".f3-view")).not.toHaveClass(/dragging/);
  await expect(page.locator(".f3-view")).toHaveClass(/still/, { timeout: 30000 });
  expect(Math.abs(await ink(page) - before)).toBeLessThan(before * 0.05);   // back where it was
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("not pinned: the view buttons switch views at once, and it is drawn", async ({ page }) => {
    const errors = trackErrors(page);
    await reach(page);
    await expect(page.locator("#f3-track")).not.toHaveClass(/pinned/);
    await expect(page.locator(".f3-view")).toHaveClass(/still/);   // no turning on its own
    expect(await ink(page)).toBeGreaterThan(3000);
    await page.click(".f3-steps button:nth-child(2)");
    expect(await step(page)).toBe("1");
    await page.click(".f3-steps button:nth-child(3)");
    expect(await step(page)).toBe("2");
    await expect(page.locator(".f3-ov text.dim-t").first()).toHaveText("125.0");   // measured off the model
    await expect(page.locator(".f3-ov text.dim-t").nth(1)).toHaveText("158.8");
    expect(errors).toEqual([]);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("not pinned on a phone (R-08): full width, the parts list under the drawing, views by button", async ({ page }) => {
    await reach(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await expect(page.locator("#f3-track")).not.toHaveClass(/pinned/);
    const view = await page.locator(".f3-view").boundingBox(), list = await parts(page).boundingBox();
    expect(list.y).toBeGreaterThanOrEqual(view.y + view.height - 1);
    expect(view.height).toBeGreaterThan(260);
    await page.click(".f3-steps button:nth-child(2)");
    await expect(fig(page)).toHaveAttribute("data-step", "1");
    // caption and parts list inside the screen, not clipped at its edges (P1-1)
    for (const sel of ["#frame3d figcaption", ".f3-parts:not([hidden])"]) {
      const b = await page.locator(sel).boundingBox();
      expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThanOrEqual(390);
    }
    await expect(page.locator("#frame3d figcaption")).toContainText("Fig. 02");
  });
});

test("without WebGL 2, the renders stay", async ({ page }) => {
  await page.addInitScript(() => { delete window.WebGL2RenderingContext; });
  await page.goto("/drone-frame.html", { waitUntil: "networkidle" });
  await expect(page.locator("#f3-track")).not.toHaveClass(/is-3d/);
  await expect(page.locator(".f3-renders img")).toHaveCount(2);
  await expect(page.locator(".f3-renders")).toBeVisible();
  await expect(page.locator(".f3-stage")).toBeHidden();
  await expect(fig(page).locator("figcaption")).toContainText("Fusion renders");
});

test("if the model fails to load, the renders come back", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/frame-v2.glb", (r) => r.abort());
  await page.goto("/drone-frame.html", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollBy(0, 1));
  await scrollTo(page, 0);
  await expect(page.locator("#f3-track")).not.toHaveClass(/is-3d/, { timeout: 15000 });
  await expect(page.locator(".f3-renders")).toBeVisible();
  await expect(fig(page).locator("figcaption")).toContainText("Fusion renders");
  expect(errors.filter((e) => !/frame-v2\.glb|ERR_FAILED/.test(e))).toEqual([]);
});
