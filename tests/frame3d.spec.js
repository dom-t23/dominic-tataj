// Fig. 01, the drone in 3D (js/frame3d-boot.js, js/frame3d.js).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

// ANGLE's software renderer here: headless Chromium's default software path clips a WebGL
// canvas that is partly scrolled off screen.
test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

const fig = (page) => page.locator("#frame3d");
const step = (page) => fig(page).getAttribute("data-step");

// Scroll to progress p (0 to 1) through the pinned figure, or to the figure if it isn't pinned.
async function scrollTo(page, p) {
  await page.evaluate((p) => {
    const t = document.getElementById("f3-track"), f = t.querySelector(".f3"), r = t.getBoundingClientRect();
    const top = t.classList.contains("pinned") ? parseFloat(getComputedStyle(f).top) : 80;
    window.scrollTo(0, scrollY + r.top - top + p * (t.offsetHeight - f.offsetHeight));
  }, p);
}
async function reach(page) {
  await page.goto("/", { waitUntil: "networkidle" });
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
  page.on("request", (r) => { if (/three\.module|frame\.glb/.test(r.url())) three.push(r.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(three).toEqual([]);
  await expect(page.locator("#f3-track")).toHaveClass(/is-3d/);
  await expect(page.locator(".f3-renders")).toBeHidden();

  await page.evaluate(() => window.scrollBy(0, 1));
  await scrollTo(page, 0);
  await expect(page.locator(".f3-view")).toHaveClass(/ready/, { timeout: 30000 });
  expect(three.length).toBe(2);
  await expect(page.locator("#f3-track")).toHaveClass(/pinned/);
  expect(await step(page)).toBe("0");
  await expect(fig(page).locator("figcaption")).toContainText("47 parts, 246 g all-up");

  await scrollTo(page, 0.5);
  await expect.poll(() => step(page)).toBe("1");
  await expect(fig(page).locator("figcaption")).toContainText("Exploded");
  await expect(page.locator(".f3-steps button").nth(1)).toHaveAttribute("aria-current", "step");

  await scrollTo(page, 0.97);
  await expect.poll(() => step(page)).toBe("2");
  await expect(fig(page).locator("figcaption")).toContainText("96 mm apart, 136 mm across the diagonal");
  await expect(page.locator(".f3-parts tr.off")).toHaveCount(8);   // all but the frame
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
  const row = page.locator('tr[data-part="motor"]');
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
    await expect(page.locator(".f3-ov text.dim-t").first()).toHaveText("96.0");   // measured off the model
    await expect(page.locator(".f3-ov text.dim-t").nth(1)).toHaveText("135.8");
    expect(errors).toEqual([]);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("pinned, full width, with the parts list under the drawing", async ({ page }) => {
    await reach(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await expect(page.locator("#f3-track")).toHaveClass(/pinned/);
    const view = await page.locator(".f3-view").boundingBox(), parts = await page.locator(".f3-parts").boundingBox();
    expect(parts.y).toBeGreaterThanOrEqual(view.y + view.height - 1);
    expect(view.height).toBeGreaterThan(300);
    expect(parts.y + parts.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  });
});

test("without WebGL 2, the renders stay", async ({ page }) => {
  await page.addInitScript(() => { delete window.WebGL2RenderingContext; });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#f3-track")).not.toHaveClass(/is-3d/);
  await expect(page.locator(".f3-renders img")).toHaveCount(2);
  await expect(page.locator(".f3-renders")).toBeVisible();
  await expect(page.locator(".f3-stage")).toBeHidden();
  await expect(fig(page).locator("figcaption")).toContainText("Fusion renders");
});

test("if the model fails to load, the renders come back", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/frame.glb", (r) => r.abort());
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollBy(0, 1));
  await scrollTo(page, 0);
  await expect(page.locator("#f3-track")).not.toHaveClass(/is-3d/, { timeout: 15000 });
  await expect(page.locator(".f3-renders")).toBeVisible();
  await expect(fig(page).locator("figcaption")).toContainText("Fusion renders");
  expect(errors.filter((e) => !/frame\.glb|ERR_FAILED/.test(e))).toEqual([]);
});
