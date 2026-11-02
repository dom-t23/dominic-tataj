// About's contact sheet (DESIGN_PLAN.md 4.2; js/contact-sheet.js).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const toView = (page) => page.locator(".contact-sheet").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("eight numbered, captioned frames, lazy-loaded, each with a description", async ({ page }) => {
  const errors = trackErrors(page);
  const photos = [];
  page.on("request", (r) => { if (r.url().includes("/images/photos/")) photos.push(r.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(photos).toEqual([]);   // nothing until the strip is near
  const frames = page.locator(".film li");
  await expect(frames).toHaveCount(8);
  await expect(frames.locator(".fr")).toHaveText(["01", "02", "03", "04", "05", "06", "07", "08"].map((n) => "▸ " + n));
  await expect(frames.nth(2).locator(".cap")).toHaveText("CATANIA, SICILY");
  for (const img of await frames.locator("img").all()) {
    await expect(img).toHaveAttribute("loading", "lazy");
    expect((await img.getAttribute("alt")).length).toBeGreaterThan(20);
  }
  await toView(page);
  await expect.poll(() => frames.first().locator("img").evaluate((i) => i.complete && i.naturalHeight)).toBe(600);
  expect(errors).toEqual([]);
});

test("the buttons page the strip and stop at its ends", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });   // loads after the load event
  await toView(page);
  await expect(page.locator(".cs-nav")).toBeVisible();
  await expect(page.locator("#cs-prev")).toBeDisabled();
  const left = () => page.locator(".film").evaluate((f) => f.scrollLeft);
  await page.click("#cs-next");
  await expect.poll(left).toBeGreaterThan(300);
  await expect(page.locator("#cs-prev")).toBeEnabled();
  while (await page.locator("#cs-next").isEnabled()) await page.click("#cs-next");
  const end = await page.locator(".film").evaluate((f) => f.scrollWidth - f.clientWidth);
  await expect.poll(left).toBeGreaterThan(end - 3);
  await page.click("#cs-prev");
  await expect.poll(left).toBeLessThan(end - 3);
});

test.describe("phone", () => {
  test.use(phone);
  test("the strip scrolls inside itself; the page does not", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await toView(page);
    const [sw, iw, fw, cw] = await page.evaluate(() => {
      const f = document.querySelector(".film");
      return [document.documentElement.scrollWidth, innerWidth, f.scrollWidth, f.clientWidth];
    });
    expect(sw).toBeLessThanOrEqual(iw);
    expect(fw).toBeGreaterThan(cw * 3);
  });
});
