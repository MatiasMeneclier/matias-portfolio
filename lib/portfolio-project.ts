import type { Entry } from "../types/content.ts";

export const portfolioProject: Entry = {
  id: "20000000-0000-4000-8000-000000000002",
  sort_order: 1,
  is_visible: true,
  data: {
    title: "Portfolio personal",
    title_en: "Personal portfolio",
    slug: "portfolio-personal",
    category: "Desarrollo web · Experiencia 3D",
    category_en: "Web development · 3D experience",
    year: "2026",
    status: "En desarrollo",
    featured: true,
    is_demo: false,
    cover: "/projects/portfolio-personal.png",
    screenshots: [],
    video: "",
    github: "",
    demo: "",
    technologies: ["Next.js", "React", "TypeScript", "Three.js", "Motion"],
    short_description:
      "Mi portfolio: una laptop 3D como bienvenida, temas claro y oscuro, contenido bilingüe y un panel para administrar proyectos y perfil.",
    short_description_en:
      "My portfolio: a 3D laptop introduction, light and dark themes, bilingual content and a dashboard for managing projects and profile information.",
    long_description:
      "Este sitio reúne mi formación, experiencia, conocimientos y proyectos en una experiencia interactiva. La presentación comienza con una laptop 3D y continúa hacia el portfolio mediante scroll o clic. Incluye carrusel de proyectos, fichas detalladas, CV, enlaces sociales y un panel de administración.",
    long_description_en:
      "This site brings together my education, experience, skills and projects in an interactive experience. The introduction starts with a 3D laptop and flows into the portfolio through scrolling or a click. It includes a project carousel, detailed project pages, a CV, social links and an administration dashboard.",
    problem:
      "Presentar mi perfil y mis proyectos de manera clara, con una identidad visual propia y contenido que pueda actualizarse sin editar cada sección del código.",
    problem_en:
      "Present my profile and projects clearly, with a distinct visual identity and content that can be updated without editing each section's code.",
    solution:
      "Un portfolio responsive con temas claro y oscuro que conservan la misma estructura, textos en español e inglés, navegación por secciones y un carrusel de proyectos que también se controla con el teclado. El admin permite editar textos, proyectos y medios.",
    solution_en:
      "A responsive portfolio with light and dark themes sharing the same layout, Spanish and English content, section navigation and a project carousel with keyboard controls. The dashboard supports editing text, projects and media.",
    architecture:
      "Next.js App Router, React y TypeScript para el sitio y el CMS. React Three Fiber y Drei renderizan la laptop con Three.js; Motion y GSAP acompañan las transiciones. El contenido se organiza en registros editables. La demo persiste en localStorage y la integración con Supabase Auth, base de datos, Storage y RLS está preparada mediante migraciones, pendiente de conectar un proyecto real.",
    architecture_en:
      "Next.js App Router, React and TypeScript power the site and CMS. React Three Fiber and Drei render the laptop with Three.js, while Motion and GSAP support the transitions. Content is organized into editable records. The demo persists in localStorage; Supabase Auth, database, Storage and RLS integration is prepared through migrations and awaits connection to a real Supabase project.",
    challenges:
      "Pulir la continuidad entre la laptop y el contenido, evitar saltos durante el scroll y reducir el trabajo del render 3D. Mantener una experiencia coherente entre ambos temas, adaptar la navegación a móvil y respetar la preferencia de movimiento reducido.",
    challenges_en:
      "Refine continuity between the laptop and the content, avoid scroll jumps and reduce 3D rendering work. Keep both themes consistent, adapt navigation for mobile and respect reduced-motion preferences.",
    results:
      "Un portfolio funcional que puede probarse localmente, con proyectos editables, preferencias persistentes y una experiencia adaptada a escritorio y móvil. El siguiente paso es conectar Supabase y publicar el sitio.",
    results_en:
      "A functional portfolio that can be tested locally, with editable projects, persistent preferences and an experience adapted to desktop and mobile. The next step is to connect Supabase and publish the site.",
  },
};
