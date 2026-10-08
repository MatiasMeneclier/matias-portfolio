import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3011";
const output = path.resolve("tmp/pdfs");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => {
  localStorage.setItem("mm-locale", "en");
  window.__cvPrintCalls = 0;
  window.print = () => window.__cvPrintCalls++;
});
const results = [];
try {
  for (const locale of ["es", "en"]) {
    const response = await page.goto(`${base}/cv?lang=${locale}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".cv-workspace")).toHaveAttribute("lang", locale);
    await expect(page.locator(".cv-sheet")).toContainText("B2 First");
    await expect(page.locator(".cv-sheet")).toContainText("Cliped");
    await expect(page.locator(".cv-sheet")).not.toContainText("Amplificador");
    await expect(page.locator(".cv-sheet")).not.toContainText(
      "Natural Sciences / Ciencias Naturales",
    );
    assert.equal(
      await page.locator(".cv-section h2").first().innerText(),
      locale === "es" ? "FORMACIÓN ACADÉMICA" : "EDUCATION",
    );
    await page.locator(".cv-controls button").click();
    assert.ok((await page.evaluate(() => window.__cvPrintCalls)) > 0);
    await page.screenshot({
      path: path.join(output, `cv-browser-${locale}.png`),
      fullPage: true,
    });
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".cv-controls")).toBeHidden();
    await page.pdf({
      path: path.join(output, `cv-browser-${locale}.pdf`),
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    await page.emulateMedia({ media: "screen" });
    await page.setViewportSize({ width: 390, height: 844 });
    const metrics = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(
      metrics.scroll <= metrics.width,
      `Horizontal overflow: ${JSON.stringify(metrics)}`,
    );
    await page.screenshot({
      path: path.join(output, `cv-mobile-${locale}.png`),
      fullPage: true,
    });
    results.push({
      locale,
      status: response.status(),
      mobile: metrics,
      links: await page.locator(".cv-sheet a").count(),
    });
    await page.setViewportSize({ width: 1280, height: 1000 });
  }
  await page.getByRole("link", { name: "Español", exact: true }).click();
  await expect(page).toHaveURL(/lang=es/);
  await expect(page.locator(".cv-section h2").first()).toHaveText(
    "Formación académica",
  );
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(output, "cv-browser-checks.json"),
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
