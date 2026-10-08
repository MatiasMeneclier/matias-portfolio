import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const out = path.resolve("../previews/update");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const errors = [];
const watch = (p) => {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("Failed to load resource"))
      errors.push(m.text());
  });
};
const goto = (p, url) => p.goto(base + url, { waitUntil: "networkidle" });
const screenshot = async (p, name) => {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(650);
  await p.screenshot({ path: path.join(out, name + ".png") });
};
const save = async (p) => {
  await p.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(p.locator(".error-message")).toHaveCount(0);
  await expect(p.locator(".editor-heading")).not.toContainText(
    "Cambios sin guardar",
  );
};
try {
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
    reducedMotion: "reduce",
  });
  const p = await context.newPage();
  watch(p);
  await goto(p, "/");
  await expect(p.locator(".edit-shortcut")).toHaveCount(0);
  await expect(p.locator(".admin-quick-menu")).toHaveCount(0);
  await expect(p.locator(".site")).toHaveClass(/theme-soft/);
  await expect(
    p.locator(".portfolio-nav:not([inert]) .preference-controls button"),
  ).toHaveCount(3);
  await expect(
    p.locator(".portfolio-nav:not([inert]) .preference-controls button svg"),
  ).toHaveCount(3);
  assert.equal(
    await p
      .locator(".portfolio-nav:not([inert]) .preference-controls")
      .innerText(),
    "",
  );
  await p.getByRole("button", { name: "Dark", exact: true }).click();
  await screenshot(p, "dark-hero");
  await p.getByRole("button", { name: "Soft", exact: true }).click();
  await expect(p.locator(".site")).toHaveClass(/theme-soft/);
  await expect(
    p.locator(".portfolio-hero .portfolio-nav:not(.portfolio-nav-floating)"),
  ).toHaveCount(1);
  await expect(p.locator(".portfolio-nav-floating")).toHaveAttribute(
    "data-visible",
    "false",
  );
  await expect(p.locator(".hero-degree")).toHaveCSS("font-weight", "300");
  await screenshot(p, "soft-hero-es");
  await p
    .getByRole("button", { name: "Cambiar a inglés", exact: true })
    .click();
  await expect(p.locator(".hero-degree")).toHaveText("Computer Engineering");
  await expect(p.locator("#about")).toContainText(
    "Understand the foundations.",
  );
  await p.reload();
  await expect(p.locator(".site")).toHaveClass(/theme-soft/);
  await expect(p.locator("html")).toHaveAttribute("lang", "en");
  await p
    .locator('.portfolio-nav:not([inert]) .nav-links a[href="#experience"]')
    .click();
  await expect(p.locator("#experience")).toContainText("Sales Associate");
  await expect(p.locator(".portfolio-nav-floating")).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect(
    p.getByRole("button", { name: "Dark", exact: true }),
  ).toBeVisible();
  await screenshot(p, "soft-experience-en");
  await p.getByRole("button", { name: "Open terminal", exact: true }).click();
  await expect(p.locator("dialog")).toContainText("Type help");
  await p
    .getByRole("textbox", { name: "Command", exact: true })
    .fill("nonsense");
  await p.getByRole("textbox", { name: "Command", exact: true }).press("Enter");
  await expect(p.locator("dialog")).toContainText("Unknown command");
  await p.getByRole("button", { name: "Close terminal", exact: true }).click();
  await goto(p, "/cv");
  await expect(p.locator(".cv-page")).toContainText("Computer Engineering");
  await expect(
    p.getByRole("button", { name: /Print \/ Save PDF/ }),
  ).toBeVisible();
  await goto(p, "/admin/demo/profile");
  await p.getByRole("button", { name: "Copies EN", exact: true }).click();
  await p
    .getByLabel("Biografía · EN", { exact: true })
    .fill("Engineering student learning through practical work.");
  await save(p);
  await p
    .getByRole("button", { name: "Contenido principal", exact: true })
    .click();
  await p
    .getByRole("button", {
      name: "Elegir Foto personal (hero y About)",
      exact: true,
    })
    .click();
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#d4cce0"/><circle cx="200" cy="230" r="80" fill="#8b769f"/></svg>';
  await p.locator("input[type=file]").setInputFiles({
    name: "qa-media.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(svg),
  });
  await expect(p.locator(".media-manager")).toContainText("Archivo guardado.");
  await p
    .getByRole("button", { name: "Usar qa-media.svg", exact: true })
    .click();
  await p
    .getByLabel("Encuadre de la foto", { exact: true })
    .selectOption("50% 25%");
  await expect(p.locator(".editor-media-preview")).toHaveCount(1);
  await save(p);
  await goto(p, "/admin/demo/experience");
  await p.locator(".admin-row-select").filter({ hasText: "ZARA" }).click();
  for (const field of ["Logo cuadrado", "Foto de la empresa"]) {
    await p
      .getByRole("button", { name: "Elegir " + field, exact: true })
      .click();
    await p
      .getByRole("button", { name: "Usar qa-media.svg", exact: true })
      .click();
  }
  await save(p);
  await screenshot(p, "admin-experience-media");
  await p.getByRole("button", { name: "Copies EN", exact: true }).click();
  await p
    .getByLabel("Role · EN", { exact: true })
    .fill("Customer Experience Associate");
  await save(p);
  await goto(p, "/preview");
  await expect(p.locator(".hero-portrait img")).toHaveCount(1);
  assert.equal(
    await p
      .locator(".hero-portrait img")
      .evaluate((e) => getComputedStyle(e).objectPosition),
    "50% 25%",
  );
  await expect(p.locator(".experience-company .institution-logo")).toHaveCount(
    1,
  );
  await expect(p.locator(".company-image")).toHaveCount(1);
  await expect(p.locator("#experience")).toContainText(
    "Customer Experience Associate",
  );
  await screenshot(p, "soft-hero-media");
  await goto(p, "/admin/demo/projects");
  await p.getByRole("button", { name: "Agregar", exact: true }).click();
  await p.getByLabel("Title", { exact: true }).fill("Prueba local");
  await p.getByLabel("Slug", { exact: true }).fill("update-test");
  await p
    .getByLabel("Overview", { exact: true })
    .fill("Comprobando los detalles bilingües.");
  await p.getByRole("switch").check();
  await p.getByRole("button", { name: "Copies EN", exact: true }).click();
  await p.getByLabel("Title · EN", { exact: true }).fill("Local verification");
  await p
    .getByLabel("Overview · EN", { exact: true })
    .fill("Checking bilingual project details.");
  await save(p);
  await goto(p, "/preview/projects/update-test");
  await expect(p.locator("h1")).toHaveText("Local verification");
  await expect(
    p.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await expect(p.locator(".site")).toHaveClass(/theme-soft/);
  await p
    .getByRole("button", { name: "Switch to Spanish", exact: true })
    .click();
  await expect(p.locator("h1")).toHaveText("Prueba local");
  await expect(
    p.getByRole("heading", { name: "Resumen", exact: true }),
  ).toBeVisible();
  await goto(p, "/admin/demo/localization");
  await p.getByRole("button", { name: "Copies EN", exact: true }).click();
  await p
    .getByLabel("Interfaz · Enviar mensaje · EN", { exact: true })
    .fill("Start a conversation");
  await save(p);
  await goto(p, "/preview");
  await p
    .getByRole("button", { name: "Cambiar a inglés", exact: true })
    .click();
  await expect(
    p.getByRole("button", { name: "Start a conversation", exact: true }),
  ).toHaveCount(1);
  await goto(p, "/admin/demo/appearance");
  await p.getByLabel("Habilitar Soft", { exact: true }).uncheck();
  await save(p);
  await goto(p, "/preview");
  await expect(
    p.getByRole("button", { name: "Soft", exact: true }),
  ).toHaveCount(0);
  await expect(p.locator(".site")).not.toHaveClass(/theme-soft/);
  // Responsive QA in fresh browser storage; no personal data or demo edits enter the public seed.
  for (const width of [360, 390, 768]) {
    const c = await browser.newContext({
      viewport: { width, height: 844 },
      reducedMotion: "reduce",
      isMobile: width < 701,
    });
    const m = await c.newPage();
    watch(m);
    await goto(m, "/");
    await m.getByRole("button", { name: "Soft", exact: true }).click();
    await m
      .getByRole("button", { name: "Cambiar a inglés", exact: true })
      .click();
    await expect(m.locator("canvas")).toHaveCount(0);
    assert.equal(
      await m.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await screenshot(m, "soft-mobile-" + width);
    await m.getByRole("button", { name: "Open menu", exact: true }).click();
    await m.locator('.nav-links a[href="#experience"]').click();
    await expect(m.locator("#experience")).toBeVisible();
    assert.equal(
      await m.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await c.close();
  }
  const full = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
  });
  const d = await full.newPage();
  watch(d);
  await goto(d, "/");
  await expect(d.locator(".scene canvas")).toHaveCount(1);
  await d.waitForTimeout(800);
  const distance = await d
    .locator(".intro")
    .evaluate((e) => e.getBoundingClientRect().height - innerHeight);
  for (const theme of ["Dark", "Soft"]) {
    await d.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await d.reload({ waitUntil: "networkidle" });
    await d.waitForTimeout(500);
    await d
      .locator(".intro-top")
      .getByRole("button", { name: theme, exact: true })
      .click();
    await d.waitForTimeout(500);
    for (const progress of [0, 0.55, 0.7, 0.78, 0.84, 0.9, 0.96, 0.4]) {
      await d.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        distance * progress,
      );
      await d.waitForTimeout(700);
      await expect(d.locator("#hero-name")).toHaveCSS("transform", "none");
      await expect(d.locator(".portfolio-hero")).toHaveCSS("transform", "none");
      const heroY = await d
        .locator(".portfolio-hero")
        .evaluate((e) => e.getBoundingClientRect().top);
      assert.ok(
        Math.abs(heroY - (56 + distance * (1 - progress))) < 2,
        "The hero must follow native document flow without being centered by scroll transforms",
      );
      if (progress <= 0.8)
        await expect(d.locator(".portfolio-hero")).toHaveCSS("opacity", "0");
      await screenshot(d, theme.toLowerCase() + "-intro-" + progress);
    }
    await d.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      distance,
    );
    await d.waitForTimeout(700);
    await expect(d.locator(".intro")).toHaveCount(1);
    await expect(d.locator(".intro-sticky")).toHaveCSS("visibility", "hidden");
    await expect
      .poll(async () => Math.abs((await d.evaluate(() => scrollY)) - distance))
      .toBeLessThan(2);
    const pageHeight = await d.evaluate(
      () => document.documentElement.scrollHeight,
    );
    const heroTop = await d
      .locator(".portfolio-hero")
      .evaluate((e) => e.getBoundingClientRect().top);
    await d.mouse.wheel(0, -64);
    await expect
      .poll(async () =>
        Math.abs((await d.evaluate(() => scrollY)) - (distance - 64)),
      )
      .toBeLessThan(2);
    assert.equal(
      await d.evaluate(() => document.documentElement.scrollHeight),
      pageHeight,
      "Returning to the laptop must not add or remove scroll space",
    );
    const reversedTop = await d
      .locator(".portfolio-hero")
      .evaluate((e) => e.getBoundingClientRect().top);
    assert.ok(
      Math.abs(reversedTop - heroTop - 64) < 2,
      "The first reverse scroll must move the hero only by the user's scroll delta",
    );
    await d.mouse.wheel(0, 64);
    await expect
      .poll(async () => Math.abs((await d.evaluate(() => scrollY)) - distance))
      .toBeLessThan(2);
    await expect(d.locator(".portfolio-ambient")).toHaveCSS("opacity", "1");
    await expect(d.locator(".portfolio-nav-floating")).toHaveAttribute(
      "data-visible",
      "false",
    );
    await expect(d.locator(".portfolio-hero")).toHaveCSS("transform", "none");
    await expect(d.locator(".portfolio-ambient")).toHaveCSS("opacity", "1");
    await expect(d.locator("#hero-name")).toHaveCSS("opacity", "1");
    await d
      .getByRole("button", { name: "Abrir terminal", exact: true })
      .click();
    await expect(d.locator("dialog")).toBeVisible();
    await d
      .getByRole("button", { name: "Cerrar terminal", exact: true })
      .click();
    if (theme === "Soft") {
      await d
        .locator('.portfolio-nav:not([inert]) .nav-links a[href="#experience"]')
        .click();
      await expect(d.locator(".portfolio-nav-floating")).toHaveAttribute(
        "data-visible",
        "true",
      );
      await expect
        .poll(() =>
          d
            .locator(".portfolio-nav-floating")
            .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
        )
        .toBe(12);
    }
    await d.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await d.reload({ waitUntil: "networkidle" });
    await d.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      distance * 0.7,
    );
    await d.waitForTimeout(600);
    await d
      .locator(".intro-top")
      .getByRole("button", { name: "Cambiar a inglés", exact: true })
      .click();
    await expect(d.locator("html")).toHaveAttribute("lang", "en");
    await d.waitForTimeout(600);
    await expect(d.locator(".portfolio-hero")).toHaveCSS("opacity", "0");
    await screenshot(d, theme.toLowerCase() + "-code-en");
    await d
      .locator(".intro-top")
      .getByRole("button", { name: "Switch to Spanish", exact: true })
      .click();
    // Real mesh hits: closed lid, open screen and keyboard. Empty space must not skip.
    for (const [progress, x, y] of [
      [0, 768, 614],
      [0.55, 614, 358],
      [0.55, 768, 676],
    ]) {
      await d.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await d.reload({ waitUntil: "networkidle" });
      await d.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        distance * progress,
      );
      await d.waitForTimeout(650);
      await d.mouse.click(1400, 500);
      assert.ok(
        Math.abs((await d.evaluate(() => scrollY)) - distance * progress) < 2,
        "Clicking outside the laptop must not skip the intro",
      );
      await d.mouse.move(x, y);
      await expect(d.locator(".scene canvas")).toHaveCSS("cursor", "pointer");
      await d.mouse.click(x, y);
      await d.waitForTimeout(200);
      const during = Number(
        await d.locator(".intro").getAttribute("data-intro-progress"),
      );
      assert.ok(
        during > progress && during < 0.99,
        "Laptop click must play intermediate frames instead of jumping to the end",
      );
      assert.ok(
        (await d.evaluate(() => scrollY)) > distance * progress,
        "Fast playback must advance the scroll continuously with the static hero",
      );
      await expect(d.locator(".intro-sticky")).toHaveCSS(
        "visibility",
        "visible",
      );
      if (progress === 0)
        await d.screenshot({
          path: path.join(out, theme.toLowerCase() + "-fast-forward.png"),
        });
      await expect(d.locator(".intro-sticky")).toHaveCSS(
        "visibility",
        "hidden",
      );
      await expect(d.locator(".portfolio-hero")).toHaveCSS("opacity", "1");
      await expect(d.locator("#hero-name")).toHaveCSS("transform", "none");
      await expect(d.locator(".scene canvas")).toHaveCSS("cursor", "auto");
      assert.ok(
        Math.abs((await d.evaluate(() => scrollY)) - distance) < 2,
        "Clicking the laptop must land at the final hero",
      );
    }
    await d.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await d.reload({ waitUntil: "networkidle" });
    await d.waitForTimeout(650);
    const skip = d.locator(".intro-bottom a").last();
    await skip.focus();
    await skip.press("Enter");
    await expect(d.locator(".intro-sticky")).toHaveCSS("visibility", "hidden");
    await d
      .getByRole("button", { name: "Abrir terminal", exact: true })
      .click();
    await expect(d.locator("dialog")).toBeVisible();
    await d
      .getByRole("button", { name: "Cerrar terminal", exact: true })
      .click();
  }
  assert.deepEqual(errors, []);
  const result = {
    checked: [
      "Soft default, sun/moon/globe icons and persisted preferences",
      "Soft header integrated into hero and available after scrolling",
      "bilingual sections/terminal/CV/project details",
      "admin copy editing",
      "photo framing and preview",
      "company logo/image preview and reuse",
      "disabled themes",
      "360/390/768px no overflow",
      "anonymous edit controls hidden",
      "both themes return to the laptop with fixed document height and native hero displacement",
      "hero name stays in place and hidden until the final crossfade",
      "language change during the intro preserves scroll phase",
      "laptop click plays a fast continuous intro from lid/screen/keyboard; background does not; keyboard skip and final hero remain usable",
    ],
    browserErrors: errors,
  };
  await fs.writeFile(
    "docs/update-browser-verification.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  for (const context of browser.contexts())
    for (const page of context.pages()) {
      console.log(
        "FAILURE PAGE",
        page.url(),
        (await page.locator(".editor-fields").count())
          ? await page.locator(".editor-fields").innerText()
          : await page.locator("body").innerText(),
      );
      await page.screenshot({ path: path.join(out, "failure.png") });
    }
  throw error;
} finally {
  await browser.close();
}
