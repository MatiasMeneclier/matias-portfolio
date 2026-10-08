import {
  collections,
  type Content,
  type Fields,
  type Entry,
} from "../types/content.ts";
import { profilePhoto } from "./profile-photo.ts";
import { applySkillsUpdate } from "./skills-update.ts";
import { databaseSkill } from "./profile-update.ts";
import { addTranslations } from "./english-seed.ts";
import { secureGateProject } from "./securegate-project.ts";
import { portfolioProject } from "./portfolio-project.ts";
import { clipedProject } from "./cliped-project.ts";
import { gpsProject } from "./gps-project.ts";
import { audioAmplifierProject } from "./audio-amplifier-project.ts";
let n = 0;
const entry = (data: Fields, sort_order = 0): Entry => ({
  id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
  data,
  sort_order,
  is_visible: true,
});
export const seed = Object.fromEntries(
  collections.map((k) => [k, []]),
) as unknown as Content;
seed.profiles = [
  entry({
    first_name: "Matias Andres",
    last_name: "Meneclier",
    age: 21,
    nationality: "Argentino",
    short_location: "Buenos Aires, Argentina",
    location: "Buenos Aires, Provincia de Buenos Aires, Argentina",
    headline:
      "Estudiante de Ingeniería Informática | Desarrollo de software | Bases de datos y sistemas | Interés en IA y ciberseguridad",
    degree: "Ingeniería Informática",
    university: "Facultad de Ingeniería del Ejército",
    photo: profilePhoto,
    bio: "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
    about_caption: "Del hardware al software.\nDe la curiosidad a la práctica.",
    about_title: "Sobre mí",
    about:
      "Soy estudiante de Ingeniería Informática en la Facultad de Ingeniería del Ejército. Me interesa entender cómo funcionan los sistemas, resolver problemas y transformar ideas en soluciones mediante el software.\n\nMi formación combina programación, bases de datos y arquitectura de computadoras. A través de proyectos personales y académicos, busco conectar esos conocimientos, enfrentar desafíos técnicos y aprender del trabajo en equipo.\n\nLa inteligencia artificial y la ciberseguridad son áreas que quiero seguir explorando, especialmente por su aplicación al desarrollo de sistemas y por las posibilidades que abren para el futuro.\n\nMi experiencia laboral también me permitió desarrollar comunicación, adaptabilidad y trabajo en equipo. Busco una primera oportunidad en tecnología donde pueda aportar estas habilidades y seguir creciendo profesionalmente.",
    email: "",
    phone: "",
    linkedin: "https://www.linkedin.com/in/matias-meneclier-9bb8a83b6/",
    github: "https://github.com/MatiasMeneclier",
    instagram: "https://www.instagram.com/matimene_/",
    cv: "",
  }),
];
seed.site_settings = [
  entry({
    hero_statement: "Software.\nSistemas.\nPosibilidades.",
    hero_name: "MATIAS",
    hero_surname: "MENECLIER",
    intro_title: "MATIAS MENECLIER",
    hero_subtitle: "Software Engineering Student",
    hero_description:
      "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
    projects_title: "Proyectos listos y en proceso",
    projects_empty_title: "Próximos proyectos",
    projects_empty: "Un espacio para compartir lo que voy construyendo.",
    gallery_title: "Galería",
    gallery_empty: "Nuevas imágenes, próximamente.",
    contact_title: "Contacto",
    experience_title: "Experiencia laboral",
    education_title: "Formación académica",
    skills_title: "Conocimientos y herramientas",
    theme: "Apple Dark",
    primary: "#f5f5f7",
    secondary: "#a1a1aa",
    accent: "#a8c4e6",
    background: "#08090b",
    typography: "Inter",
    radius: 16,
    animation_intensity: "Full",
    intro_enabled: true,
    terminal_enabled: true,
    contact_enabled: true,
    footer: "Matias Meneclier · Buenos Aires, Argentina",
  }),
];
seed.navigation_items = [
  "About",
  "Experience",
  "Education",
  "Projects",
  "Skills",
  "Gallery",
  "Contact",
].map((label, i) =>
  entry(
    {
      label,
      section: label.toLowerCase(),
      filename:
        label.toLowerCase() +
        (["About", "Projects"].includes(label) ? ".tsx" : ".ts"),
    },
    i,
  ),
);
seed.experiences = [
  entry(
    {
      company: "ZARA",
      role: "Dependiente",
      logo: "",
      start: "2025-05-01",
      end: "2026-02-28",
      current: false,
      duration: "10 meses",
      location: "Provincia de Buenos Aires, Argentina",
      work_mode: "Presencial",
      employment_type: "Jornada parcial",
      description:
        "Atención y asesoramiento al cliente en tienda.\nGestión de ventas y manejo de productos en piso de venta.\nOrganización de stock y reposición de mercadería.\nTrabajo en equipo para mantener estándares de visual merchandising y servicio al cliente.",
      skills: [
        "Ventas",
        "Servicio de atención al cliente",
        "Conocimiento del producto",
        "Trabajo en equipo",
        "Flexibilidad",
      ],
      website: "",
    },
    0,
  ),
  entry(
    {
      company: "Maxdream",
      role: "Vendedor",
      logo: "",
      start: "2023-12-01",
      end: "2025-05-31",
      current: false,
      duration: "1 año y 6 meses",
      location: "Provincia de Buenos Aires, Argentina",
      work_mode: "Híbrido",
      employment_type: "Jornada parcial",
      description:
        "Venta de paquetes de viajes de egresados.\nAtención y asesoramiento a clientes sobre destinos, servicios y condiciones del viaje.\nGestión de consultas y seguimiento de potenciales clientes.\nDesarrollo de habilidades de comunicación, negociación y ventas.",
      skills: ["Ventas", "Negociación", "Comunicación", "Atención al cliente"],
      website: "",
    },
    1,
  ),
  entry(
    {
      company: "Air Europa",
      role: "Auxiliar administrativo",
      logo: "",
      start: "2023-08-01",
      end: "2023-11-30",
      current: false,
      duration: "4 meses",
      location: "Provincia de Buenos Aires, Argentina",
      work_mode: "Presencial",
      employment_type: "Contrato de prácticas",
      description:
        "Apoyo en tareas administrativas dentro del área operativa.\nGestión y organización de documentación.\nColaboración con el equipo en tareas de soporte administrativo.\nPrimera experiencia profesional en un entorno corporativo.",
      skills: [
        "Microsoft Office",
        "Organización",
        "Administración",
        "Trabajo en equipo",
      ],
      website: "",
    },
    2,
  ),
];
seed.education = [
  entry(
    {
      institution: "Facultad de Ingeniería del Ejército",
      degree: "Ingeniería Informática",
      field: "Computer Science",
      start: "2024",
      end: "",
      current: true,
      logo: "",
      description: "En curso",
      skills: [
        "Programación",
        "Matemáticas aplicadas",
        "Algoritmos",
        "Estructuras de datos",
        "C++",
        "Java",
        "Arquitectura de computadoras",
        "Sistemas",
      ],
    },
    0,
  ),
  entry(
    {
      institution: "Instituto San Roman",
      degree: "Bachillerato",
      field: "Natural Sciences / Ciencias Naturales",
      start: "2018",
      end: "2023",
      current: false,
      logo: "",
      description: "",
      skills: [],
    },
    1,
  ),
];
const categories: Record<string, string[]> = {
  Programming: [
    "C++",
    "Java",
    "Programación",
    "Algoritmos",
    "Estructuras de datos",
  ],
  "Computer Science": [
    "Arquitectura de Computadoras",
    "Sistemas",
    "Resolución de problemas",
    "Matemáticas aplicadas",
  ],
  Tools: ["GitHub", "Microsoft Office"],
  Languages: ["Inglés"],
  Professional: [
    "Trabajo en equipo",
    "Resolución de problemas",
    "Flexibilidad",
    "Comunicación",
  ],
  "Commercial Experience": [
    "Ventas",
    "Habilidad de ventas",
    "Servicio de atención al cliente",
    "Conocimiento del producto",
  ],
};
seed.skill_categories = Object.keys(categories).map((name, i) =>
  entry({ name }, i),
);
seed.skills = Object.entries(categories).flatMap(([category, skills]) =>
  skills.map((name, i) => entry({ name, category, icon: "" }, i)),
);
seed.social_links = [
  entry({
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/matias-meneclier-9bb8a83b6/",
  }),
];
seed.seo_settings = [
  entry({
    title: "Matias Meneclier — Ingeniería Informática",
    description: String(seed.profiles[0].data.bio),
    keywords: [
      "Matias Meneclier",
      "Ingeniería Informática",
      "portfolio",
      "Buenos Aires",
    ],
    og_image: "",
    favicon: "",
  }),
];

seed.projects = [
  structuredClone(secureGateProject),
  structuredClone(portfolioProject),
  structuredClone(clipedProject),
  structuredClone(gpsProject),
  structuredClone(audioAmplifierProject),
];
seed.skills.push(structuredClone(databaseSkill));
applySkillsUpdate(seed);
addTranslations(seed);
