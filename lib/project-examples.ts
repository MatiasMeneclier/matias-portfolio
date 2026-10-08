import type { Entry } from "../types/content.ts";

const examples = [
  {
    title: "Orbit Tasks",
    slug: "ejemplo-orbit-tasks",
    category: "Aplicación web",
    category_en: "Web application",
    short_description:
      "Un espacio tranquilo para organizar proyectos, tareas y prioridades del día.",
    short_description_en:
      "A calm workspace for projects, tasks and daily priorities.",
    technologies: ["React", "TypeScript", "Supabase"],
    problem:
      "Concepto ficticio: reunir tareas dispersas en un tablero fácil de explorar.",
    problem_en:
      "Fictional concept: bring scattered tasks together in an easy-to-explore board.",
    solution:
      "Tableros por proyecto, prioridades y una vista semanal con filtros.",
    solution_en: "Project boards, priorities and a weekly view with filters.",
  },
  {
    title: "Nexo Finance",
    slug: "ejemplo-nexo-finance",
    category: "Dashboard",
    category_en: "Dashboard",
    short_description:
      "Una vista simple de gastos, presupuestos y hábitos, con datos de demostración.",
    short_description_en:
      "A simple view of spending, budgets and habits, using demonstration data.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL"],
    problem:
      "Concepto ficticio: convertir movimientos de ejemplo en una visión clara del presupuesto.",
    problem_en:
      "Fictional concept: turn sample transactions into a clear budget overview.",
    solution:
      "Categorías de gastos, evolución mensual y objetivos configurables.",
    solution_en: "Spending categories, monthly trends and configurable goals.",
  },
  {
    title: "Atlas Routes",
    slug: "ejemplo-atlas-routes",
    category: "Visualización",
    category_en: "Visualization",
    short_description:
      "Explorar caminos y entender cómo un algoritmo encuentra una ruta entre dos puntos.",
    short_description_en:
      "Explore paths and understand how an algorithm finds a route between two points.",
    technologies: ["C++", "Algoritmos", "React"],
    problem:
      "Concepto ficticio: hacer visible el recorrido de un algoritmo sobre un grafo.",
    problem_en:
      "Fictional concept: make an algorithm's traversal of a graph visible.",
    solution:
      "Un mapa conceptual con nodos, recorridos y una explicación paso a paso.",
    solution_en:
      "A conceptual map with nodes, routes and a step-by-step explanation.",
  },
  {
    title: "Pulse Analytics",
    slug: "ejemplo-pulse-analytics",
    category: "Datos",
    category_en: "Data",
    short_description:
      "Un panel de métricas con filtros y gráficos para descubrir patrones en datos ficticios.",
    short_description_en:
      "A metrics dashboard with filters and charts for exploring patterns in fictional data.",
    technologies: ["React", "SQL", "Charts"],
    problem:
      "Concepto ficticio: comparar métricas sin perder el contexto entre distintas vistas.",
    problem_en:
      "Fictional concept: compare metrics without losing context across views.",
    solution:
      "Indicadores, gráficos temporales y filtros que comparten el mismo estado.",
    solution_en:
      "Indicators, time-series charts and filters that share the same state.",
  },
  {
    title: "Lumen Notes",
    slug: "ejemplo-lumen-notes",
    category: "Productividad",
    category_en: "Productivity",
    short_description:
      "Un rincón para conectar ideas, guardar apuntes y encontrar lo importante.",
    short_description_en:
      "A place to connect ideas, save notes and find what matters.",
    technologies: ["Next.js", "Markdown", "TypeScript"],
    problem:
      "Concepto ficticio: ordenar apuntes sin interrumpir el momento de escribir.",
    problem_en:
      "Fictional concept: organize notes without interrupting the writing flow.",
    solution: "Editor con colecciones, etiquetas y búsqueda de texto.",
    solution_en: "An editor with collections, tags and text search.",
  },
  {
    title: "Kernel Lab",
    slug: "ejemplo-kernel-lab",
    category: "Sistemas",
    category_en: "Systems",
    short_description:
      "Una consola visual para experimentar con procesos, memoria y planificación.",
    short_description_en:
      "A visual console for experimenting with processes, memory and scheduling.",
    technologies: ["Java", "Sistemas", "Simulación"],
    problem:
      "Concepto ficticio: explicar qué ocurre al ejecutar varios procesos al mismo tiempo.",
    problem_en:
      "Fictional concept: explain what happens when several processes run at the same time.",
    solution:
      "Simulación conceptual con una línea de ejecución y un mapa de memoria.",
    solution_en:
      "A conceptual simulation with an execution timeline and a memory map.",
  },
];
export const projectExamples: Entry[] = examples.map((example, index) => ({
  id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  sort_order: index,
  is_visible: true,
  data: {
    ...example,
    cover: `/projects/examples/${example.slug.slice(8)}.svg`,
    is_demo: true,
    featured: index === 0,
    year: "2026",
    status: "En desarrollo",
    long_description:
      "Proyecto ficticio de ejemplo, creado para mostrar el diseño del portfolio y probar el editor. No representa un trabajo realizado ni una aplicación disponible. Podés editarlo, ocultarlo o reemplazarlo desde Projects en el admin.",
    long_description_en:
      "Fictional sample project, created to preview the portfolio design and try the editor. It does not represent completed work or an available application. Edit, hide or replace it from Projects in the admin.",
    architecture:
      "Propuesta conceptual: interfaz, lógica de aplicación y persistencia separadas en módulos.",
    architecture_en:
      "Conceptual proposal: separate modules for the interface, application logic and persistence.",
    challenges:
      "Presentar información con claridad y conservar una experiencia cómoda en móvil.",
    challenges_en:
      "Present information clearly and keep the mobile experience comfortable.",
    results:
      "Ejemplo visual para evaluar el carrusel. No se incluyen resultados ni métricas reales.",
    results_en:
      "Visual sample for evaluating the carousel. No real results or metrics are included.",
    github: "",
    demo: "",
    screenshots: [],
    video: "",
  },
}));
