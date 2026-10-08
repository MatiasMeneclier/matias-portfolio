import type { CSSProperties } from "react";
import { str, type Entry } from "@/types/content";

export function appearance(
  settings: Entry | undefined,
  selected?: "dark" | "soft",
) {
  const theme =
    selected === "soft"
      ? "Soft"
      : selected === "dark" && str(settings, "theme") === "Soft"
        ? "Apple Dark"
        : str(settings, "theme");
  const soft = theme === "Soft";
  const light = theme === "Minimal Light" || soft;
  return {
    className: `site ${soft ? "light theme-soft" : light ? "light theme-rounded" : "dark theme-rounded"} ${theme === "Minimal Dark" ? "theme-minimal" : theme === "Developer" ? "theme-developer" : ""}`,
    style: {
      "--page-bg": soft
        ? str(settings, "soft_background", "#f8f7f3")
        : str(settings, "background", light ? "#fafafa" : "#08090b"),
      "--text": soft
        ? str(settings, "soft_primary", "#202126")
        : str(settings, "primary", light ? "#17181b" : "#f5f5f7"),
      "--muted": soft
        ? str(settings, "soft_secondary", "#62616b")
        : str(settings, "secondary", light ? "#62636a" : "#a1a1aa"),
      "--accent": soft
        ? str(settings, "soft_accent", "#685487")
        : str(settings, "accent", "#a8c4e6"),
      "--line": light ? "#dcdde1" : "#282b31",
      "--surface": soft
        ? "#ffffff"
        : light
          ? "#f0f0f2"
          : theme === "Developer"
            ? "#111724"
            : "#111216",
      "--radius": str(settings, "radius", "16") + "px",
      "--font-app":
        str(settings, "typography") === "Mono"
          ? "var(--font-mono)"
          : str(settings, "typography") === "Inter"
            ? "Inter, var(--font-sans)"
            : "var(--font-sans)",
    } as CSSProperties,
  };
}
