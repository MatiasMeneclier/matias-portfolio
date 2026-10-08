import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const out = path.resolve("../previews/glass-entrance");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const errors = [];
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
    await page.evaluate(() => document.fonts.ready);
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
    // A fast fling may reveal the floating controls while the hero is still fading.
    const fastEntrance = await page.evaluate(async () => {
      const nav = document.querySelector(".portfolio-nav-floating");
      const inline = document.querySelector(
        ".portfolio-nav:not(.portfolio-nav-floating)",
      );
      const frames = [];
      scrollTo({
        top: inline.getBoundingClientRect().bottom + scrollY + 40,
        behavior: "instant",
      });
      const started = performance.now();
      await new Promise((resolve) => {
        const sample = (now) => {
          if (
            getComputedStyle(nav).visibility === "visible" &&
            nav.getBoundingClientRect().bottom > 0
          ) {
            let isolated = false;
            for (let element = nav; element; element = element.parentElement)
              isolated ||= Number(getComputedStyle(element).opacity) < 1;
            frames.push(isolated);
          }
          if (now - started < 1000) requestAnimationFrame(sample);
          else resolve();
        };
        requestAnimationFrame(sample);
      });
      return frames;
    });
    assert.ok(
      fastEntrance.length && fastEntrance.every((isolated) => !isolated),
      "Fast intro scrolling never isolates the floating glass under the hero fade",
    );
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), end);
    await page.waitForTimeout(1000);
    for (const theme of ["Dark", "Soft"]) {
      await page.getByRole("button", { name: theme, exact: true }).click();
      await page.waitForTimeout(500);
      const result = await page.evaluate(async () => {
        const nav = document.querySelector(".portfolio-nav-floating");
        const wheel = document.querySelector(".flower-menu");
        const inline = document.querySelector(
          ".portfolio-nav:not(.portfolio-nav-floating)",
        );
        const lenses = [
          ...nav.querySelectorAll(".liquid-glass-layer"),
          ...wheel.querySelectorAll(".liquid-glass-layer"),
        ];
        const prepared = lenses.every(
          (lens) =>
            lens.style.getPropertyValue("--liquid-refraction") &&
            lens.parentElement.querySelector("feImage")?.getAttribute("href"),
        );
        const frames = [];
        const sample = (root) => {
          const style = getComputedStyle(root);
          const box = root.getBoundingClientRect();
          let element = root;
          let isolated = false;
          while (element && element !== document.documentElement) {
            const ancestor = getComputedStyle(element);
            isolated ||=
              Number(ancestor.opacity) < 1 ||
              ancestor.willChange
                .split(",")
                .some((value) => value.trim() === "opacity");
            element = element.parentElement;
          }
          return {
            visible:
              style.visibility === "visible" &&
              box.bottom > 0 &&
              box.right > 0 &&
              box.top < innerHeight,
            isolated,
            opacity: style.opacity,
            filter: getComputedStyle(root.querySelector(".liquid-glass-layer"))
              .backdropFilter,
          };
        };
        scrollTo({
          top: inline.getBoundingClientRect().bottom + scrollY + 40,
          behavior: "instant",
        });
        const started = performance.now();
        await new Promise((resolve) => {
          const tick = (now) => {
            frames.push({
              time: now - started,
              nav: sample(nav),
              wheel: sample(wheel),
            });
            if (now - started < 750) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        return { prepared, frames };
      });
      assert.ok(result.prepared, "All refraction maps exist before entrance");
      for (const control of ["nav", "wheel"]) {
        const visibleFrames = result.frames.filter(
          (frame) => frame[control].visible,
        );
        assert.ok(visibleFrames.length > 2, `${control} entered the viewport`);
        assert.ok(
          visibleFrames.every(
            (frame) =>
              frame[control].opacity === "1" &&
              !frame[control].isolated &&
              frame[control].filter.includes("url("),
          ),
          `${control} samples the backdrop from its first visible frame`,
        );
      }
      await page.screenshot({
        path: path.join(out, `${theme.toLowerCase()}-${width}.png`),
      });
      if (width === 390) {
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          end,
        );
        await expect(page.locator(".portfolio-nav-floating")).toHaveCSS(
          "visibility",
          "hidden",
        );
        await page.evaluate(() => {
          const inline = document.querySelector(
            ".portfolio-nav:not(.portfolio-nav-floating)",
          );
          scrollTo({
            top: inline.getBoundingClientRect().bottom + scrollY + 40,
            behavior: "instant",
          });
        });
        await page.waitForTimeout(140);
        await page.screenshot({
          path: path.join(out, `${theme.toLowerCase()}-${width}-entering.png`),
        });
        await page.waitForTimeout(650);
      }
      await page.locator(".flower-trigger").click();
      const petals = await page.evaluate(async () => {
        const frames = [];
        const started = performance.now();
        await new Promise((resolve) => {
          const tick = (now) => {
            frames.push(
              [...document.querySelectorAll(".flower-petal")].map(
                (element) => ({
                  opacity: getComputedStyle(element).opacity,
                  visibility: getComputedStyle(element).visibility,
                  filter: getComputedStyle(
                    element.querySelector(".liquid-glass-layer"),
                  ).backdropFilter,
                }),
              ),
            );
            if (now - started < 400) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        return frames;
      });
      assert.ok(
        petals
          .flat()
          .every(
            (petal) =>
              petal.visibility === "visible" &&
              petal.opacity === "1" &&
              petal.filter.includes("url("),
          ),
        "Every petal opens with live glass",
      );
      await page.screenshot({
        path: path.join(out, `${theme.toLowerCase()}-${width}-wheel-open.png`),
      });
      await page.locator(".flower-trigger").click();
      await expect(page.locator(".flower-petal").first()).toHaveCSS(
        "visibility",
        "hidden",
      );
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        end,
      );
      await expect(page.locator(".flower-menu")).toHaveCSS(
        "visibility",
        "hidden",
      );
      await expect(page.locator(".portfolio-nav-floating")).toHaveCSS(
        "visibility",
        "hidden",
      );
    }
    // Instant accessibility transitions also show/hide the prepared material correctly.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".intro")).toHaveCount(0);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.locator(".flower-menu")).toHaveCSS(
      "visibility",
      "hidden",
    );
    await page.locator("#projects").evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      }),
    );
    await expect(page.locator(".flower-menu")).toHaveCSS(
      "visibility",
      "visible",
    );
    await expect(page.locator(".portfolio-nav-floating")).toHaveCSS(
      "visibility",
      "visible",
    );
    await page.locator(".flower-trigger").click();
    await expect(page.locator(".flower-petal").first()).toHaveCSS(
      "visibility",
      "visible",
    );
    await page.locator(".flower-trigger").click();
    await expect(page.locator(".flower-petal").first()).toHaveCSS(
      "visibility",
      "hidden",
    );
    await context.close();
    console.log(
      `${width}px: glass prepared before entrance, no opacity isolation during entry/opening, exit/re-entry and reduced motion OK in both themes.`,
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
