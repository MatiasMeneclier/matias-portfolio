"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  useId,
  useEffect,
  type ReactNode,
} from "react";
import { motion, MotionConfig } from "motion/react";
import { Globe2, Moon, Sun } from "lucide-react";
import { appearance } from "@/lib/appearance";
import {
  copy,
  localizeContent,
  type Locale,
  type CopyKey,
} from "@/lib/localization";
import { str, type Content } from "@/types/content";
const key = "mm-site-preferences-v3";
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener(key, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(key, notify);
  };
};
const snapshot = () => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};
const Context = createContext<ReturnType<typeof makeValue> | null>(null);
function makeValue(content: Content, stored: string) {
  let prefs: { theme?: string; locale?: string } = {};
  try {
    const parsed = JSON.parse(stored || "{}");
    if (parsed && typeof parsed === "object") prefs = parsed;
  } catch {}
  const settings = content.site_settings[0];
  const enabled = {
    dark: settings?.data.dark_enabled !== false,
    soft: settings?.data.soft_enabled !== false,
  };
  if (!enabled.dark && !enabled.soft) enabled.dark = true;
  const defaultSoft = str(settings, "theme") === "Soft";
  const preferred =
    prefs.theme === "soft" || prefs.theme === "dark"
      ? prefs.theme
      : defaultSoft
        ? "soft"
        : "dark";
  const theme: "dark" | "soft" = enabled[preferred]
    ? preferred
    : enabled.dark
      ? "dark"
      : "soft";
  const locale: Locale = prefs.locale === "es" ? "es" : "en";
  return {
    content: localizeContent(content, locale),
    theme,
    locale,
    enabled,
    t: (k: CopyKey) =>
      str(settings, "ui_" + k + "_" + locale) || copy[locale][k],
    set: (change: Partial<{ theme: string; locale: Locale }>) => {
      const update = () => {
        try {
          localStorage.setItem(key, JSON.stringify({ ...prefs, ...change }));
        } catch {}
        window.dispatchEvent(new Event(key));
      };
      // A root snapshot freezes WebGL; scrolling during its theme crossfade
      // would display two different laptop poses. Keep the live scene here.
      const intro = document.querySelector<HTMLElement>(".intro-full");
      const inIntro =
        !!intro && Number(intro.dataset.introProgress || 0) < 0.94;
      if (
        document.startViewTransition &&
        !inIntro &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        document.startViewTransition(update);
      else update();
    },
  };
}
export function SiteProvider({
  content,
  children,
}: {
  content: Content;
  children: ReactNode;
}) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => ""),
    value = makeValue(content, stored);
  const settings = content.site_settings[0];
  const look = appearance(settings, value.theme);
  useEffect(() => {
    document.documentElement.lang = value.locale;
    document.documentElement.style.colorScheme =
      value.theme === "soft" ? "light" : "dark";
  }, [value.locale, value.theme]);
  return (
    <Context.Provider value={value}>
      <div {...look} lang={value.locale} data-theme={value.theme}>
        <MotionConfig
          reducedMotion={
            str(settings, "animation_intensity") === "Off" ? "always" : "user"
          }
        >
          {children}
        </MotionConfig>
      </div>
    </Context.Provider>
  );
}
export function useSite() {
  const value = useContext(Context);
  if (!value) throw new Error("SiteProvider required");
  return value;
}
export function PreferenceControls() {
  const { theme, locale, set, enabled, t } = useSite();
  const id = useId();
  return (
    <div className="preference-controls">
      <div className="segmented-control" role="group" aria-label={t("theme")}>
        {(["dark", "soft"] as const)
          .filter((v) => enabled[v])
          .map((v) => (
            <button
              key={v}
              type="button"
              aria-label={v === "soft" ? "Soft" : "Dark"}
              title={
                locale === "es"
                  ? v === "soft"
                    ? "Tema claro"
                    : "Tema oscuro"
                  : v === "soft"
                    ? "Light theme"
                    : "Dark theme"
              }
              aria-pressed={theme === v}
              onClick={() => set({ theme: v })}
            >
              {theme === v && (
                <motion.span
                  className="segment-selection"
                  layoutId={id + "theme"}
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                />
              )}
              <span aria-hidden="true">
                {v === "soft" ? <Sun size={19} /> : <Moon size={19} />}
              </span>
            </button>
          ))}
      </div>
      <div className="segmented-control language-switch">
        <button
          type="button"
          aria-label={
            locale === "es" ? "Cambiar a inglés" : "Switch to Spanish"
          }
          title={
            locale === "es"
              ? "Español · Cambiar a inglés"
              : "English · Switch to Spanish"
          }
          onClick={() => set({ locale: locale === "es" ? "en" : "es" })}
        >
          <span aria-hidden="true">
            <Globe2 size={19} />
          </span>
        </button>
      </div>
    </div>
  );
}
