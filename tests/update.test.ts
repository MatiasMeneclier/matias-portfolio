import test from "node:test";
import assert from "node:assert/strict";
import { seed } from "../lib/seed.ts";
import { localizeContent, localizeEntry } from "../lib/localization.ts";
import { validateEntry } from "../lib/schema.ts";
import {
  introPhase,
  dampIntroProgress,
  INTRO_SCROLL_VIEWPORTS,
} from "../lib/intro-motion.ts";
test("English content preserves identity and category relationships", () => {
  const en = localizeContent(seed, "en"),
    es = localizeContent(seed, "es");
  assert.equal(en.profiles[0].data.first_name, "Matias Andres");
  assert.equal(en.experiences[0].data.role, "Sales Associate");
  assert.match(String(en.experiences[0].data.description), /Advised customers/);
  for (const c of [en, es])
    for (const skill of c.skills)
      assert.ok(
        c.skill_categories.some((cat) => cat.data.name === skill.data.category),
      );
  assert.equal(seed.profiles[0].data.degree, "Ingeniería Informática");
  const customized = structuredClone(seed);
  customized.skill_categories[0].data.name_en = "Software Development";
  const localized = localizeContent(customized, "en");
  assert.equal(localized.skills[0].data.category, "Software Development");
});
test("Edited translations take precedence; blank translations retain base copy", () => {
  const entry = {
    ...seed.profiles[0],
    data: { ...seed.profiles[0].data, bio_en: "Custom engineering bio" },
  };
  assert.equal(localizeEntry(entry, "en").data.bio, "Custom engineering bio");
  entry.data.bio_en = "";
  assert.equal(localizeEntry(entry, "en").data.bio, seed.profiles[0].data.bio);
});
test("Localized admin content validates and retains media URL protection", () => {
  validateEntry(
    "profiles",
    {
      ...seed.profiles[0],
      data: { ...seed.profiles[0].data, photo_position: "50% 25%" },
    },
    true,
  );
  const experience = {
    ...seed.experiences[0],
    data: {
      ...seed.experiences[0].data,
      square_logo: "/logo.png",
      company_image: "/office.png",
      role_en: "Sales Associate",
    },
  };
  validateEntry("experiences", experience);
  assert.throws(() =>
    validateEntry("experiences", {
      ...experience,
      data: { ...experience.data, company_image: "javascript:alert(1)" },
    }),
  );
  assert.throws(() =>
    validateEntry("site_settings", {
      ...seed.site_settings[0],
      data: {
        ...seed.site_settings[0].data,
        dark_enabled: false,
        soft_enabled: false,
      },
    }),
  );
});
test("Scroll phases are bounded, continuous and reversible at every checkpoint", () => {
  for (let n = 0; n <= 100; n++)
    for (const value of Object.values(introPhase(n / 100)))
      assert.ok(value >= 0 && value <= 1);
  assert.equal(introPhase(0.57).open, 1);
  assert.equal(introPhase(0.74).code, 1);
  assert.equal(introPhase(0.98).details, 1);
  assert.equal(introPhase(1).canvas, 0);
  const checkpoint = introPhase(0.8);
  introPhase(1);
  assert.deepEqual(introPhase(0.8), checkpoint);
});

test("The background fades continuously in both directions without an endpoint switch", () => {
  assert.equal(introPhase(0.8).background, 0);
  assert.equal(introPhase(1).background, 1);
  assert.ok(introPhase(0.96).background > 0 && introPhase(0.96).background < 1);
  for (let n = 800; n < 1000; n++) {
    const a = introPhase(n / 1000),
      b = introPhase((n + 1) / 1000);
    assert.ok(b.background >= a.background);
    assert.ok(b.background - a.background < 0.02);
    assert.ok(Math.abs(b.layer - a.layer) < 0.03);
  }
  const before = introPhase(0.999);
  assert.ok(before.background > 0.999 && before.layer < 0.001);
});

test("Intro responds early and damping is independent of refresh rate without overshoot", () => {
  assert.ok(INTRO_SCROLL_VIEWPORTS < 2);
  assert.ok(introPhase(0.1).open > 0);
  assert.equal(introPhase(0.58).code, 1);
  for (let n = 0; n <= 1000; n++) {
    const phase = introPhase(n / 1000);
    assert.ok(
      phase.preview === 0 || phase.hero === 0,
      "The screen identity clears before the real heading appears",
    );
  }
  for (const [start, target] of [
    [0, 1],
    [1, 0],
    [0.82, 0.31],
  ]) {
    let at60 = start,
      at120 = start;
    for (let i = 0; i < 6; i++) at60 = dampIntroProgress(at60, target, 100 / 6);
    for (let i = 0; i < 12; i++)
      at120 = dampIntroProgress(at120, target, 100 / 12);
    assert.ok(Math.abs(at60 - at120) < 0.000001);
    assert.ok(
      at60 >= Math.min(start, target) && at60 <= Math.max(start, target),
    );
    for (let i = 0; i < 60; i++) at60 = dampIntroProgress(at60, target, 16);
    assert.equal(at60, target);
  }
  const movingDown = dampIntroProgress(0.5, 0.9, 16);
  const reversed = dampIntroProgress(movingDown, 0.2, 16);
  assert.ok(reversed < movingDown && reversed > 0.2);
});
