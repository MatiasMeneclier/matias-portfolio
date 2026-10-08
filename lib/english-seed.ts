import type { Content } from "../types/content.ts";
export function addTranslations(c: Content) {
  Object.assign(c.profiles[0].data, {
    headline_en:
      "Computer Engineering student | Software development | Databases and systems | Interested in AI and cybersecurity",
    degree_en: "Computer Engineering",
    bio_en:
      "Computer Engineering student with knowledge of programming, databases and systems. I am interested in developing software and exploring new applications of artificial intelligence and cybersecurity.",
    about_title_en: "About me",
    about_caption_en: "From hardware to software.\nFrom curiosity to practice.",
    about_en:
      "I am a Computer Engineering student at the Facultad de Ingeniería del Ejército. I am interested in understanding how systems work, solving problems and turning ideas into solutions through software.\n\nMy studies combine programming, databases and computer architecture. Through personal and academic projects, I aim to connect this knowledge, tackle technical challenges and learn from working with a team.\n\nArtificial intelligence and cybersecurity are areas I want to explore further, particularly their applications in system development and the possibilities they open up for the future.\n\nMy work experience has also helped me develop communication, adaptability and teamwork. I am seeking my first opportunity in technology, where I can contribute these skills and continue growing professionally.",
  });
  Object.assign(c.site_settings[0].data, {
    dark_enabled: true,
    soft_enabled: true,
    soft_background: "#f8f7f3",
    soft_primary: "#202126",
    soft_secondary: "#62616b",
    soft_accent: "#685487",
    hero_statement_en: "Software.\nSystems.\nPossibilities.",
    hero_description_en:
      "Computer Engineering student with knowledge of programming, databases and systems. I am interested in developing software and exploring new applications of artificial intelligence and cybersecurity.",
    projects_title_en: "Completed and ongoing projects",
    projects_empty_title_en: "Projects coming soon",
    projects_empty_en: "A space for the things I am building.",
    gallery_title_en: "Gallery",
    gallery_empty_en: "New images coming soon.",
    contact_title_en: "Contact",
    experience_title_en: "Work experience",
    education_title_en: "Education",
    skills_title_en: "Knowledge and tools",
    hero_cta: "Ver proyectos",
    hero_cta_en: "View projects",
    hero_about_cta: "Sobre mí",
    hero_about_cta_en: "About me",
    hero_cv_cta: "Descargar CV",
    hero_cv_cta_en: "Download CV",
  });
  const descriptions = [
    "Advised customers and provided in-store service.\nHandled sales and supported product presentation on the shop floor.\nOrganized stock and replenished merchandise.\nWorked with the team to uphold visual merchandising and customer service standards.",
    "Sold graduation travel packages.\nAdvised customers on destinations, services and travel conditions.\nHandled enquiries and followed up with prospective customers.\nDeveloped communication, negotiation and sales skills.",
    "Supported administrative tasks in the operations department.\nOrganized and managed documentation.\nAssisted the team with day-to-day administrative work.\nGained my first professional experience in a corporate environment.",
  ];
  c.experiences.forEach((e, i) => {
    e.data.description_en = descriptions[i];
  });
}
