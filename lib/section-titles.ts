import type { Content } from "../types/content.ts";

export const sectionTitleUpdates = [
  {
    table: "profiles",
    key: "about_title",
    previous: "Entender cómo funciona.\nConstruir lo que sigue.",
    value: "Sobre mí",
  },
  {
    table: "profiles",
    key: "about_title_en",
    previous: "Understand the foundations.\nBuild what comes next.",
    value: "About me",
  },
  {
    table: "site_settings",
    key: "experience_title",
    previous: "Experiencia que suma.",
    value: "Experiencia laboral",
  },
  {
    table: "site_settings",
    key: "experience_title_en",
    previous: "Experience that adds perspective.",
    value: "Work experience",
  },
  {
    table: "site_settings",
    key: "education_title",
    previous: "Bases sólidas.\nAprendizaje continuo.",
    value: "Formación académica",
  },
  {
    table: "site_settings",
    key: "education_title_en",
    previous: "Strong foundations.\nContinuous learning.",
    value: "Education",
  },
  {
    table: "site_settings",
    key: "projects_title",
    previous: "Ideas que toman forma.",
    value: "Proyectos listos y en proceso",
  },
  {
    table: "site_settings",
    key: "projects_title_en",
    previous: "Ideas taking shape.",
    value: "Completed and ongoing projects",
  },
  {
    table: "site_settings",
    key: "skills_title",
    previous: "Un toolkit en evolución.",
    value: "Conocimientos y herramientas",
  },
  {
    table: "site_settings",
    key: "skills_title_en",
    previous: "An evolving toolkit.",
    value: "Knowledge and tools",
  },
  {
    table: "site_settings",
    key: "gallery_title",
    previous: "Más allá del código.",
    value: "Galería",
  },
  {
    table: "site_settings",
    key: "gallery_title_en",
    previous: "Beyond the code.",
    value: "Gallery",
  },
  {
    table: "site_settings",
    key: "contact_title",
    previous: "La próxima idea empieza con una conversación.",
    value: "Contacto",
  },
  {
    table: "site_settings",
    key: "contact_title_en",
    previous: "The next idea starts with a conversation.",
    value: "Contact",
  },
] as const;

export function applySectionTitles(content: Content) {
  for (const update of sectionTitleUpdates) {
    const entry = content[update.table][0];
    if (entry && entry.data[update.key] === update.previous)
      entry.data[update.key] = update.value;
  }
}
