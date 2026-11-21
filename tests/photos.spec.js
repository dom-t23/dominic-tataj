// The photography page (photography.html, js/lightbox.js) and its teaser in About.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

test("About leads to the photography page; the homepage loads no full photographs", async ({ page }) => {
  const photos = [];
  page.on("request", (r) => { if (/\/images\/photos\/\d\d\.jpg/.test(r.url())) photos.push(r.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".photo-teaser")).toHaveAttribute("href", "photography.html");
  expect(photos).toEqual([]);
});

test("eight captioned photographs, WebP with a JPEG fallback, described, lazy below the fold", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/photography.html", { waitUntil: "networkidle" });
  const items = page.locator("#gallery li");
  await expect(items).toHaveCount(8);
  await expect(items.nth(3).locator(".cap")).toHaveText("03 · Catania, Sicily");
  for (const li of await items.all()) {
    await expect(li.locator("source")).toHaveAttribute("type", "image/webp");
    expect((await li.locator("img").getAttribute("alt")).length).toBeGreaterThan(20);
    expect(await li.locator("a").getAttribute("href")).toMatch(/^images\/photos\/\d\d\.jpg$/);
  }
  await expect(items.last().locator("img")).toHaveAttribute("loading", "lazy");
  // the WebP is what loads
  expect(await items.first().locator("img").evaluate((i) => i.currentSrc)).toMatch(/\.webp$/);
  await expect(page.locator(".nav a[aria-current=page]")).toHaveText("Photos");
  expect(errors).toEqual([]);
});

test("the lightbox: opens on the photo clicked, arrows step and wrap, Esc closes and focus returns", async ({ page }) => {
  await page.goto("/photography.html", { waitUntil: "networkidle" });
  await page.locator("#gallery a").nth(7).click();
  const dlg = page.locator("dialog.lightbox");
  await expect(dlg).toHaveAttribute("open", "");
  await expect(dlg.locator(".lb-n")).toHaveText("8 / 8");
  await page.keyboard.press("ArrowRight");
  await expect(dlg.locator(".lb-n")).toHaveText("1 / 8");
  await expect(dlg.locator(".lb-cap")).toHaveText("01 · Taormina, Sicily");
  expect(await dlg.locator("img").getAttribute("alt")).toMatch(/Madonna/);
  await page.keyboard.press("ArrowLeft");
  await expect(dlg.locator(".lb-n")).toHaveText("8 / 8");
  await page.keyboard.press("Escape");
  await expect(dlg).not.toHaveAttribute("open", "");
  expect(await page.evaluate(() => document.activeElement.getAttribute("href"))).toBe("images/photos/08.jpg");
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });
  test("each photo is a plain link to its image", async ({ page }) => {
    await page.goto("/photography.html");
    await page.locator("#gallery a").first().click();
    await expect(page).toHaveURL(/images\/photos\/01\.jpg$/);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("two columns, no sideways scroll; a swipe steps the lightbox", async ({ page }) => {
    await page.goto("/photography.html", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await page.locator("#gallery a").first().tap();
    const dlg = page.locator("dialog.lightbox");
    await expect(dlg.locator(".lb-n")).toHaveText("1 / 8");
    await page.locator(".lb-next").tap();
    await expect(dlg.locator(".lb-n")).toHaveText("2 / 8");
  });
});
