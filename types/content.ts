export type Value = string | number | boolean | string[];
export type Fields = Record<string, Value>;
export interface Entry {
  id: string;
  data: Fields;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}
export const collections = [
  "profiles",
  "site_settings",
  "navigation_items",
  "experiences",
  "education",
  "projects",
  "project_images",
  "project_technologies",
  "skills",
  "skill_categories",
  "gallery_items",
  "social_links",
  "seo_settings",
  "media_assets",
] as const;
export type Collection = (typeof collections)[number];
export type Content = Record<Collection, Entry[]>;
export interface Field {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "url"
    | "email"
    | "date"
    | "color"
    | "select"
    | "list"
    | "media";
  options?: string[];
  required?: boolean;
}
export const str = (
  entry: Entry | undefined,
  key: string,
  fallback = "",
): string => String(entry?.data[key] ?? fallback);
export const list = (entry: Entry | undefined, key: string): string[] => {
  const value = entry?.data[key];
  return Array.isArray(value)
    ? value
    : String(value || "")
        .split("\n")
        .filter(Boolean);
};
export const visible = (items: Entry[]) =>
  items.filter((x) => x.is_visible).sort((a, b) => a.sort_order - b.sort_order);
