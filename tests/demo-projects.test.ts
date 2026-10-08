import test from "node:test";
import assert from "node:assert/strict";
import { profileCopyUpdates, databaseSkill } from "../lib/profile-update.ts";
import { seed } from "../lib/seed.ts";
import { projectExamples } from "../lib/project-examples.ts";
import { secureGateProject } from "../lib/securegate-project.ts";
import { portfolioProject } from "../lib/portfolio-project.ts";
import { clipedProject } from "../lib/cliped-project.ts";
import { gpsProject } from "../lib/gps-project.ts";
import { audioAmplifierProject } from "../lib/audio-amplifier-project.ts";
import { readDemo, saveDemo } from "../store/demo.ts";
import { visible } from "../types/content.ts";

test("existing demos receive real projects once while preserving edits and deletions", () => {
  const values = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  try {
    const old = structuredClone(seed);
    old.projects = structuredClone(projectExamples);
    old.projects[0].data.title = "My edited project";
    old.projects[0].data.is_demo = false;
    values.set("mm-studio-demo-v1", JSON.stringify(old));

    const updated = readDemo();
    assert.equal(updated.projects.length, 6);
    assert.equal(visible(updated.projects)[0].id, secureGateProject.id);
    assert.equal(visible(updated.projects)[1].id, portfolioProject.id);
    assert.equal(visible(updated.projects)[2].id, clipedProject.id);
    assert.ok(updated.projects.every((p) => p.sort_order >= 0));
    assert.equal(
      updated.projects.find((p) => p.id === old.projects[0].id)?.data.title,
      "My edited project",
    );
    assert.equal(readDemo().projects.length, 6);
    assert.ok(updated.projects.every((p) => p.data.is_demo !== true));

    updated.projects = updated.projects.filter(
      (p) =>
        p.id !== secureGateProject.id &&
        p.id !== portfolioProject.id &&
        p.id !== clipedProject.id &&
        p.id !== gpsProject.id &&
        p.id !== audioAmplifierProject.id,
    );
    saveDemo(updated);
    assert.equal(readDemo().projects.length, 1);

    values.clear();
    const oldProfile = structuredClone(seed);
    for (const update of profileCopyUpdates)
      oldProfile[update.table][0].data[update.key] = update.previous;
    oldProfile.profiles[0].data.bio = "My customized biography";
    oldProfile.skills = oldProfile.skills.filter(
      (entry) => entry.id !== databaseSkill.id,
    );
    values.set("mm-studio-demo-v1", JSON.stringify(oldProfile));
    const refreshed = readDemo();
    assert.equal(refreshed.profiles[0].data.bio, "My customized biography");
    assert.equal(refreshed.profiles[0].data.about, seed.profiles[0].data.about);
    assert.equal(
      refreshed.site_settings[0].data.hero_description_en,
      seed.site_settings[0].data.hero_description_en,
    );
    assert.equal(
      refreshed.skills.filter((entry) => entry.id === databaseSkill.id).length,
      1,
    );
    refreshed.skills = refreshed.skills.filter(
      (entry) => entry.id !== databaseSkill.id,
    );
    saveDemo(refreshed);
    assert.ok(
      !readDemo().skills.some((entry) => entry.id === databaseSkill.id),
    );

    values.clear();
    const customized = structuredClone(seed);
    customized.projects[0].id = "30000000-0000-4000-8000-000000000001";
    customized.projects[0].data.title = "My secureGate title";
    values.set("mm-studio-demo-v1", JSON.stringify(customized));
    const preserved = readDemo();
    assert.equal(preserved.projects.length, 5);
    assert.equal(preserved.projects[0].data.title, "My secureGate title");
    assert.equal(preserved.projects[0].id, customized.projects[0].id);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
