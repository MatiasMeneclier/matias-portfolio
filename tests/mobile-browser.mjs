import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const out = path.resolve("../previews/mobile");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const errors = [];
const watch = (page) =>
  page.on("pageerror", (error) => errors.push(error.message));
const ready = async (page) => {
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90000 });
  await expect(page.locator(".portfolio-hero")).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
};
const capture = async (page, name) =>
  page.screenshot({ path: path.join(out, `${name}.png`) });
const phase = async (page, progress) => {
  const end = await page
    .locator(".intro")
    .evaluate(
      (element) =>
        element.offsetHeight -
        element.querySelector(".intro-sticky").offsetHeight,
    );
  await page.evaluate(
    (top) => scrollTo({ top, behavior: "instant" }),
    end * progress,
  );
  await page.waitForTimeout(700);
  return end;
};
async function swipe(page, from, to) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: from.x, y: from.y }],
  });
  for (let step = 1; step <= 12; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: from.x + ((to.x - from.x) * step) / 12,
          y: from.y + ((to.y - from.y) * step) / 12,
        },
      ],
    });
    await page.waitForTimeout(24);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
  await page.waitForTimeout(800);
}
try {
  for (const width of [360, 390, 430]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    watch(page);
    await ready(page);
    await expect(page.locator(".intro .scene canvas")).toBeVisible({
      timeout: 60000,
    });
    await expect(page.locator(".intro-loading")).toHaveCount(0, {
      timeout: 60000,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `No horizontal overflow at ${width}`,
    );
    await capture(page, `dark-laptop-closed-${width}`);
    const end = await phase(page, 0.45);
    await capture(page, `dark-laptop-open-${width}`);
    const canvas = await page
      .locator(".intro .scene canvas")
      .evaluate((element) => ({
        width: element.width,
        css: element.clientWidth,
      }));
    assert.ok(
      canvas.width <= canvas.css * 1.25 + 1,
      "Laptop rendering caps retina pixel density",
    );
    await phase(page, 0.85);
    const surface = await page
      .locator(".portfolio-ambient")
      .evaluate((element) => Number(getComputedStyle(element).opacity));
    assert.ok(
      surface > 0 && surface < 1,
      "The background fades in during the shared transition",
    );
    await phase(page, 0.25);
    const y = await page.evaluate(() => scrollY);
    await page.waitForTimeout(300);
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - y) <= 1,
      "Returning to the laptop does not force recentering",
    );
    await page.setViewportSize({ width, height: 780 });
    await page.waitForTimeout(350);
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - y) <= 1,
      "Viewport resizing does not force the scroll position",
    );
    await page.setViewportSize({ width, height: 844 });
    await phase(page, 1);
    await expect(page.locator(".intro-sticky")).toHaveCSS(
      "visibility",
      "hidden",
    );
    await expect(page.locator(".portfolio-hero")).not.toHaveAttribute(
      "inert",
      "",
    );
    await capture(page, `dark-hero-${width}`);
    await page.getByRole("button", { name: "Soft", exact: true }).click();
    await phase(page, 0);
    await capture(page, `soft-laptop-closed-${width}`);
    await phase(page, 0.45);
    await capture(page, `soft-laptop-open-${width}`);
    await page.evaluate(
      (top) => scrollTo({ top: top + 40, behavior: "instant" }),
      end,
    );
    await page.waitForTimeout(60);
    assert.ok(
      (await page
        .locator(".portfolio-hero")
        .evaluate((element) => Number(getComputedStyle(element).opacity))) >
        0.9,
      "Fast scroll never leaves the hero waiting behind the intro",
    );
    await phase(page, 1);
    await capture(page, `soft-hero-${width}`);
    await page.locator("#projects").evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY - 100,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(500);
    const rail = page.locator(".sq-touch-rail");
    await expect(rail).toBeVisible();
    const first = await rail
      .locator('[aria-selected="true"]')
      .getAttribute("aria-label");
    const box = await rail.boundingBox();
    const verticalBefore = await page.evaluate(() => scrollY);
    await swipe(
      page,
      { x: box.x + box.width * 0.87, y: box.y + box.height * 0.45 },
      { x: box.x + box.width * 0.1, y: box.y + box.height * 0.45 },
    );
    await expect(rail.locator('[aria-selected="true"]')).not.toHaveAttribute(
      "aria-label",
      first,
    );
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - verticalBefore) <= 2,
      "Horizontal swiping does not move the page",
    );
    await capture(page, `soft-projects-${width}`);
    const selected = await rail
      .locator('[aria-selected="true"]')
      .getAttribute("aria-label");
    await page
      .getByRole("button", { name: "Next project", exact: true })
      .click();
    await expect(rail.locator('[aria-selected="true"]')).not.toHaveAttribute(
      "aria-label",
      selected,
    );
    await page.waitForTimeout(650);
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await capture(page, `dark-projects-${width}`);
    const active = await rail
      .locator('[aria-selected="true"]')
      .getAttribute("aria-label");
    const newBox = await rail.boundingBox();
    const beforeVerticalSwipe = await page.evaluate(() => scrollY);
    await swipe(
      page,
      { x: newBox.x + newBox.width / 2, y: newBox.y + newBox.height * 0.85 },
      { x: newBox.x + newBox.width / 2, y: newBox.y + newBox.height * 0.1 },
    );
    assert.ok(
      (await page.evaluate(() => scrollY)) > beforeVerticalSwipe + 60,
      "A vertical gesture over projects scrolls the page",
    );
    await expect(rail.locator('[aria-selected="true"]')).toHaveAttribute(
      "aria-label",
      active,
    );
    await page.locator("#contact").evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY - 100,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(500);
    await capture(page, `dark-contact-${width}`);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await expect(page.locator(".portfolio-nav-floating")).toHaveAttribute(
      "data-visible",
      "true",
    );
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await expect(page.locator(".nav-links.is-open")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".nav-links.is-open")).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.locator('.nav-links.is-open a[href="#about"]').click();
    await expect(page.locator(".nav-links.is-open")).toHaveCount(0);
    if (width === 390) {
      await phase(page, 0);
      await page.touchscreen.tap(width / 2, 844 * 0.55);
      await page.waitForTimeout(250);
      const progress = Number(
        await page.locator(".intro").getAttribute("data-intro-progress"),
      );
      assert.ok(
        progress > 0 && progress < 1,
        "Tapping the laptop plays the transition continuously",
      );
      await page.waitForTimeout(3000);
      await expect(page.locator(".intro-sticky")).toHaveCSS(
        "visibility",
        "hidden",
      );
    }
    await context.close();
    console.log(
      `Mobile ${width}px: laptop, transition, reverse scroll, viewport resize, horizontal/vertical gestures, controls and both themes OK (intro ${Math.round(end)}px).`,
    );
  }
  const reduced = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const r = await reduced.newPage();
  watch(r);
  await ready(r);
  await expect(r.locator(".intro")).toHaveCount(0);
  await expect(r.locator(".portfolio-hero")).toBeVisible();
  await capture(r, "reduced-motion-hero");
  await reduced.close();
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const d = await desktop.newPage();
  watch(d);
  await ready(d);
  await expect(d.locator(".intro-loading")).toHaveCount(0, { timeout: 60000 });
  await phase(d, 0.45);
  await capture(d, "desktop-laptop");
  await phase(d, 1);
  await capture(d, "desktop-hero");
  await d.locator("#projects").evaluate((element) =>
    scrollTo({
      top: element.getBoundingClientRect().top + scrollY - 100,
      behavior: "instant",
    }),
  );
  await expect(d.locator(".sq-strip")).toBeVisible();
  await expect(d.locator(".sq-touch-rail")).toHaveCount(0);
  await d.keyboard.press("ArrowRight");
  await expect(d.locator(".sq-count")).toContainText("02");
  await desktop.close();
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "Desktop carousel + reduced motion verified. No runtime errors. Screenshots: " +
      out,
  );
} finally {
  await browser.close();
}
