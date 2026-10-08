import { z } from "zod";
import { collections, type Collection, type Field } from "../types/content.ts";
import { localizedKeys, copy } from "./localization.ts";
import { sanitizeSVG } from "./media.ts";
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  options?: string[],
): Field => ({ key, label, type, options });
export const fields: Record<Collection, Field[]> = {
  profiles: [
    f("first_name", "Nombre"),
    f("last_name", "Apellido"),
    f("age", "Edad", "number"),
    f("nationality", "Nacionalidad"),
    f("location", "Ubicación"),
    f("short_location", "Ubicación breve"),
    f("headline", "Headline", "textarea"),
    f("degree", "Carrera"),
    f("university", "Universidad"),
    f("photo", "Foto personal (portada)", "media"),
    f("photo_position", "Encuadre de la foto", "select", [
      "50% 50%",
      "50% 25%",
      "50% 0%",
      "25% 50%",
      "75% 50%",
    ]),
    f("bio", "Biografía", "textarea"),
    f("about_title", "Título de About"),
    f("about_caption", "Texto junto a About", "textarea"),
    f("about", "Sobre mí", "textarea"),
    f("email", "Email", "email"),
    f("phone", "Teléfono"),
    f("linkedin", "LinkedIn", "url"),
    f("github", "GitHub", "url"),
    f("instagram", "Instagram", "url"),
    f("cv", "CV PDF", "media"),
    f("cv_email", "CV · Email de contacto", "email"),
    f("cv_website", "CV · Portfolio publicado", "url"),
    f("cv_technical", "CV · Conocimientos (Etiqueta: texto por línea)", "list"),
    f("cv_languages", "CV · Idiomas y certificación"),
    f("cv_activities", "CV · Actividades e intereses"),
  ],
  site_settings: [
    f("hero_statement", "Texto lateral del hero", "textarea"),
    f("hero_name", "Nombre en el hero"),
    f("hero_surname", "Apellido en el hero"),
    f("intro_title", "Título inicial"),
    f("hero_subtitle", "Subtítulo"),
    f("hero_cta", "CTA de proyectos"),
    f("hero_about_cta", "CTA Sobre mí"),
    f("hero_cv_cta", "CTA del CV"),
    f("hero_description", "Descripción", "textarea"),
    f("projects_title", "Título de Projects"),
    f("projects_empty_title", "Título sin proyectos"),
    f("projects_empty", "Mensaje sin proyectos"),
    f("gallery_title", "Título de Gallery"),
    f("gallery_empty", "Mensaje sin imágenes"),
    f("contact_title", "Título de Contact"),
    f("experience_title", "Título de Experience"),
    f("education_title", "Título de Education"),
    f("skills_title", "Título de Skills"),
    f("theme", "Theme", "select", [
      "Soft",
      "Apple Dark",
      "Minimal Dark",
      "Minimal Light",
      "Developer",
    ]),
    f("dark_enabled", "Habilitar Dark", "checkbox"),
    f("soft_enabled", "Habilitar Soft", "checkbox"),
    f("soft_background", "Soft · fondo", "color"),
    f("soft_primary", "Soft · texto", "color"),
    f("soft_secondary", "Soft · texto secundario", "color"),
    f("soft_accent", "Soft · acento", "color"),
    f("primary", "Primary Color", "color"),
    f("secondary", "Secondary Color", "color"),
    f("accent", "Accent", "color"),
    f("background", "Background", "color"),
    f("typography", "Typography", "select", ["System", "Inter", "Mono"]),
    f("radius", "Border Radius", "number"),
    f("animation_intensity", "Animation intensity", "select", [
      "Full",
      "Subtle",
      "Off",
    ]),
    f("intro_enabled", "Experiencia de entrada", "checkbox"),
    f("terminal_enabled", "Terminal", "checkbox"),
    f("footer", "Texto de pie"),
    f("contact_enabled", "Formulario de contacto", "checkbox"),
  ],
  navigation_items: [
    f("label", "Etiqueta"),
    f("section", "Sección", "select", [
      "about",
      "experience",
      "education",
      "projects",
      "skills",
      "gallery",
      "contact",
    ]),
    f("filename", "Nombre de archivo"),
  ],
  experiences: [
    f("company", "Company"),
    f("role", "Role"),
    f("logo", "Logo anterior (compatibilidad)", "media"),
    f("square_logo", "Logo cuadrado", "media"),
    f("company_image", "Foto de la empresa", "media"),
    f("start", "Start date", "date"),
    f("end", "End date", "date"),
    f("current", "Current job", "checkbox"),
    f("duration", "Duración"),
    f("location", "Location"),
    f("work_mode", "Work mode", "select", ["Presencial", "Híbrido", "Remoto"]),
    f("employment_type", "Employment type"),
    f("description", "Description (un párrafo por línea)", "textarea"),
    f("skills", "Skills", "list"),
    f("website", "Website", "url"),
    f("cv_bullets", "CV · Logros y tareas (un punto por línea)", "list"),
    f("cv_exclude", "Excluir del CV", "checkbox"),
  ],
  education: [
    f("institution", "Institution"),
    f("degree", "Degree"),
    f("field", "Field"),
    f("start", "Start"),
    f("end", "End"),
    f("current", "Current", "checkbox"),
    f("logo", "Logo", "media"),
    f("description", "Description", "textarea"),
    f("skills", "Skills", "list"),
    f("cv_note", "CV · Formación relevante", "textarea"),
    f("cv_exclude", "Excluir del CV", "checkbox"),
  ],
  projects: [
    f("title", "Title"),
    f("slug", "Slug"),
    f("cover", "Cover", "media"),
    f("screenshots", "Screenshots (URL por línea)", "list"),
    f("video", "Video", "media"),
    f("short_description", "Short description", "textarea"),
    f("long_description", "Overview", "textarea"),
    f("problem", "Problem", "textarea"),
    f("solution", "Solution", "textarea"),
    f("architecture", "Architecture", "textarea"),
    f("challenges", "Challenges", "textarea"),
    f("results", "Results", "textarea"),
    f("technologies", "Technologies", "list"),
    f("github", "GitHub", "url"),
    f("demo", "Demo", "url"),
    f("year", "Year"),
    f("date", "Fecha", "date"),
    f("category", "Category"),
    f("status", "Status", "select", [
      "En desarrollo",
      "Publicado",
      "Archivado",
    ]),
    f("featured", "Featured", "checkbox"),
    f("is_demo", "Proyecto ficticio de ejemplo", "checkbox"),
    f("cv_role", "CV · Participación y estado"),
    f("cv_bullets", "CV · Aportes (un punto por línea)", "list"),
    f("cv_technologies", "CV · Tecnologías", "list"),
    f("cv_exclude", "Excluir del CV", "checkbox"),
  ],
  project_images: [
    f("project_id", "Proyecto ID"),
    f("url", "Imagen", "media"),
    f("alt", "Texto alternativo"),
  ],
  project_technologies: [
    f("project_id", "Proyecto ID"),
    f("name", "Tecnología"),
  ],
  skills: [
    f("name", "Skill"),
    f("category", "Categoría"),
    f("icon", "Icono", "media"),
  ],
  skill_categories: [f("name", "Nombre")],
  gallery_items: [
    f("title", "Título"),
    f("url", "Archivo", "media"),
    f("alt", "Texto alternativo"),
    f("caption", "Descripción", "textarea"),
    f("kind", "Tipo", "select", ["image", "video"]),
  ],
  social_links: [f("label", "Nombre"), f("url", "URL", "url")],
  seo_settings: [
    f("title", "Page title"),
    f("description", "Description", "textarea"),
    f("keywords", "Keywords", "list"),
    f("og_image", "OG Image", "media"),
    f("favicon", "Favicon", "media"),
  ],
  media_assets: [
    f("name", "Nombre"),
    f("url", "URL", "url"),
    f("path", "Ruta"),
    f("type", "Tipo"),
    f("alt", "Texto alternativo"),
  ],
};
for (const [key, label] of Object.entries(copy.es)) {
  const fieldKey = "ui_" + key;
  localizedKeys.add(fieldKey);
  fields.site_settings.push(f(fieldKey, "Interfaz · " + label, "textarea"));
}
// Localized content remains in the existing JSONB records; no duplicate collections.
for (const table of collections) {
  const translated = fields[table].filter(
    (field) =>
      localizedKeys.has(field.key) &&
      ![
        "media",
        "url",
        "email",
        "checkbox",
        "number",
        "color",
        "date",
      ].includes(field.type || ""),
  );
  for (const field of translated)
    for (const locale of ["es", "en"])
      fields[table].push({
        ...field,
        key: field.key + "_" + locale,
        label: field.label + " · " + locale.toUpperCase(),
        type: field.type === "select" ? "text" : field.type,
        options: undefined,
      });
}
export const collectionSchema = z.enum(collections);
export const safeURL = (value: string): boolean => {
  if (!value) return true;
  if (/[\u0000-\u0020\\]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
export const safeDataURL = (value: string) => {
  if (
    /^data:(image\/(png|jpeg|webp|avif)|video\/(mp4|webm)|application\/pdf);base64,[A-Za-z0-9+/=]+$/.test(
      value,
    )
  )
    return true;
  if (value.startsWith("data:image/svg+xml;base64,")) {
    try {
      const svg = atob(value.split(",")[1]);
      return sanitizeSVG(svg) === svg;
    } catch {
      return false;
    }
  }
  return false;
};
export const entrySchema = z.object({
  id: z.uuid(),
  sort_order: z.number().int().min(0).max(100000),
  is_visible: z.boolean(),
  data: z.record(
    z.string().max(100),
    z.union([
      z.string().max(40000),
      z.number().finite(),
      z.boolean(),
      z.array(z.string().max(2000)).max(100),
    ]),
  ),
});
export function validateEntry(
  table: Collection,
  input: unknown,
  localDemo = false,
) {
  const schema = localDemo
    ? entrySchema.extend({
        data: z.record(
          z.string().max(100),
          z.union([
            z.string().max(4300000),
            z.number().finite(),
            z.boolean(),
            z.array(z.string().max(4300000)).max(100),
          ]),
        ),
      })
    : entrySchema;
  const result = schema.parse(input);
  if (["profiles", "site_settings", "seo_settings"].includes(table))
    result.is_visible = true;
  const allowed = new Set(fields[table].map((x) => x.key));
  for (const [key, value] of Object.entries(result.data)) {
    if (!allowed.has(key)) throw new Error("Campo no reconocido: " + key);
    const field = fields[table].find((x) => x.key === key)!;
    if (
      ["url", "media"].includes(field.type || "") &&
      !safeURL(String(value)) &&
      !(localDemo && field.type === "media" && safeDataURL(String(value)))
    )
      throw new Error("URL inválida: " + field.label);
    if (field.type === "checkbox" && typeof value !== "boolean")
      throw new Error("Valor inválido: " + field.label);
    if (field.type === "number" && (typeof value !== "number" || value < 0))
      throw new Error("Número inválido: " + field.label);
    if (field.type === "list" && !Array.isArray(value))
      throw new Error("Lista inválida: " + field.label);
    if (field.type === "email" && value && !z.email().safeParse(value).success)
      throw new Error("Email inválido");
    if (
      field.type === "date" &&
      value &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ||
        !Number.isFinite(Date.parse(String(value))))
    )
      throw new Error("Fecha inválida");
    if (field.type === "color" && !/^#[0-9a-f]{6}$/i.test(String(value)))
      throw new Error("Color inválido");
    if (field.type === "select" && !field.options?.includes(String(value)))
      throw new Error("Opción inválida: " + field.label);
  }
  if (
    table === "projects" &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(result.data.slug || ""))
  )
    throw new Error("El slug debe usar minúsculas, números y guiones.");
  const required: Partial<Record<Collection, string[]>> = {
    profiles: ["first_name", "last_name"],
    projects: ["title", "slug"],
    experiences: ["company", "role"],
    education: ["institution", "degree"],
    skills: ["name", "category"],
    skill_categories: ["name"],
    gallery_items: ["title", "url"],
    social_links: ["label", "url"],
    navigation_items: ["label", "section"],
  };
  for (const key of required[table] || [])
    if (!String(result.data[key] || "").trim())
      throw new Error(
        "Completá " + (fields[table].find((f) => f.key === key)?.label || key),
      );
  if (
    table === "experiences" &&
    result.data.start &&
    result.data.end &&
    !result.data.current &&
    String(result.data.start) > String(result.data.end)
  )
    throw new Error("La fecha de fin debe ser posterior al inicio.");
  for (const [key, value] of Object.entries(result.data))
    if (Array.isArray(value))
      result.data[key] = value.map((x) => x.trim()).filter(Boolean);
  if (
    table === "projects" &&
    Array.isArray(result.data.screenshots) &&
    !result.data.screenshots.every(
      (x) => safeURL(x) || (localDemo && safeDataURL(x)),
    )
  )
    throw new Error("URL de screenshot inválida");
  if (
    table === "site_settings" &&
    (Number(result.data.radius) < 0 || Number(result.data.radius) > 40)
  )
    throw new Error("El radio debe estar entre 0 y 40.");
  if (
    table === "site_settings" &&
    result.data.dark_enabled === false &&
    result.data.soft_enabled === false
  )
    throw new Error("Habilitá al menos un theme.");
  return result;
}
