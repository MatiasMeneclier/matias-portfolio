import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const errors = [];

// Observe actual painted visibility, including descendants of a hidden wheel.
async function sampleScroll(page, stops) {
  return page.evaluate(async (stops) => {
    const nav = document.querySelector(".portfolio-nav-floating");
    const wheel = document.querySelector(".flower-menu");
    const samples = [];
    const snapshot = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        target: element.dataset.visible,
        visibility: style.visibility,
        painted:
          style.visibility === "visible" &&
          box.bottom > 0 &&
          box.right > 0 &&
          box.top < innerHeight &&
          box.left < innerWidth,
      };
    };
    let next = 0;
    const start = performance.now();
    await new Promise((resolve) => {
      const frame = (now) => {
        const time = now - start;
        while (next < stops.length && time >= stops[next].time) {
          scrollTo({ top: stops[next++].top, behavior: "instant" });
        }
        samples.push({
          nav: snapshot(nav),
          wheel: snapshot(wheel),
          strayPetal: [...wheel.querySelectorAll(".flower-petal")].some(
            (petal) => getComputedStyle(petal).visibility === "visible",
          ),
        });
        if (time < stops.at(-1).time + 1000) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    return samples;
  }, stops);
}

function assertSynchronized(samples) {
  for (const { nav, wheel, strayPetal } of samples) {
    assert.equal(
      wheel.target,
      nav.target,
      "Both controls follow the same scroll threshold",
    );
    assert.equal(
      wheel.visibility,
      nav.visibility,
      "Both controls hide on the same frame",
    );
    assert.equal(
      wheel.painted,
      nav.painted,
      "Both controls cross the viewport edge together",
    );
    if (wheel.visibility === "hidden")
      assert.equal(
        strayPetal,
        false,
        "A hidden wheel cannot leave visible petals",
      );
  }
}

try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      isMobile: width < 701,
      hasTouch: width < 701,
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90000 });
    await expect(page.locator(".intro-loading")).toHaveCount(0, {
      timeout: 60000,
    });
    const end = await page
      .locator(".intro")
      .evaluate(
        (intro) =>
          intro.offsetHeight -
          intro.querySelector(".intro-sticky").offsetHeight,
      );
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), end);
    await page.waitForTimeout(1000);
    for (const theme of ["Dark", "Soft"]) {
      await page.getByRole("button", { name: theme, exact: true }).click();
      await page.waitForTimeout(400);
      const boundary = await page
        .locator(".portfolio-nav:not(.portfolio-nav-floating)")
        .evaluate((inline) => inline.getBoundingClientRect().bottom + scrollY);
      const down = boundary + 40,
        up = boundary - 16;
      assertSynchronized(await sampleScroll(page, [{ time: 0, top: down }]));
      await page.locator(".flower-trigger").click();
      await expect(page.locator(".flower-petal").first()).toHaveCSS(
        "visibility",
        "visible",
      );
      // Scroll upward while the wheel is still opening.
      assertSynchronized(await sampleScroll(page, [{ time: 0, top: up }]));
      await expect(page.locator(".flower-trigger")).toHaveCSS(
        "visibility",
        "hidden",
      );
      await expect(page.locator(".flower-menu")).toHaveAttribute(
        "data-open",
        "false",
      );
      assertSynchronized(
        await sampleScroll(page, [
          { time: 0, top: down },
          { time: 100, top: up },
          { time: 200, top: down },
          { time: 300, top: up },
          { time: 400, top: down },
          { time: 500, top: up },
        ]),
      );
      await expect(page.locator(".flower-trigger")).toHaveCSS(
        "visibility",
        "hidden",
      );
      await expect(page.locator(".portfolio-nav-floating")).toHaveCSS(
        "visibility",
        "hidden",
      );
      await expect(page.locator(".flower-menu")).toHaveAttribute("inert", "");
      await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), end);
      await page.waitForTimeout(700);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".intro")).toHaveCount(0);
    await page
      .locator("#projects")
      .evaluate((section) => section.scrollIntoView());
    await expect(page.locator(".flower-trigger")).toHaveCSS(
      "visibility",
      "visible",
    );
    await page.locator(".flower-trigger").click();
    assertSynchronized(await sampleScroll(page, [{ time: 0, top: 0 }]));
    await expect(page.locator(".flower-trigger")).toHaveCSS(
      "visibility",
      "hidden",
    );
    await context.close();
    console.log(
      `${width}px: synchronized entrance/exit, open-wheel exit, rapid reversals and reduced motion passed in both themes.`,
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
