import test from "node:test";
import assert from "node:assert/strict";
import { buildCV } from "../lib/cv.ts";
import { withCVDefaults } from "../lib/cv-defaults.ts";
import { validateEntry } from "../lib/schema.ts";
import { seed } from "../lib/seed.ts";

test("CV uses confirmed contact, Cambridge B2 and software projects without altering portfolio data", () => {
  const source = structuredClone(seed);
  const before = structuredClone(source);
  const cv = buildCV(source, "es");
  assert.deepEqual(source, before);
  assert.equal(source.projects.length, 5);
  assert.ok(
    cv.contact.some((item) => item.label === "matimeneclier@gmail.com"),
  );
  assert.match(
    cv.skills.find((item) => item.label === "Idiomas")!.text,
    /B2 First/,
  );
  assert.deepEqual(
    cv.sections[1].entries.map((entry) => entry.title),
    ["secureGate", "Portfolio personal", "Cliped"],
  );
  assert.equal(cv.sections[0].entries[0].date, "2024 - Actualidad");
  assert.doesNotMatch(
    JSON.stringify(cv),
    /Argentino|21 años|Harvard University|Natural Sciences \/ Ciencias Naturales/,
  );
});

test("admin CV overrides and explicit exclusions survive defaults and localization", () => {
  const source = structuredClone(seed);
  source.projects[0].data.cv_bullets_es = ["Aporte actualizado en español."];
  source.projects[0].data.cv_bullets_en = ["Updated contribution in English."];
  source.projects[1].data.cv_exclude = true;
  source.profiles[0].data.cv_languages_en = "Updated language certificate.";
  source.profiles[0].data.cv_technical = [];
  source.profiles[0].data.cv_technical_en = [];
  const cv = buildCV(source, "en");
  assert.deepEqual(cv.sections[1].entries[0].bullets, [
    "Updated contribution in English.",
  ]);
  assert.equal(cv.sections[1].entries.length, 2);
  assert.equal(
    cv.skills.find((row) => row.label === "Languages")!.text,
    "Updated language certificate.",
  );
  assert.ok(!cv.skills.some((row) => row.label === "Programming"));
  assert.deepEqual(buildCV(source, "es").sections[1].entries[0].bullets, [
    "Aporte actualizado en español.",
  ]);
});

test("new visible projects use their own copy; hidden or fictional records never enter the CV", () => {
  const source = structuredClone(seed);
  source.projects.push({
    id: "30000000-0000-4000-8000-000000000001",
    sort_order: 6,
    is_visible: true,
    data: {
      title: "Proyecto nuevo",
      title_en: "New project",
      slug: "nuevo",
      year: "2027",
      short_description: "Nuevo aporte.",
      short_description_en: "New contribution.",
      github: "javascript:alert(1)",
    },
  });
  source.projects[0].is_visible = false;
  source.projects[1].data.is_demo = true;
  const entries = buildCV(source, "en").sections[1].entries;
  assert.deepEqual(
    entries.map((entry) => entry.title),
    ["New project", "Cliped"],
  );
  assert.deepEqual(entries[0].bullets, ["New contribution."]);
  assert.equal(entries[0].link, undefined);
});

test("experience remains reverse chronological even when portfolio sort order differs", () => {
  const source = structuredClone(seed);
  source.experiences.reverse();
  source.experiences.forEach((entry, index) => (entry.sort_order = index));
  const jobs = buildCV(source, "en").sections[2].entries;
  assert.deepEqual(
    jobs.map((entry) => entry.title),
    ["ZARA", "Maxdream", "Air Europa"],
  );
  assert.equal(jobs[0].date, "May 2025 - Feb 2026");
});

test("all default CV fields can be saved through the existing admin validator", () => {
  const data = withCVDefaults(seed);
  for (const table of [
    "profiles",
    "experiences",
    "education",
    "projects",
  ] as const) {
    for (const entry of data[table])
      assert.doesNotThrow(() => validateEntry(table, entry));
  }
});
