import type { Content, Entry } from "../types/content.ts";

export const profileCopyUpdates = [
  {
    table: "profiles",
    key: "headline",
    previous:
      "Estudiante de Ingeniería Informática | Programación | Arquitectura de Computadoras | Sistemas | Interés en desarrollo de software y tecnología",
    value:
      "Estudiante de Ingeniería Informática | Desarrollo de software | Bases de datos y sistemas | Interés en IA y ciberseguridad",
  },
  {
    table: "profiles",
    key: "headline_en",
    previous:
      "Computer Engineering student | Programming, Computer Architecture and Systems | Exploring software development",
    value:
      "Computer Engineering student | Software development | Databases and systems | Interested in AI and cybersecurity",
  },
  {
    table: "profiles",
    key: "bio",
    previous:
      "Estudiante de Ingeniería Informática con interés en programación, arquitectura de computadoras, sistemas y desarrollo de software.",
    value:
      "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
  },
  {
    table: "profiles",
    key: "bio_en",
    previous:
      "Computer Engineering student interested in programming, computer architecture, systems and software development.",
    value:
      "Computer Engineering student with knowledge of programming, databases and systems. I am interested in developing software and exploring new applications of artificial intelligence and cybersecurity.",
  },
  {
    table: "profiles",
    key: "about",
    previous:
      "Soy estudiante de Ingeniería Informática con gran interés en el funcionamiento interno de las computadoras, la programación y los sistemas tecnológicos.\n\nActualmente me encuentro desarrollando mis conocimientos en áreas como programación, arquitectura de computadoras y electrónica, buscando siempre comprender cómo funcionan los sistemas desde lo más fundamental hasta su aplicación práctica.\n\nMe interesa participar en proyectos que me permitan seguir aprendiendo, enfrentar desafíos técnicos y trabajar en equipo para desarrollar soluciones tecnológicas.\n\nEstoy abierto a oportunidades de aprendizaje, colaboración y desarrollo profesional en el área de tecnología.",
    value:
      "Soy estudiante de Ingeniería Informática en la Facultad de Ingeniería del Ejército. Me interesa entender cómo funcionan los sistemas, resolver problemas y transformar ideas en soluciones mediante el software.\n\nMi formación combina programación, bases de datos y arquitectura de computadoras. A través de proyectos personales y académicos, busco conectar esos conocimientos, enfrentar desafíos técnicos y aprender del trabajo en equipo.\n\nLa inteligencia artificial y la ciberseguridad son áreas que quiero seguir explorando, especialmente por su aplicación al desarrollo de sistemas y por las posibilidades que abren para el futuro.\n\nMi experiencia laboral también me permitió desarrollar comunicación, adaptabilidad y trabajo en equipo. Busco una primera oportunidad en tecnología donde pueda aportar estas habilidades y seguir creciendo profesionalmente.",
  },
  {
    table: "profiles",
    key: "about_en",
    previous:
      "I am a Computer Engineering student with a curiosity for how computers work, from the underlying hardware to the software and systems built on top of it.\n\nI am building my knowledge of programming, computer architecture and electronics, connecting fundamental concepts with practical applications.\n\nI am looking to contribute to projects where I can keep learning, solve technical problems and collaborate with a team.\n\nI welcome opportunities to learn, collaborate and grow professionally in technology.",
    value:
      "I am a Computer Engineering student at the Facultad de Ingeniería del Ejército. I am interested in understanding how systems work, solving problems and turning ideas into solutions through software.\n\nMy studies combine programming, databases and computer architecture. Through personal and academic projects, I aim to connect this knowledge, tackle technical challenges and learn from working with a team.\n\nArtificial intelligence and cybersecurity are areas I want to explore further, particularly their applications in system development and the possibilities they open up for the future.\n\nMy work experience has also helped me develop communication, adaptability and teamwork. I am seeking my first opportunity in technology, where I can contribute these skills and continue growing professionally.",
  },
  {
    table: "site_settings",
    key: "hero_description",
    previous:
      "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
    value:
      "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
  },
  {
    table: "site_settings",
    key: "hero_description_en",
    previous:
      "Computer Engineering student exploring programming, computer architecture and systems, with a focus on software development.",
    value:
      "Computer Engineering student with knowledge of programming, databases and systems. I am interested in developing software and exploring new applications of artificial intelligence and cybersecurity.",
  },
  {
    table: "seo_settings",
    key: "description",
    previous:
      "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
    value:
      "Estudiante de Ingeniería Informática con conocimientos en programación, bases de datos y sistemas. Me interesa desarrollar software y explorar nuevas aplicaciones de la inteligencia artificial y la ciberseguridad.",
  },
] as const;

export const databaseSkill: Entry = {
  id: "40000000-0000-4000-8000-000000000001",
  sort_order: 4,
  is_visible: true,
  data: {
    name: "Bases de datos",
    name_en: "Databases",
    category: "Computer Science",
    icon: "",
  },
};

export function applyProfileUpdate(content: Content) {
  for (const update of profileCopyUpdates) {
    const entry = content[update.table][0];
    if (entry && entry.data[update.key] === update.previous)
      entry.data[update.key] = update.value;
  }
  if (
    !content.skills.some(
      (entry) =>
        entry.id === databaseSkill.id ||
        entry.data.name === databaseSkill.data.name,
    )
  )
    content.skills.push(structuredClone(databaseSkill));
}
