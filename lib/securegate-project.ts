import type { Entry } from "../types/content.ts";

export const secureGateProject: Entry = {
  id: "20000000-0000-4000-8000-000000000001",
  sort_order: 0,
  is_visible: true,
  data: {
    title: "secureGate",
    slug: "securegate",
    category: "Control de acceso · Frontend",
    category_en: "Access control · Frontend",
    year: "2026",
    status: "En desarrollo",
    featured: true,
    is_demo: false,
    cover: "/projects/securegate.svg",
    screenshots: [],
    video: "",
    github: "https://github.com/JFCrypT/secureGate",
    demo: "",
    technologies: ["Python", "FastAPI", "Jinja2", "HTMX", "SQLite"],
    short_description:
      "Control de acceso con reconocimiento facial y RFID. Participé en el frontend para gestionar usuarios, consultar eventos y generar reportes.",
    short_description_en:
      "Access control with facial recognition and RFID. I contributed to the frontend for managing users, reviewing events and generating reports.",
    long_description:
      "Proyecto académico presentado en Sistemas de Comunicaciones 1, desarrollado por estudiantes de Ingeniería en Informática e Ingeniería en Electrónica de la Facultad de Ingeniería del Ejército. Participé en el equipo de frontend junto a Sebastian Andrés Nemi Scarano, Simon Castelli y Gonzalo Oshiro, construyendo la interfaz de administración del sistema. El proyecto fue liderado por José Federico Castro Tramontina.",
    long_description_en:
      "Academic project presented in Communications Systems 1, developed by Informatics Engineering and Electronics Engineering students at the Facultad de Ingeniería del Ejército. I contributed to the frontend team alongside Sebastian Andrés Nemi Scarano, Simon Castelli and Gonzalo Oshiro, building the system's administration interface. The project was led by José Federico Castro Tramontina.",
    problem:
      "Integrar la identificación de personas, el control de acceso y el seguimiento de eventos en un sistema que pudiera administrarse desde una interfaz web, cuidando la protección de los datos biométricos.",
    problem_en:
      "Combine identity verification, access control and event tracking in a system that could be managed through a web interface while protecting biometric data.",
    solution:
      "Un prototipo que reúne reconocimiento facial, acceso por RFID, registro de eventos y alertas por Telegram. El frontend permite administrar usuarios, consultar el historial y las alertas, y generar reportes con exportación a CSV.",
    solution_en:
      "A prototype combining facial recognition, RFID access, event logging and Telegram alerts. The frontend supports user administration, history and alert review, and reports with CSV export.",
    architecture:
      "Frontend con FastAPI, plantillas Jinja2 y HTMX, conectado a una API REST protegida. El sistema utiliza SQLite para la persistencia y OpenCV para el reconocimiento facial, con cifrado AES-256-GCM de los datos biométricos. La integración de hardware está preparada para Raspberry Pi 3, ESP-CAM y un lector RFID RC522.",
    architecture_en:
      "A FastAPI frontend with Jinja2 templates and HTMX, connected to a protected REST API. The system uses SQLite for persistence and OpenCV for facial recognition, with AES-256-GCM encryption of biometric data. Hardware integration is prepared for Raspberry Pi 3, ESP-CAM and an RC522 RFID reader.",
    challenges:
      "Coordinar el frontend con los módulos desarrollados por otros subequipos y presentar usuarios, eventos y reportes de forma clara. La experiencia permitió combinar lo aprendido en la materia con investigación autodidacta y comprender cómo cada aporte se integra en un mismo sistema.",
    challenges_en:
      "Coordinate the frontend with modules developed by other subteams and present users, events and reports clearly. The experience combined coursework with independent research and helped us understand how each contribution fits into a shared system.",
    results:
      "Presentamos un prototipo funcional ante los profesores, con los distintos módulos integrados y una interfaz para administrar el sistema. El resultado permite evaluar el proyecto como un MVP y seguir trabajando en mejoras, validación del hardware y posibilidades de escalabilidad.",
    results_en:
      "We presented a functional prototype to our professors, with the modules integrated and an interface for administering the system. The result provides an MVP foundation for further improvements, hardware validation and exploration of scalability.",
  },
};
