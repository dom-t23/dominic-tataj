// Page structure, content and theme.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

test("renders in standards mode with no errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => document.compatMode)).toBe("CSS1Compat");
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("en-GB");
  expect(errors).toEqual([]);
});

test("content: order, numbering, figures and links", async ({ page }) => {
  await page.goto("/");
  const ids = (sel) => page.$$eval(sel, (es) => es.map((e) => e.id || e.getAttribute("href")));
  expect(await ids(".register a")).toEqual(["#e-03", "#e-04", "#e-02", "#e-01"]);
  expect(await ids("article.sheet")).toEqual(["e-03", "e-04", "e-02", "e-01"]);
  expect(await page.$$eval("figcaption b", (bs) => bs.map((b) => b.textContent)))
    .toEqual(["Fig. 01", "Fig. 02", "Fig. 03", "Fig. 04", "Fig. 05", "Fig. 06"]);
  expect(await page.$$eval(".nav ul a", (as) => as.map((a) => a.textContent))).toEqual(["WORK", "ABOUT", "CONTACT"]);
  expect(await page.$$eval("tr.pooled td", (tds) => tds.map((t) => t.textContent))).toEqual(["Pooled", "99.5%", "98.6%"]);
  for (const href of ["https://unsplash.com/@dominic_t", "https://www.instagram.com/dt___xt/",
    "https://www.linkedin.com/in/dominic-tataj", "https://github.com/dom-t23"]) {
    await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
  }
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  const body = await page.textContent("body");
  expect(body).not.toMatch(/48%|79%|98\.0% gates|13 Oct|Photograph to add/);
  await expect(page.locator(".hero-facts")).toContainText("27 June 2027");
});

test("theme toggle saves a choice and clears it again", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator("#theme")).toHaveText("DARK");
  await page.click("#theme");
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem("theme")])).toEqual(["dark", "dark"]);
  await page.reload();
  await expect(page.locator("#theme")).toHaveText("LIGHT");
  await page.click("#theme");
  expect(await page.evaluate(() => [document.documentElement.hasAttribute("data-theme"), localStorage.getItem("theme")])).toEqual([false, null]);
});

test.describe("phone", () => {
  test.use(phone);
  test("fits 390 px and shows availability on the first screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth])).toEqual([390, 390]);
    const box = await page.locator(".hero-facts").boundingBox();
    expect(box.y + box.height).toBeLessThan(await page.evaluate(() => innerHeight));
    // no spec value wraps onto a second line
    expect(await page.$$eval(".specs .n", (ns) => ns.filter((n) => n.getBoundingClientRect().height > 40).map((n) => n.textContent))).toEqual([]);
  });
});
