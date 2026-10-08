import {
  list,
  str,
  visible,
  type Content,
  type Entry,
} from "../types/content.ts";
import { localizeContent, type Locale } from "./localization.ts";
import { withCVDefaults } from "./cv-defaults.ts";

export interface CVEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  technologies: string;
  note: string;
  bullets: string[];
  link?: { label: string; href: string };
}
export interface CVSection {
  title: string;
  entries: CVEntry[];
}
export interface CVModel {
  locale: Locale;
  name: string;
  contact: { label: string; href?: string }[];
  links: { label: string; href: string }[];
  sections: CVSection[];
  skillsTitle: string;
  skills: { label: string; text: string }[];
}
const text = {
  es: {
    education: "Formación académica",
    projects: "Proyectos técnicos",
    experience: "Experiencia laboral",
    skills: "Conocimientos e idiomas",
    present: "Actualidad",
    inProgress: "En curso",
    languages: "Idiomas",
    activities: "Actividades e intereses",
    repository: "Repositorio",
    site: "Sitio web",
  },
  en: {
    education: "Education",
    projects: "Technical projects",
    experience: "Work experience",
    skills: "Skills and languages",
    present: "Present",
    inProgress: "In progress",
    languages: "Languages",
    activities: "Activities and interests",
    repository: "Repository",
    site: "Website",
  },
};
function date(value: string, locale: Locale): string {
  if (/^\d{4}$/.test(value)) return value;
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(value);
  if (!match) return value;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return value;
  const months =
    locale === "es"
      ? [
          "ene.",
          "feb.",
          "mar.",
          "abr.",
          "may.",
          "jun.",
          "jul.",
          "ago.",
          "sep.",
          "oct.",
          "nov.",
          "dic.",
        ]
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
  return `${months[month - 1]} ${match[1]}`;
}
function chronological(entries: Entry[]): Entry[] {
  return visible(entries).sort((a, b) => {
    if (Boolean(a.data.current) !== Boolean(b.data.current))
      return a.data.current ? -1 : 1;
    const dateA =
      str(a, "end") || str(a, "start") || str(a, "date") || str(a, "year");
    const dateB =
      str(b, "end") || str(b, "start") || str(b, "date") || str(b, "year");
    return dateB.localeCompare(dateA) || a.sort_order - b.sort_order;
  });
}
function safeLink(href: string): string | undefined {
  try {
    const url = new URL(href);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
function cleanLines(entry: Entry, cvKey: string, fallback: string): string[] {
  return list(entry, entry.data[cvKey] !== undefined ? cvKey : fallback)
    .map((line) => line.replace(/^[•*-]\s*/, "").trim())
    .filter(Boolean);
}
export function buildCV(source: Content, locale: Locale): CVModel {
  const content = localizeContent(withCVDefaults(source), locale);
  const labels = text[locale];
  const profile = visible(content.profiles)[0];
  const range = (entry: Entry) =>
    [
      date(str(entry, "start"), locale),
      entry.data.current ? labels.present : date(str(entry, "end"), locale),
    ]
      .filter(Boolean)
      .join(" - ");
  const email = str(profile, "cv_email") || str(profile, "email");
  const phone = str(profile, "phone");
  const links: CVModel["links"] = [];
  for (const key of ["cv_website", "github", "linkedin"]) {
    const href = safeLink(str(profile, key));
    if (href)
      links.push({
        href,
        label: href.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      });
  }
  const education = chronological(content.education)
    .filter((entry) => !entry.data.cv_exclude)
    .map((entry): CVEntry => ({
      id: entry.id,
      title: str(entry, "institution"),
      subtitle: [
        str(entry, "degree") +
          (entry.data.current ? ` (${labels.inProgress.toLowerCase()})` : ""),
        !entry.data.current &&
          (locale === "es" && str(entry, "field").includes(" / ")
            ? str(entry, "field").split(" / ").at(-1)
            : str(entry, "field")),
      ]
        .filter(Boolean)
        .join(" · "),
      date: range(entry),
      technologies: "",
      note: str(entry, "cv_note"),
      bullets: [],
    }));
  const projects = chronological(content.projects)
    .filter((entry) => !entry.data.cv_exclude && !entry.data.is_demo)
    .map((entry): CVEntry => {
      const href =
        safeLink(str(entry, "github")) ||
        safeLink(str(entry, "demo")) ||
        (str(entry, "slug") === "portfolio-personal"
          ? safeLink(str(profile, "cv_website"))
          : undefined);
      return {
        id: entry.id,
        title: str(entry, "title"),
        subtitle:
          str(entry, "cv_role") ||
          [str(entry, "category"), str(entry, "status")]
            .filter(Boolean)
            .join(" · "),
        date: date(str(entry, "date") || str(entry, "year"), locale),
        technologies: list(
          entry,
          entry.data.cv_technologies !== undefined
            ? "cv_technologies"
            : "technologies",
        ).join(", "),
        note: "",
        bullets: cleanLines(entry, "cv_bullets", "short_description"),
        ...(href
          ? {
              link: {
                href,
                label: str(entry, "github") ? labels.repository : labels.site,
              },
            }
          : {}),
      };
    });
  const experience = chronological(content.experiences)
    .filter((entry) => !entry.data.cv_exclude)
    .map((entry): CVEntry => ({
      id: entry.id,
      title: str(entry, "company"),
      subtitle: [str(entry, "role"), str(entry, "employment_type")]
        .filter(Boolean)
        .join(" · "),
      date: range(entry),
      technologies: "",
      note: "",
      bullets: cleanLines(entry, "cv_bullets", "description"),
    }));
  const technical = list(profile, "cv_technical");
  const skills =
    profile?.data.cv_technical !== undefined
      ? technical.map((line) => {
          const divider = line.indexOf(":");
          return divider > 0
            ? {
                label: line.slice(0, divider),
                text: line.slice(divider + 1).trim(),
              }
            : { label: "", text: line };
        })
      : visible(content.skill_categories)
          .map((category) => ({
            label: str(category, "name"),
            text: visible(content.skills)
              .filter(
                (skill) => str(skill, "category") === str(category, "name"),
              )
              .map((skill) => str(skill, "name"))
              .join(", "),
          }))
          .filter((row) => row.text);
  if (str(profile, "cv_languages"))
    skills.push({
      label: labels.languages,
      text: str(profile, "cv_languages"),
    });
  if (str(profile, "cv_activities"))
    skills.push({
      label: labels.activities,
      text: str(profile, "cv_activities"),
    });
  return {
    locale,
    name: [str(profile, "first_name"), str(profile, "last_name")]
      .filter(Boolean)
      .join(" "),
    contact: [
      { label: str(profile, "short_location") || str(profile, "location") },
      ...(email ? [{ label: email, href: `mailto:${email}` }] : []),
      ...(phone
        ? [{ label: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` }]
        : []),
    ].filter((item) => item.label),
    links,
    sections: [
      { title: labels.education, entries: education },
      { title: labels.projects, entries: projects },
      { title: labels.experience, entries: experience },
    ].filter((section) => section.entries.length),
    skillsTitle: labels.skills,
    skills,
  };
}
