import type { Entry } from "../types/content.ts";

export const audioAmplifierProject: Entry = {
  id: "20000000-0000-4000-8000-000000000005",
  sort_order: 4,
  is_visible: true,
  data: {
    title: "Amplificador de audio analógico",
    title_en: "Analog audio amplifier",
    slug: "amplificador-audio-analogico",
    category: "Electrónica analógica · Audio",
    category_en: "Analog electronics · Audio",
    status: "En desarrollo",
    featured: false,
    is_demo: false,
    cover: "/projects/amplificador-audio.svg",
    screenshots: [],
    video: "",
    github: "",
    demo: "",
    technologies: ["Proteus", "KiCad", "BC337", "LM741", "LM386"],
    short_description:
      "Prototipo de audio con entradas de micrófono y auxiliar, mezcla de señales, filtros RC y amplificación de potencia. Diseño, simulación y desarrollo de placas propias.",
    short_description_en:
      "An audio prototype with microphone and auxiliary inputs, signal mixing, RC filters and power amplification. Circuit design, simulation and custom board development.",
    long_description:
      "Proyecto académico desarrollado junto a Sebastian Nemi para Electrónica 1 en la Facultad de Ingeniería del Ejército. El trabajo integra electrónica analógica, simulación en Proteus, diseño de esquemas y PCB en KiCad y montaje por etapas. El informe documenta los cálculos, las simulaciones y las revisiones realizadas durante la construcción del prototipo.",
    long_description_en:
      "An academic project developed with Sebastian Nemi for Electronics 1 at the Facultad de Ingeniería del Ejército. The work combines analog electronics, Proteus simulation, schematic and PCB design in KiCad and staged assembly. The report documents calculations, simulations and revisions made while building the prototype.",
    problem:
      "Combinar una señal de micrófono y una entrada auxiliar, controlar sus niveles y acondicionar el audio antes de alimentar un parlante, manteniendo coherencia entre las ganancias, los filtros y la alimentación de cada etapa.",
    problem_en:
      "Combine a microphone signal and an auxiliary input, control their levels and condition the audio before driving a speaker, while coordinating gain, filtering and power supply requirements across stages.",
    solution:
      "Preamplificación del micrófono con un transistor BC337, controles de nivel independientes y mezcla mediante un LM741. La señal pasa por ramas RC pasa bajos y pasa altos, se recombina y llega a un LM386 que alimenta el parlante. Una fuente con transformador, rectificación y filtrado abastece los bloques del circuito.",
    solution_en:
      "A BC337 transistor preamplifies the microphone, with independent level controls and mixing through an LM741. The signal passes through low-pass and high-pass RC branches, is recombined and reaches an LM386 that drives the speaker. A transformer-based supply with rectification and filtering powers the circuit blocks.",
    architecture:
      "Sistema organizado en placas de entrada, filtros, salida y alimentación. Preamplificador BJT en emisor común; sumadores y seguidores de tensión LM741; filtros RC; etapa de potencia LM386 con acoplamiento capacitivo de salida. Fuente con transformador de toma central, diodos 1N4007 y capacitores de filtrado. Esquemas, simulaciones y diseño de PCB documentados en Proteus y KiCad.",
    architecture_en:
      "A system organized into input, filter, output and power supply boards. Common-emitter BJT preamplifier; LM741 summing amplifiers and voltage followers; RC filters; LM386 power stage with capacitive output coupling. A center-tapped transformer supply uses 1N4007 diodes and filtering capacitors. Schematics, simulations and PCB design are documented in Proteus and KiCad.",
    challenges:
      "Ajustar ganancias para reducir el recorte de la señal, revisar la alimentación y el desacoplamiento y corregir conexiones entre esquemas y placas. El desarrollo requirió iterar sobre el montaje y analizar cómo cada bloque afecta al funcionamiento del conjunto.",
    challenges_en:
      "Adjust gain to reduce signal clipping, revise power delivery and decoupling and correct connections between schematics and boards. Development required assembly iterations and analysis of how each block affects the overall system.",
    results:
      "Diseño y construcción por bloques de un prototipo académico, con cálculos, simulaciones de señales y placas diseñadas en KiCad. El informe registra las correcciones del circuito y los aprendizajes del montaje. Las conclusiones cuantitativas se apoyan en cálculos y simulaciones; no se presentan mediciones de potencia de salida, distorsión o respuesta en frecuencia del prototipo físico.",
    results_en:
      "Block-by-block design and construction of an academic prototype, with calculations, signal simulations and boards designed in KiCad. The report records circuit corrections and assembly lessons. Quantitative conclusions rely on calculations and simulations; output power, distortion and frequency response measurements of the physical prototype are not reported.",
  },
};
