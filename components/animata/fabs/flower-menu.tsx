"use client";

import type { ComponentType, KeyboardEvent, SVGProps } from "react";
import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { motion, useTransform } from "motion/react";
import { LiquidGlassSurface } from "@/components/ui/liquid-glass-button";
import type { ScrollControls } from "@/hooks/use-scroll-controls";
import "./flower-menu.css";

export type FlowerMenuItem = {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  keepOpen?: boolean;
};

type FlowerMenuProps = {
  menuItems: FlowerMenuItem[];
  scrollControls: ScrollControls;
  motionOff?: boolean;
  triggerLabel: string;
  closeLabel: string;
  menuLabel: string;
};

// Two concentric quarter-disc arcs share the stationary trigger's center.
// Four outer targets and three inner targets mirror across the 45-degree axis.
const CORNER_ARCS = [
  { radius: 132, angle: 90 },
  { radius: 132, angle: 60 },
  { radius: 132, angle: 30 },
  { radius: 132, angle: 0 },
  { radius: 72, angle: 90 },
  { radius: 72, angle: 45 },
  { radius: 72, angle: 0 },
];

// Adapted from Animata's Flower Menu with a fixed corner anchor.
export default function FlowerMenu({
  menuItems,
  scrollControls,
  motionOff = false,
  triggerLabel,
  closeLabel,
  menuLabel,
}: FlowerMenuProps) {
  const menuId = useId();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>(
    [],
  );
  const [expanded, setExpanded] = useState(false);
  const visible = scrollControls.visible;
  const x = useTransform(
    scrollControls.progress,
    (value) =>
      `calc(${value - 1} * (100% + max(24px, env(safe-area-inset-left))))`,
  );
  const y = useTransform(scrollControls.progress, [0, 1], [20, 0]);
  const isOpen = visible && expanded;
  const reduced = scrollControls.reduced || motionOff;
  const transition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.85 };

  useLayoutEffect(() => {
    itemRefs.current.forEach((item) => {
      if (item?.parentElement && (isOpen || reduced)) {
        // Inherit the root's visibility so no petal can outlive the shared exit.
        item.parentElement.style.visibility = isOpen ? "inherit" : "hidden";
      }
    });
  }, [visible, isOpen, reduced]);

  function close(restoreFocus = false) {
    setExpanded(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!isOpen) return;
    const first = itemRefs.current.find(
      (node) => node?.getAttribute("aria-disabled") !== "true",
    );
    first?.focus({ preventScroll: true });
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [isOpen]);

  useEffect(() => {
    // Reset without a render-phase effect when scrolling back into the hero.
    if (!visible) {
      const reset = requestAnimationFrame(() => setExpanded(false));
      return () => cancelAnimationFrame(reset);
    }
  }, [visible]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (!isOpen || !menuItems.length) return;
    const current = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    let next: number;
    switch (event.key) {
      case "Home":
        next = 0;
        break;
      case "End":
        next = menuItems.length - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % menuItems.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + menuItems.length) % menuItems.length;
        break;
      default:
        return;
    }
    event.preventDefault();
    itemRefs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <motion.nav
      ref={root}
      className="flower-menu"
      aria-label={menuLabel}
      aria-hidden={!visible || undefined}
      inert={!visible ? true : undefined}
      data-visible={visible}
      data-open={isOpen}
      initial={false}
      style={{
        x,
        y,
        visibility: scrollControls.visibility,
        opacity: 1,
      }}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <div className="flower-bloom">
        <ul
          id={menuId}
          role="menu"
          aria-label={menuLabel}
          inert={!isOpen ? true : undefined}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const arc = CORNER_ARCS[index] ?? {
              radius: 196 + Math.floor((index - 7) / 3) * 64,
              angle: 90 - ((index - 7) % 3) * 45,
            };
            const radians = (arc.angle * Math.PI) / 180;
            const position = {
              x: Math.cos(radians) * arc.radius,
              y: -Math.sin(radians) * arc.radius,
            };
            const itemProps = {
              role: "menuitem",
              className: "flower-action liquid-glass",
              "aria-label": item.label,
              "aria-disabled": item.disabled || undefined,
              title: item.label,
              tabIndex: isOpen ? 0 : -1,
              onClick: () => {
                if (item.disabled) return;
                if (!item.keepOpen) close(true);
                item.onSelect?.();
              },
            };
            return (
              <motion.li
                key={item.key}
                role="none"
                className="flower-petal"
                initial={false}
                animate={{
                  x: isOpen ? position.x : 0,
                  y: isOpen ? position.y : 0,
                  scale: isOpen ? 1 : 0.72,
                }}
                transition={transition}
                style={{ opacity: 1, pointerEvents: isOpen ? "auto" : "none" }}
                onAnimationComplete={() => {
                  const petal = itemRefs.current[index]?.parentElement;
                  if (!isOpen && petal) petal.style.visibility = "hidden";
                }}
              >
                {item.href && !item.disabled ? (
                  <motion.a
                    {...itemProps}
                    whileHover={reduced ? undefined : { scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    transition={transition}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                  >
                    <LiquidGlassSurface />
                    <Icon aria-hidden="true" width={21} height={21} />
                  </motion.a>
                ) : (
                  <motion.button
                    {...itemProps}
                    whileHover={reduced ? undefined : { scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    transition={transition}
                    type="button"
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                  >
                    <LiquidGlassSurface />
                    <Icon aria-hidden="true" width={21} height={21} />
                  </motion.button>
                )}
              </motion.li>
            );
          })}
        </ul>
        <motion.button
          ref={trigger}
          type="button"
          className="flower-trigger liquid-glass"
          aria-label={isOpen ? closeLabel : triggerLabel}
          title={isOpen ? closeLabel : triggerLabel}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setExpanded(!isOpen)}
          whileTap={{ scale: 0.94 }}
          transition={transition}
        >
          <LiquidGlassSurface />
          <span className="flower-bars" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                initial={false}
                animate={{
                  y: isOpen ? 0 : (index - 1) * 6,
                  rotate: isOpen ? (index === 1 ? 45 : -45) : 0,
                  opacity: isOpen && index === 0 ? 0 : 1,
                }}
                transition={transition}
              />
            ))}
          </span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
