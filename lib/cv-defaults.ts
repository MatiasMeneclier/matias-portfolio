import type { Content, Fields } from "../types/content.ts";

// CV copy is separate from portfolio copy. Saved admin edits, including empty
// fields, take precedence over defaults for the existing personal records.
const profile: Fields = {
  cv_email: "matimeneclier@gmail.com",
  cv_website: "https://matiasmeneclier.com.ar",
  cv_technical: [
    "Programación: C++, Java; Python y TypeScript aplicados en proyectos.",
    "Web y datos: React, Next.js, FastAPI, HTMX, SQLite y PostgreSQL mediante Supabase.",
    "Fundamentos: Algoritmos, estructuras de datos y arquitectura de computadoras.",
    "Herramientas: GitHub, Visual Studio, JetBrains, Codex; Docker y Linux en servidor personal.",
  ],
  cv_technical_en: [
    "Programming: C++, Java; Python and TypeScript used in projects.",
    "Web and data: React, Next.js, FastAPI, HTMX, SQLite and PostgreSQL through Supabase.",
    "Foundations: Algorithms, data structures and computer architecture.",
    "Tools: GitHub, Visual Studio, JetBrains, Codex; Docker and Linux on a personal server.",
  ],
  cv_languages:
    "Español nativo; inglés B2, certificado Cambridge English: B2 First.",
  cv_languages_en:
    "Native Spanish; English B2, Cambridge English: B2 First certified.",
  cv_activities:
    "Asistencia a CyberAR. Interés en inteligencia artificial y ciberseguridad.",
  cv_activities_en:
    "Attended CyberAR. Interests in artificial intelligence and cybersecurity.",
};
const experiences: Record<string, Fields> = {
  "00000000-0000-4000-8000-000000000010": {
    cv_bullets: [
      "Asesoré a clientes y gestioné ventas en tienda; colaboré en la reposición de stock y la presentación de productos.",
    ],
    cv_bullets_en: [
      "Advised customers and handled in-store sales; supported stock replenishment and product presentation.",
    ],
  },
  "00000000-0000-4000-8000-000000000011": {
    cv_bullets: [
      "Comercialicé viajes de egresados, asesorando sobre destinos, servicios y condiciones; gestioné consultas y seguimiento de clientes.",
    ],
    cv_bullets_en: [
      "Sold graduation travel packages, advised customers on destinations and travel conditions, and followed up on enquiries.",
    ],
  },
  "00000000-0000-4000-8000-000000000012": {
    cv_bullets: [
      "Organicé documentación y apoyé las tareas administrativas del área operativa durante una práctica profesional.",
    ],
    cv_bullets_en: [
      "Organized documentation and supported administrative tasks in the operations department during an internship.",
    ],
  },
};
const education: Record<string, Fields> = {
  "00000000-0000-4000-8000-000000000013": {
    cv_note:
      "Formación en programación, bases de datos, algoritmos, estructuras de datos y arquitectura de computadoras.",
    cv_note_en:
      "Studies in programming, databases, algorithms, data structures and computer architecture.",
  },
};
const projects: Record<string, Fields> = {
  "20000000-0000-4000-8000-000000000001": {
    cv_role: "Proyecto académico · Contribución al frontend",
    cv_role_en: "Academic project · Frontend contributor",
    cv_technologies: ["Python", "FastAPI", "Jinja2", "HTMX", "SQLite"],
    cv_bullets: [
      "Contribuí al frontend de un sistema de acceso facial y RFID: administración de usuarios, consulta de eventos y reportes CSV.",
      "Colaboré en la integración con una API REST protegida; el equipo presentó un prototipo funcional en Sistemas de Comunicaciones 1.",
    ],
    cv_bullets_en: [
      "Contributed to the frontend of a facial recognition and RFID access system, including user administration, event history and CSV reports.",
      "Collaborated on integration with a protected REST API; the team presented a working prototype in Communications Systems 1.",
    ],
    cv_exclude: false,
  },
  "20000000-0000-4000-8000-000000000002": {
    cv_role: "Proyecto personal · Publicado",
    cv_role_en: "Personal project · Published",
    cv_technologies: ["Next.js", "TypeScript", "Supabase", "Docker"],
    cv_bullets: [
      "Desarrollé un portfolio bilingüe y adaptable a móviles, con una laptop 3D y un panel de edición con autenticación y datos persistentes.",
      "Publiqué la aplicación en un servidor propio con Docker y Cloudflare Tunnel; integré Supabase y el envío de mensajes con Resend.",
    ],
    cv_bullets_en: [
      "Developed a bilingual, mobile-responsive portfolio with a 3D laptop and an editing dashboard backed by authentication and persistent data.",
      "Deployed the application on a personal server using Docker and Cloudflare Tunnel; integrated Supabase and contact emails through Resend.",
    ],
    cv_exclude: false,
  },
  "20000000-0000-4000-8000-000000000003": {
    cv_role: "Proyecto personal · En desarrollo",
    cv_role_en: "Personal project · In development",
    cv_technologies: ["React", "TypeScript", "Python", "FastAPI", "OpenVINO"],
    cv_bullets: [
      "Desarrollé un MVP local para analizar videos de fútbol, seleccionar un jugador desde perfiles visuales y exportar su seguimiento con audio.",
      "Integré una interfaz React con un backend Python, FastAPI y modelos de visión por computadora; continúo validando identidad y rendimiento.",
    ],
    cv_bullets_en: [
      "Developed a local MVP to analyze football videos, select a player from visual profiles and export player tracking with audio.",
      "Integrated a React interface with a Python backend, FastAPI and computer vision models; identity consistency and performance remain under validation.",
    ],
    cv_exclude: false,
  },
  "20000000-0000-4000-8000-000000000004": { cv_exclude: true },
  "20000000-0000-4000-8000-000000000005": { cv_exclude: true },
};

export function withCVDefaults(content: Content): Content {
  const result = structuredClone(content);
  const add = (data: Fields, defaults: Fields) => {
    for (const [key, value] of Object.entries(defaults)) {
      if (data[key] === undefined) data[key] = structuredClone(value);
    }
  };
  for (const entry of result.profiles) {
    if (entry.id === "00000000-0000-4000-8000-000000000001")
      add(entry.data, profile);
  }
  for (const table of ["experiences", "education", "projects"] as const) {
    const defaults = { experiences, education, projects }[table];
    for (const entry of result[table])
      add(entry.data, defaults[entry.id] || {});
  }
  return result;
}
