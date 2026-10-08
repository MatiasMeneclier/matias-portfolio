"use client";

import type { ScrollControls } from "@/hooks/use-scroll-controls";
import {
  ArrowUp,
  Github,
  Globe2,
  Instagram,
  Linkedin,
  Moon,
  Sun,
  TerminalSquare,
} from "lucide-react";
import FlowerMenu, {
  type FlowerMenuItem,
} from "@/components/animata/fabs/flower-menu";
import { str } from "@/types/content";
import { useSite } from "./site-preferences";

export default function FloatingMenu({
  onTerminal,
  scrollControls,
}: {
  onTerminal: () => void;
  scrollControls: ScrollControls;
}) {
  const { content, theme, locale, enabled, set, t } = useSite();
  const profile = content.profiles[0];
  const off = str(content.site_settings[0], "animation_intensity") === "Off";
  const spanish = locale === "es";
  const nextTheme = theme === "soft" ? "dark" : "soft";

  const socials = [
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "github", icon: Github, label: "GitHub" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  ];
  const items: FlowerMenuItem[] = socials.map((social) => {
    const href = str(profile, social.key);
    const valid = /^https?:\/\//i.test(href);
    return {
      ...social,
      href: valid ? href : undefined,
      disabled: !valid,
      label: valid
        ? social.label
        : `${social.label} · ${spanish ? "Próximamente" : "Coming soon"}`,
    };
  });
  items.push(
    {
      key: "terminal",
      icon: TerminalSquare,
      label: t("openTerminal"),
      disabled: content.site_settings[0]?.data.terminal_enabled === false,
      onSelect: onTerminal,
    },
    {
      key: "theme",
      icon: theme === "soft" ? Moon : Sun,
      label: spanish
        ? nextTheme === "dark"
          ? "Cambiar a tema oscuro"
          : "Cambiar a tema claro"
        : nextTheme === "dark"
          ? "Switch to dark theme"
          : "Switch to light theme",
      disabled: !enabled[nextTheme],
      keepOpen: true,
      onSelect: () => set({ theme: nextTheme }),
    },
    {
      key: "locale",
      icon: Globe2,
      label: spanish ? "Cambiar a inglés" : "Switch to Spanish",
      keepOpen: true,
      onSelect: () => set({ locale: spanish ? "en" : "es" }),
    },
    {
      key: "top",
      icon: ArrowUp,
      label: t("top"),
      onSelect: () => {
        const reduce =
          off || matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
          top: 0,
          behavior: reduce ? "instant" : "smooth",
        });
      },
    },
  );
  return (
    <FlowerMenu
      menuItems={items}
      scrollControls={scrollControls}
      motionOff={off}
      triggerLabel={spanish ? "Abrir accesos rápidos" : "Open quick actions"}
      closeLabel={spanish ? "Cerrar accesos rápidos" : "Close quick actions"}
      menuLabel={spanish ? "Accesos rápidos" : "Quick actions"}
    />
  );
}
