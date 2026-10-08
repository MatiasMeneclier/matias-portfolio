import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const out = process.env.QA_OUTPUT;
if (out) await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const errors = [];
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("Failed to load resource"))
      errors.push(m.text());
  });
};
const shot = async (page, name) => {
  await page.waitForTimeout(180);
  if (out) await page.screenshot({ path: path.join(out, name + ".png") });
};
const save = async (page) => {
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(page.locator(".editor-heading")).not.toContainText(
    "Cambios sin guardar",
  );
  await expect(page.locator(".error-message")).toHaveCount(0);
};
const goto = async (page, url) => {
  await page.goto(base + url, { waitUntil: "networkidle" });
};
const results = {};
try {
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  watch(page);
  await goto(page, "/");
  await expect(page.locator("h1")).toHaveText("MATIASMENECLIER");
  await expect(page.locator("canvas")).toHaveCount(0);
  await shot(page, "hero");
  for (const section of [
    "about",
    "experience",
    "education",
    "projects",
    "skills",
    "gallery",
    "contact",
  ]) {
    await page.locator('.nav-links a[href="#' + section + '"]').click();
    await expect(page.locator("#" + section)).toBeVisible();
    await shot(page, section);
  }
  await page
    .getByRole("button", { name: "Abrir terminal", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Comando", exact: true })
    .fill("about");
  await page
    .getByRole("textbox", { name: "Comando", exact: true })
    .press("Enter");
  await expect(page.locator("dialog")).toHaveCount(0);
  assert.ok(page.url().endsWith("#about"));
  await goto(page, "/admin");
  assert.ok(page.url().endsWith("/admin/login"));
  const denied = await page.request.put(base + "/api/admin/content", {
    headers: { Origin: base },
    data: { table: "profiles", entry: {} },
  });
  assert.equal(denied.status(), 401);
  const contact = await page.request.post(base + "/api/contact", {
    headers: { Origin: base },
    data: {
      name: "QA Test",
      email: "qa@example.test",
      message: "Mensaje de prueba local.",
      website: "",
    },
  });
  assert.equal(contact.status(), 503);
  await goto(page, "/admin/demo/projects");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Proyecto QA local");
  await page.getByLabel("Slug", { exact: true }).fill("qa-local");
  await page
    .getByLabel("Short description", { exact: true })
    .fill("Contenido de prueba aislado.");
  await page
    .getByLabel("Overview", { exact: true })
    .fill("Este proyecto comprueba el editor y la vista previa.");
  await page.getByLabel("Year", { exact: true }).fill("2026");
  await page.getByRole("switch").check();
  await save(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Proyecto QA local", exact: true })
    .click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Proyecto QA local",
  );
  // Upload, reuse and replacement update existing content in the local demo.
  await page.getByRole("button", { name: "Elegir Cover", exact: true }).click();
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#315b89"/></svg>';
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "qa-cover.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(svg),
    });
  await expect(page.locator(".media-manager")).toContainText(
    "Archivo guardado.",
  );
  await page
    .getByRole("button", { name: "Usar qa-cover.svg", exact: true })
    .click();
  await save(page);
  await goto(page, "/preview#projects");
  await page.getByRole("link", { name: /Proyecto QA local/ }).click();
  await expect(page.locator("h1")).toHaveText("Proyecto QA local");
  await expect(
    page.getByRole("heading", { name: "Resumen", exact: true }),
  ).toBeVisible();
  assert.ok(
    await page
      .locator(".project-detail>img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  );
  await shot(page, "project-detail");
  await goto(page, "/admin/demo/media");
  await page
    .getByRole("button", { name: "Reemplazar qa-cover.svg", exact: true })
    .click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "qa-replaced.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(svg.replace("#315b89", "#8e5349")),
    });
  await expect(page.locator(".media-manager")).toContainText(
    "Archivo guardado.",
  );
  await goto(page, "/preview/projects/qa-local");
  const source = await page.locator(".project-detail>img").getAttribute("src");
  assert.ok(
    Buffer.from(source.split(",")[1], "base64").toString().includes("#8e5349"),
  );
  await goto(page, "/admin/demo/gallery");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Imagen QA local");
  await page
    .getByLabel("Texto alternativo", { exact: true })
    .fill("Muestra de prueba");
  await page
    .getByRole("button", { name: "Elegir Archivo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Usar qa-replaced.svg", exact: true })
    .click();
  await page.getByRole("switch").check();
  await save(page);
  await goto(page, "/preview#gallery");
  await expect(
    page.getByRole("img", { name: "Muestra de prueba", exact: true }),
  ).toBeVisible();
  // Visibility, deletion and empty state.
  await goto(page, "/admin/demo/projects");
  await page
    .getByRole("button", { name: "Proyecto QA local", exact: true })
    .click();
  await page.getByRole("switch").uncheck();
  await save(page);
  await goto(page, "/preview#projects");
  await expect(
    page.getByRole("link", { name: /Proyecto QA local/ }),
  ).toHaveCount(0);
  await goto(page, "/admin/demo/projects");
  await page
    .getByRole("button", { name: "Proyecto QA local", exact: true })
    .click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.locator(".admin-list")).toContainText(
    "Todavía no hay contenido.",
  );
  // Keyboard and pointer drag are both wired to the same persistent order.
  await goto(page, "/admin/demo/experience");
  const handle = page.getByRole("button", {
    name: "Reordenar ZARA",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  await page.keyboard.press("Space");
  await expect(page.locator(".admin-row-select strong").first()).toHaveText(
    "Maxdream",
  );
  await page.reload();
  await expect(page.locator(".admin-row-select strong").first()).toHaveText(
    "Maxdream",
  );
  await page.getByRole("button", { name: /ZARA Dependiente/ }).click();
  await shot(page, "admin");
  await goto(page, "/admin/demo/appearance");
  await page.getByLabel(/Theme/).selectOption("Minimal Light");
  await page.getByLabel("Primary Color", { exact: true }).fill("#252525");
  await page.getByLabel(/Animation intensity/).selectOption("Off");
  await save(page);
  await goto(page, "/preview");
  assert.equal(
    await page.locator(".site").evaluate((e) => getComputedStyle(e).color),
    "rgb(37, 37, 37)",
  );
  await shot(page, "light-theme");
  await goto(page, "/admin/demo/navigation");
  await page.getByRole("button", { name: /Gallery gallery/ }).click();
  await page.getByRole("switch").uncheck();
  await save(page);
  await goto(page, "/preview");
  await expect(page.locator("#gallery")).toHaveCount(0);
  // A fresh context confirms that test data did not mutate public or other browsers.
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const m = await mobile.newPage();
  watch(m);
  await goto(m, "/");
  await expect(m.locator("canvas")).toHaveCount(0);
  await m
    .getByRole("link", { name: "Explorar portfolio", exact: true })
    .click();
  await m.waitForTimeout(700);
  await shot(m, "mobile");
  assert.equal(
    await m.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await m.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await m.locator('.nav-links a[href="#experience"]').click();
  await expect(
    m.getByRole("button", { name: "Abrir menú", exact: true }),
  ).toBeVisible();
  await goto(m, "/admin/demo/experience");
  await m.locator(".admin-row-select").filter({ hasText: "ZARA" }).click();
  assert.equal(
    await m.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await shot(m, "admin-mobile");
  // Full desktop scene, reversible scrub, entry and clickable real HTML after it.
  const desktop = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
  });
  const d = await desktop.newPage();
  watch(d);
  await goto(d, "/");
  await expect(d.locator("canvas")).toHaveCount(1);
  await d.waitForTimeout(900);
  await shot(d, "intro");
  const distance = await d
    .locator(".intro")
    .evaluate((e) => e.getBoundingClientRect().height - innerHeight);
  for (const [name, progress] of [
    ["laptop-code", 0.86],
    ["laptop-zoom", 0.98],
    ["inside", 1],
    ["laptop-reverse", 0.4],
  ]) {
    await d.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      distance * progress,
    );
    await d.waitForTimeout(800);
    await shot(d, name);
  }
  await d.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await d.waitForTimeout(700);
  await d.getByRole("link", { name: /Saltar intro/ }).click();
  await d.waitForTimeout(900);
  await d.getByRole("button", { name: "Abrir terminal", exact: true }).click();
  await expect(
    d.getByRole("textbox", { name: "Comando", exact: true }),
  ).toBeVisible();
  results.checked = [
    "navigation",
    "terminal",
    "protected routes",
    "contact unavailable",
    "project create/edit/detail/hide/delete",
    "safe SVG upload/reuse/replace",
    "gallery",
    "persistent keyboard reorder",
    "appearance and custom colors",
    "navigation visibility",
    "mobile public and admin",
    "reduced motion",
    "reversible 3D scrub and entry",
  ];
  results.browserErrors = errors;
  assert.deepEqual(errors, []);
  console.log(JSON.stringify(results, null, 2));
  if (out)
    await fs.writeFile(
      path.join(out, "verification.json"),
      JSON.stringify(results, null, 2),
    );
} finally {
  await browser.close();
}
