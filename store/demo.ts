import { applyProfilePhoto } from "../lib/profile-photo.ts";
import { applySkillsUpdate } from "../lib/skills-update.ts";
import { applySectionTitles } from "../lib/section-titles.ts";
import { applyProfileUpdate } from "../lib/profile-update.ts";
import { seed } from "../lib/seed.ts";
import { secureGateProject } from "../lib/securegate-project.ts";
import { portfolioProject } from "../lib/portfolio-project.ts";
import { clipedProject } from "../lib/cliped-project.ts";
import { gpsProject } from "../lib/gps-project.ts";
import { audioAmplifierProject } from "../lib/audio-amplifier-project.ts";
import { collections, type Content } from "../types/content.ts";
const PROFILE_PHOTO_KEY = "mm-studio-profile-photo-v1";
const DARK_DEFAULT_KEY = "mm-studio-dark-default-v1";
const SKILLS_KEY = "mm-studio-skills-update-v1";
const SECTION_TITLES_KEY = "mm-studio-section-titles-v1";
const PROFILE_KEY = "mm-studio-profile-update-v1";
const KEY = "mm-studio-demo-v1";
const EXAMPLES_KEY = "mm-studio-project-examples-v1";
const SECUREGATE_KEY = "mm-studio-securegate-v1";
const PORTFOLIO_KEY = "mm-studio-portfolio-project-v1";
const CLIPED_KEY = "mm-studio-cliped-project-v1";
const REMOVE_EXAMPLES_KEY = "mm-studio-remove-project-examples-v1";
const GPS_KEY = "mm-studio-gps-project-v1";
const AUDIO_KEY = "mm-studio-audio-amplifier-project-v1";
export function readDemo(): Content {
  try {
    const data = localStorage.getItem(KEY);
    const needsProfilePhoto = data && !localStorage.getItem(PROFILE_PHOTO_KEY);
    const needsDarkDefault = data && !localStorage.getItem(DARK_DEFAULT_KEY);
    const needsSkillsUpdate = data && !localStorage.getItem(SKILLS_KEY);
    const needsSectionTitles =
      data && !localStorage.getItem(SECTION_TITLES_KEY);
    const needsProfileUpdate = data && !localStorage.getItem(PROFILE_KEY);
    const needsSecureGate = data && !localStorage.getItem(SECUREGATE_KEY);
    const needsPortfolio = data && !localStorage.getItem(PORTFOLIO_KEY);
    const needsCliped = data && !localStorage.getItem(CLIPED_KEY);
    const needsGps = data && !localStorage.getItem(GPS_KEY);
    const needsAudio = data && !localStorage.getItem(AUDIO_KEY);
    const needsRemoveExamples =
      data && !localStorage.getItem(REMOVE_EXAMPLES_KEY);
    const content: Content = data
      ? { ...structuredClone(seed), ...JSON.parse(data) }
      : structuredClone(seed);
    if (needsSecureGate) {
      if (
        !content.projects.some(
          (project) =>
            project.id === secureGateProject.id ||
            project.data.slug === secureGateProject.data.slug,
        )
      ) {
        for (const project of content.projects) project.sort_order += 1;
        content.projects.unshift({
          ...structuredClone(secureGateProject),
          sort_order: 0,
        });
      }
      saveDemo(content);
    }
    if (needsPortfolio) {
      if (
        !content.projects.some(
          (project) =>
            project.id === portfolioProject.id ||
            project.data.slug === portfolioProject.data.slug,
        )
      ) {
        const secureGate = content.projects.find(
          (project) => project.data.slug === secureGateProject.data.slug,
        );
        const order = secureGate ? secureGate.sort_order + 1 : 0;
        for (const project of content.projects)
          if (project.sort_order >= order) project.sort_order += 1;
        content.projects.push({
          ...structuredClone(portfolioProject),
          sort_order: order,
        });
      }
      saveDemo(content);
    }
    if (needsCliped) {
      if (
        !content.projects.some(
          (project) =>
            project.id === clipedProject.id ||
            project.data.slug === clipedProject.data.slug,
        )
      ) {
        const portfolio = content.projects.find(
          (project) => project.data.slug === portfolioProject.data.slug,
        );
        const secureGate = content.projects.find(
          (project) => project.data.slug === secureGateProject.data.slug,
        );
        const previous = portfolio || secureGate;
        const order = previous ? previous.sort_order + 1 : 0;
        for (const project of content.projects)
          if (project.sort_order >= order) project.sort_order += 1;
        content.projects.push({
          ...structuredClone(clipedProject),
          sort_order: order,
        });
      }
      saveDemo(content);
    }
    if (needsGps) {
      if (
        !content.projects.some(
          (project) =>
            project.id === gpsProject.id ||
            project.data.slug === gpsProject.data.slug,
        )
      ) {
        const lastOrder = Math.max(
          -1,
          ...content.projects.map((project) => project.sort_order),
        );
        content.projects.push({
          ...structuredClone(gpsProject),
          sort_order: lastOrder + 1,
        });
      }
      saveDemo(content);
    }
    if (needsAudio) {
      if (
        !content.projects.some(
          (project) =>
            project.id === audioAmplifierProject.id ||
            project.data.slug === audioAmplifierProject.data.slug,
        )
      ) {
        const lastOrder = Math.max(
          -1,
          ...content.projects.map((project) => project.sort_order),
        );
        content.projects.push({
          ...structuredClone(audioAmplifierProject),
          sort_order: lastOrder + 1,
        });
      }
      saveDemo(content);
    }
    if (needsRemoveExamples) {
      const removed = new Set(
        content.projects
          .filter((project) => project.data.is_demo === true)
          .map((project) => project.id),
      );
      content.projects = content.projects.filter(
        (project) => !removed.has(project.id),
      );
      for (const table of ["project_images", "project_technologies"] as const)
        content[table] = content[table].filter(
          (entry) => !removed.has(String(entry.data.project_id || "")),
        );
      saveDemo(content);
    }
    if (needsProfileUpdate) {
      applyProfileUpdate(content);
      saveDemo(content);
    }
    if (needsSectionTitles) {
      applySectionTitles(content);
      saveDemo(content);
    }
    if (needsSkillsUpdate) {
      applySkillsUpdate(content);
      saveDemo(content);
    }
    if (needsDarkDefault) {
      const settings = content.site_settings[0];
      if (settings?.data.theme === "Soft") settings.data.theme = "Apple Dark";
      saveDemo(content);
    }
    if (needsProfilePhoto) {
      applyProfilePhoto(content);
      saveDemo(content);
    }
    for (const table of collections)
      for (const entry of content[table]) {
        const original = seed[table].find((e) => e.id === entry.id);
        if (!original) continue;
        for (const [key, value] of Object.entries(original.data)) {
          if (key in entry.data) continue;
          if (
            key.endsWith("_en") &&
            JSON.stringify(entry.data[key.slice(0, -3)]) ===
              JSON.stringify(original.data[key.slice(0, -3)])
          )
            entry.data[key] = value;
          else if (
            table === "site_settings" &&
            (key.startsWith("soft_") || key === "dark_enabled")
          )
            entry.data[key] = value;
        }
      }
    return content;
  } catch {
    return structuredClone(seed);
  }
}
export function saveDemo(content: Content) {
  localStorage.setItem(PROFILE_PHOTO_KEY, "1");
  localStorage.setItem(DARK_DEFAULT_KEY, "1");
  localStorage.setItem(SKILLS_KEY, "1");
  localStorage.setItem(SECTION_TITLES_KEY, "1");
  localStorage.setItem(PROFILE_KEY, "1");
  localStorage.setItem(KEY, JSON.stringify(content));
  localStorage.setItem(EXAMPLES_KEY, "1");
  localStorage.setItem(SECUREGATE_KEY, "1");
  localStorage.setItem(PORTFOLIO_KEY, "1");
  localStorage.setItem(CLIPED_KEY, "1");
  localStorage.setItem(REMOVE_EXAMPLES_KEY, "1");
  localStorage.setItem(GPS_KEY, "1");
  localStorage.setItem(AUDIO_KEY, "1");
}
export function resetDemo() {
  localStorage.removeItem(PROFILE_PHOTO_KEY);
  localStorage.removeItem(DARK_DEFAULT_KEY);
  localStorage.removeItem(SKILLS_KEY);
  localStorage.removeItem(SECTION_TITLES_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(KEY);
  localStorage.removeItem(EXAMPLES_KEY);
  localStorage.removeItem(SECUREGATE_KEY);
  localStorage.removeItem(PORTFOLIO_KEY);
  localStorage.removeItem(CLIPED_KEY);
  localStorage.removeItem(REMOVE_EXAMPLES_KEY);
  localStorage.removeItem(GPS_KEY);
  localStorage.removeItem(AUDIO_KEY);
}
