"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useTransform } from "motion/react";
import type { ScrollControls } from "@/hooks/use-scroll-controls";
import { LiquidGlassSurface } from "@/components/ui/liquid-glass-button";
import { Menu, X, TerminalSquare } from "lucide-react";
import { PreferenceControls, useSite } from "./site-preferences";
import { AdminMenu } from "./admin-access";
import { str, type Entry } from "@/types/content";
export default function Navigation({
  items,
  onTerminal,
  terminal,
  scrollControls,
}: {
  items: Entry[];
  onTerminal: () => void;
  terminal: boolean;
  scrollControls: ScrollControls;
}) {
  const { t } = useSite();
  const pinned = scrollControls.visible;
  const y = useTransform(
    scrollControls.progress,
    (value) => `calc(${value - 1} * (100% + var(--floating-nav-top, 12px)))`,
  );
  const [floatingHost, setFloatingHost] = useState<HTMLElement | null>(null);
  const inlineHeader = useCallback((element: HTMLElement | null) => {
    if (element) setFloatingHost(element.closest<HTMLElement>(".portfolio"));
  }, []);
  const [open, setOpen] = useState(false),
    [active, setActive] = useState("about");
  useEffect(() => {
    if (!pinned) {
      const reset = requestAnimationFrame(() => setOpen(false));
      return () => cancelAnimationFrame(reset);
    }
  }, [pinned]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest(".portfolio-nav")
      )
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      document
        .querySelector<HTMLButtonElement>(
          ".portfolio-nav:not([inert]) .mobile-menu",
        )
        ?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    items.forEach((item) => {
      const el = document.getElementById(str(item, "section"));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);
  const headerContent = (floating: boolean) => {
    const menuOpen = open && (floating ? pinned : !pinned);
    return (
      <>
        {floating && <LiquidGlassSurface />}
        <a className="brand" href="#portfolio">
          MM<span>/</span>
        </a>
        <nav
          className={menuOpen ? "nav-links is-open" : "nav-links"}
          aria-label={t("sections")}
        >
          {items.map((item, i) => (
            <a
              onClick={() => setOpen(false)}
              key={item.id}
              aria-current={
                active === str(item, "section") ? "location" : undefined
              }
              href={"#" + str(item, "section")}
            >
              <span className="nav-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              {str(item, "label")}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <PreferenceControls />
          <AdminMenu />
          {terminal && (
            <button
              className="icon-button"
              onClick={onTerminal}
              aria-label={t("openTerminal")}
            >
              <TerminalSquare size={20} />
            </button>
          )}
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </>
    );
  };
  return (
    <>
      <header
        ref={inlineHeader}
        className="portfolio-nav"
        aria-hidden={pinned || undefined}
        inert={pinned ? true : undefined}
      >
        {headerContent(false)}
      </header>
      {/* Keep the floating glass outside the hero's intro opacity/inert transition. */}
      {floatingHost &&
        createPortal(
          <motion.header
            className="portfolio-nav portfolio-nav-floating is-pinned liquid-glass"
            data-visible={pinned}
            aria-hidden={!pinned || undefined}
            inert={!pinned ? true : undefined}
            initial={false}
            // Fading an ancestor isolates its backdrop until opacity reaches 1.
            // Slide the prepared glass itself so refraction stays live throughout.
            style={{
              y,
              visibility: scrollControls.visibility,
              opacity: 1,
              pointerEvents: pinned ? "auto" : "none",
            }}
          >
            {headerContent(true)}
          </motion.header>,
          floatingHost,
        )}
      <aside className="file-nav" aria-label="Explorador de secciones">
        <span className="mono file-root">matias-meneclier/</span>
        {items.map((item) => (
          <a
            key={item.id}
            href={"#" + str(item, "section")}
            className={active === str(item, "section") ? "active" : ""}
          >
            <span>├</span> {str(item, "filename")}
          </a>
        ))}
      </aside>
    </>
  );
}
