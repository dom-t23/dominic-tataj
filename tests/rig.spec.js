// The hover test rig in Fig. 00 (js/hover-rig.js) and its model (js/quad.js).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const state = (page) => page.locator("#rig").getAttribute("data-state");
const sp = (page) => page.locator("#rig").getAttribute("data-sp");
const readout = (page) => page.locator("#rig text.big");
async function openRig(page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#flight").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.click("#rig-open");
  await expect(page.locator("#rig-controls")).toBeVisible();
}
async function dronePoint(page) {
  return page.evaluate(() => {
    const r = document.querySelector('#rig g[transform*="rotate"]').getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  });
}

test("model: Routh limit, poles and a settled step response", async ({ page }) => {
  await page.goto("/");
  const r = await page.evaluate(async () => {
    const Q = await import("/js/quad.js");
    const q = Q.landed(0), sp = { x: 0, z: 1.5 };
    for (let i = 0; i < 240 * 6; i++) { Q.step(q, 1 / 240, sp, { kp: 6, kd: 3.4 }, true, { x: 0, z: 0 }); Q.contact(q, 1 / 240); }
    const maxRe = (ps) => Math.max(...ps.map((p) => p[0]));
    return { lim: Q.kpLimit(3.4), z: q.z, x: q.x, stable: maxRe(Q.poles(40, 3.4)), unstable: maxRe(Q.poles(45, 3.4)), span: Q.kdRange(6) };
  });
  expect(r.lim).toBeCloseTo(42.7, 1);
  expect(r.z).toBeCloseTo(1.5, 2);
  expect(Math.abs(r.x)).toBeLessThan(0.01);
  expect(r.stable).toBeLessThan(0);      // just inside the limit
  expect(r.unstable).toBeGreaterThan(0); // just outside it
  expect(r.span[0]).toBeCloseTo(0.43, 2);
});

test("opens over the strip, takes off and settles", async ({ page }) => {
  const errors = trackErrors(page);
  await openRig(page);
  await expect(page.locator("#flight")).toHaveClass(/\brig\b/);
  await expect(page.locator("#cap-rig")).toBeVisible();
  await expect.poll(() => page.locator(".flight-svg").evaluate((e) => getComputedStyle(e).opacity)).toBe("0");
  await expect.poll(() => state(page), { timeout: 6000 }).toBe("settled");
  await expect(readout(page)).toContainText("SETTLED IN 2.");
  await expect(page.locator("#stab")).toHaveText("STABLE · ζ 0.69 · Kp LIMIT 42.7");
  await expect(page.locator("#rig .poles path")).toHaveCount(4);   // four poles on the s-plane
  expect(errors).toEqual([]);
});

test("dragging holds it; released, it returns and settles", async ({ page }) => {
  await openRig(page);
  await expect.poll(() => state(page), { timeout: 6000 }).toBe("settled");
  const [x, y] = await dronePoint(page);
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 160, y + 40, { steps: 8 });
  await expect.poll(() => state(page)).toBe("held");
  await page.mouse.up();
  await expect.poll(() => state(page)).toBe("settling");
  await expect.poll(() => state(page), { timeout: 8000 }).toBe("settled");
});

test("a gust knocks it and it recovers; clicks and arrow keys move the setpoint", async ({ page }) => {
  await openRig(page);
  await expect.poll(() => state(page), { timeout: 6000 }).toBe("settled");
  await page.click("#gust");
  await expect.poll(() => state(page)).toBe("settling");
  await expect.poll(() => state(page), { timeout: 8000 }).toBe("settled");
  expect(await sp(page)).toBe("0.00,1.50");
  await page.locator("#rig").focus();
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowUp");
  expect(await sp(page)).toBe("0.25,1.75");
  const box = await page.locator("#rig").boundingBox();
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.5);
  expect(await sp(page)).not.toBe("0.25,1.75");
});

test("gains past the limit: it oscillates, the failsafe cuts the motors, it crashes and restarts", async ({ page }) => {
  await openRig(page);
  await page.locator("#kp").evaluate((e) => { e.value = "950"; e.dispatchEvent(new Event("input")); });
  await expect(page.locator("#stab")).toHaveClass(/bad/);
  await expect(page.locator("#stab")).toHaveText("UNSTABLE: RAISE Kd OR LOWER Kp");
  await expect.poll(() => state(page), { timeout: 25000 }).toBe("failsafe");
  await expect.poll(() => state(page), { timeout: 5000 }).toBe("crashed");
  await expect(page.locator("#rig text.note")).toContainText("IMPACT");
  await expect.poll(() => state(page), { timeout: 4000 }).not.toBe("crashed");
  await page.click("#rig-reset");
  await expect(page.locator("#kp-out")).toHaveText("6.0");
  await expect(page.locator("#kd-out")).toHaveText("3.4");
  await expect(page.locator("#stab")).not.toHaveClass(/bad/);
});

test("BACK TO PLAN restores the flight strip and hands focus back", async ({ page }) => {
  await openRig(page);
  await page.click("#rig-close");
  await expect(page.locator("#flight")).not.toHaveClass(/\brig\b/);
  await expect(page.locator("#rig-controls")).toBeHidden();
  await expect(page.locator("#cap-flight")).toBeVisible();
  await expect.poll(() => page.locator("#rig").evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
  await expect(page.locator("#rig-open")).toBeFocused();
});

test.describe("phone", () => {
  test.use(phone);
  test("fits the width with the controls wrapped", async ({ page }) => {
    await openRig(page);
    await expect.poll(() => state(page), { timeout: 6000 }).toBe("settled");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const c = await page.locator("#rig-controls").boundingBox();
    expect(c.width).toBeLessThanOrEqual(390);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("the rig still runs when asked for", async ({ page }) => {
    await openRig(page);
    await expect.poll(() => state(page), { timeout: 6000 }).toBe("settled");
  });
});
