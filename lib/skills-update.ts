import type { Content, Entry } from "../types/content.ts";

export const additionalSkills: Entry[] = [
  {
    id: "40000000-0000-4000-8000-000000000002",
    sort_order: 2,
    is_visible: true,
    data: {
      name: "Visual Studio",
      name_en: "Visual Studio",
      category: "Tools",
      icon: "",
    },
  },
  {
    id: "40000000-0000-4000-8000-000000000003",
    sort_order: 3,
    is_visible: true,
    data: {
      name: "JetBrains Tools",
      name_en: "JetBrains Tools",
      category: "Tools",
      icon: "",
    },
  },
  {
    id: "40000000-0000-4000-8000-000000000004",
    sort_order: 4,
    is_visible: true,
    data: {
      name: "Codex",
      name_en: "Codex",
      category: "Tools",
      icon: "",
    },
  },
  {
    id: "40000000-0000-4000-8000-000000000005",
    sort_order: 5,
    is_visible: true,
    data: {
      name: "Servidor personal",
      name_en: "Personal server",
      category: "Tools",
      icon: "",
    },
  },
  {
    id: "40000000-0000-4000-8000-000000000006",
    sort_order: 1,
    is_visible: true,
    data: {
      name: "Español",
      name_en: "Spanish",
      category: "Languages",
      icon: "",
    },
  },
  {
    id: "40000000-0000-4000-8000-000000000007",
    sort_order: 5,
    is_visible: true,
    data: {
      name: "Ciberseguridad",
      name_en: "Cybersecurity",
      category: "Programming",
      icon: "",
    },
  },
];

export function applySkillsUpdate(content: Content) {
  const english = content.skills.find(
    (entry) =>
      entry.data.category === "Languages" && entry.data.name === "Inglés",
  );
  if (english) {
    english.data.name = "Inglés · Cambridge certified";
    english.data.name_en = "English · Cambridge certified";
  }
  for (const skill of additionalSkills) {
    if (
      !content.skills.some(
        (entry) =>
          entry.id === skill.id ||
          (entry.data.name === skill.data.name &&
            entry.data.category === skill.data.category),
      )
    )
      content.skills.push(structuredClone(skill));
  }
}
