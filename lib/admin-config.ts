import type { Collection } from "@/types/content";
export const sections: Record<
  string,
  {
    title: string;
    description: string;
    table?: Collection;
    keys?: string[];
    single?: boolean;
  }
> = {
  dashboard: { title: "Dashboard", description: "Tu espacio. Tu recorrido." },
  profile: {
    title: "Profile",
    description: "La información que te presenta.",
    table: "profiles",
    single: true,
  },
  hero: {
    title: "Hero",
    description: "La primera impresión, en tus palabras.",
    table: "site_settings",
    single: true,
    keys: [
      "hero_statement",
      "hero_name",
      "hero_surname",
      "intro_title",
      "hero_cta",
      "hero_about_cta",
      "hero_cv_cta",
      "hero_subtitle",
      "hero_description",
      "intro_enabled",
    ],
  },
  about: {
    title: "About",
    description: "Tu manera de mirar la tecnología.",
    table: "profiles",
    single: true,
    keys: ["about_caption", "about_title", "about", "bio", "photo"],
  },
  experience: {
    title: "Experience",
    description: "El recorrido, en tus palabras.",
    table: "experiences",
  },
  education: {
    title: "Education",
    description: "Las bases de lo que viene.",
    table: "education",
  },
  projects: {
    title: "Projects",
    description: "Lo que construís, en detalle.",
    table: "projects",
  },
  skills: {
    title: "Skills",
    description: "Conocimientos que siguen creciendo.",
    table: "skills",
  },
  categories: {
    title: "Skill categories",
    description: "Organizá tu toolkit.",
    table: "skill_categories",
  },
  gallery: {
    title: "Gallery",
    description: "Momentos, imágenes y perspectivas.",
    table: "gallery_items",
  },
  social: {
    title: "Social Links",
    description: "Otras formas de conectar.",
    table: "social_links",
  },
  navigation: {
    title: "Navigation",
    description: "Ordená y nombrá las secciones.",
    table: "navigation_items",
  },
  appearance: {
    title: "Appearance",
    description: "La identidad, a tu manera.",
    table: "site_settings",
    single: true,
    keys: [
      "theme",
      "dark_enabled",
      "soft_enabled",
      "soft_background",
      "soft_primary",
      "soft_secondary",
      "soft_accent",
      "primary",
      "secondary",
      "accent",
      "background",
      "typography",
      "radius",
      "animation_intensity",
    ],
  },
  seo: {
    title: "SEO",
    description: "Cómo te encuentran y te comparten.",
    table: "seo_settings",
    single: true,
  },
  settings: {
    title: "Settings",
    description: "Textos, preferencias y respaldo.",
    table: "site_settings",
    single: true,
    keys: [
      "projects_empty_title",
      "projects_title",
      "projects_empty",
      "gallery_title",
      "gallery_empty",
      "contact_title",
      "experience_title",
      "education_title",
      "skills_title",
      "terminal_enabled",
      "contact_enabled",
      "footer",
    ],
  },
  localization: {
    title: "Localization",
    description:
      "Editá copies ES / EN en cada sección. El inglés inicial fue redactado manualmente; los textos nuevos necesitan su versión inglesa.",
    table: "site_settings",
    single: true,
  },
  media: {
    title: "Media Manager",
    description: "Subí, organizá y reutilizá tus archivos.",
    table: "media_assets",
  },
};
export const mainSections = [
  "dashboard",
  "profile",
  "hero",
  "about",
  "experience",
  "education",
  "projects",
  "skills",
  "gallery",
  "social",
  "navigation",
  "appearance",
  "seo",
  "settings",
  "localization",
  "media",
];
