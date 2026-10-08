"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "@/components/portfolio/media-image";
import { MotionPreferences } from "@/components/animations/reveal";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  createSqueezeWindow,
  settleSqueezeWindow,
  stepSqueezeWindow,
  visiblePanels,
  wrapSlide,
} from "@/lib/squeeze-carousel";
import "./carousel-squeeze.css";
import TouchCarousel from "./carousel-touch";

export type SqueezeSlide = {
  id?: string | number;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  background?: string;
  overlay?: ReactNode;
  meta?: ReactNode;
  action?: string;
  href?: string;
  target?: string;
  onAction?: () => void;
};
type Size = number | string;
export type SqueezeCarouselProps = {
  slides: SqueezeSlide[];
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  height?: Size;
  slatWidth?: Size;
  slatGap?: Size;
  gap?: Size;
  radius?: Size;
  duration?: number;
  hoverGrow?: boolean;
  autoplay?: boolean;
  interval?: number;
  controls?: boolean;
  accent?: string;
  accentForeground?: string;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  swipeLabel?: string;
  keyboardWhenInView?: boolean;
  panelClassName?: string;
} & Omit<ComponentProps<"div">, "onSelect">;
const size = (value: Size) =>
  typeof value === "number" ? `${value}px` : value;
const SHARES = [-0.06, 0.61, 0.3, 0.15];
const STRETCHED = [0, 0.71, 0.4, 0.25];
const SQUEEZED = [-0.12, 0.59, 0.28, 0.13];

export function SqueezeCarousel({
  swipeLabel,
  onIndexChange,
  ...props
}: SqueezeCarouselProps) {
  const mobile = useMediaQuery("(max-width: 700px)");
  const [selected, setSelected] = useState(props.defaultIndex ?? 0);
  const select = useCallback(
    (index: number) => {
      setSelected(index);
      onIndexChange?.(index);
    },
    [onIndexChange],
  );
  return mobile ? (
    <TouchCarousel
      {...props}
      swipeLabel={swipeLabel}
      defaultIndex={selected}
      onIndexChange={select}
    />
  ) : (
    <DesktopSqueezeCarousel
      {...props}
      defaultIndex={selected}
      onIndexChange={select}
    />
  );
}

function DesktopSqueezeCarousel({
  slides,
  defaultIndex = 0,
  onIndexChange,
  height = "clamp(180px, 32cqi, 320px)",
  slatWidth = 8,
  slatGap = 8,
  gap = 16,
  radius = 16,
  duration = 650,
  hoverGrow = true,
  autoplay = false,
  interval = 6000,
  controls = true,
  accent = "var(--text)",
  accentForeground = "var(--surface)",
  label = "Featured",
  previousLabel = "Previous",
  nextLabel = "Next",
  keyboardWhenInView = false,
  panelClassName = "",
  className = "",
  style,
  ...props
}: SqueezeCarouselProps) {
  const count = slides.length;
  const slats = Math.max(0, visiblePanels(count) - 4);
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const preference = useContext(MotionPreferences);
  const reduced = systemReduced || preference === "Off";
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const ms = reduced ? 0 : preference === "Subtle" ? 400 : duration;
  const id = useId();
  const region = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const focusNext = useRef(false);
  const [window, setWindow] = useState(() =>
    createSqueezeWindow(count, defaultIndex),
  );
  const [revision, setRevision] = useState(0);
  const [hover, setHover] = useState(-1);
  const [paused, setPaused] = useState(false);
  const open =
    window.cards[-window.column]?.slide ?? wrapSlide(defaultIndex, count);

  const step = useCallback(
    (by: number) => {
      if (count < 2 || !by) return;
      // Preserve the current painted position when prepending during an interrupted slide.
      const matrix = strip.current
        ? getComputedStyle(strip.current).transform
        : "none";
      const pixels = matrix === "none" ? 0 : new DOMMatrixReadOnly(matrix).m41;
      const unit = measure.current?.getBoundingClientRect().width || 24;
      setWindow((current) =>
        stepSqueezeWindow(current, by, count, pixels / unit),
      );
      setHover(-1);
      setRevision((value) => value + 1);
    },
    [count],
  );
  useEffect(() => {
    if (!keyboardWhenInView || count < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !["ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            'input,textarea,select,[role="slider"],[role="menu"],[role="dialog"]',
          ))
      )
        return;
      const element = region.current;
      if (!element) return;
      const box = element.getBoundingClientRect();
      const visible = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
      if (box.width <= 0 || visible < Math.min(box.height, innerHeight) * 0.6)
        return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };
    globalThis.window.addEventListener("keydown", onKeyDown);
    return () => globalThis.window.removeEventListener("keydown", onKeyDown);
  }, [keyboardWhenInView, count, step]);
  const go = (to: number) => {
    const distance = wrapSlide(to - open, count);
    step(distance <= count / 2 ? distance : distance - count);
  };
  useLayoutEffect(() => {
    if (!window.still) return;
    const frame = requestAnimationFrame(() =>
      setWindow((current) => ({
        ...current,
        slid: current.column,
        still: false,
      })),
    );
    return () => cancelAnimationFrame(frame);
  }, [window.still, revision]);
  useEffect(() => {
    if (!revision) return;
    const timer = setTimeout(
      () => setWindow((current) => settleSqueezeWindow(current, count)),
      ms + 40,
    );
    return () => clearTimeout(timer);
  }, [revision, count, ms]);
  useLayoutEffect(() => {
    if (!focusNext.current) return;
    strip.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.focus({ preventScroll: true });
    focusNext.current = false;
  }, [open]);
  useEffect(() => {
    onIndexChange?.(open);
  }, [open, onIndexChange]);
  useEffect(() => {
    if (!autoplay || paused || reduced || count < 2) return;
    const timer = setTimeout(() => step(1), interval);
    return () => clearTimeout(timer);
  }, [autoplay, paused, reduced, count, open, interval, step]);
  if (!count) return null;

  const widthOf = (column: number) => {
    if (count === 1) return "100cqi";
    if (column < 0 || column > 3) return "var(--sq-slat)";
    if (count < 4) {
      const shares = count === 2 ? [0.76, 0.24] : [0.64, 0.24, 0.12];
      return `calc((100cqi - ${count - 1} * var(--sq-gap)) * ${shares[column] ?? 0})`;
    }
    const shares =
      hoverGrow && finePointer && !reduced && hover >= 0 && hover <= 3
        ? hover === column
          ? STRETCHED
          : SQUEEZED
        : SHARES;
    return column === 0
      ? `calc(var(--sq-hero) + var(--sq-room) * ${shares[column]})`
      : `calc(var(--sq-room) * ${shares[column]})`;
  };
  const vars = {
    "--sq-h": size(height),
    "--sq-gap": size(gap),
    "--sq-slat-gap": size(slatGap),
    "--sq-slat": size(slatWidth),
    "--sq-radius": size(radius),
    "--sq-ms": `${ms}ms`,
    "--sq-fill": accent,
    "--sq-on-fill": accentForeground,
    "--sq-hero": "calc(var(--sq-h) * 16 / 9)",
    "--sq-room": `calc(100cqi - var(--sq-hero) - ${slats} * (var(--sq-slat-gap) + var(--sq-slat)) - 3 * var(--sq-gap))`,
    ...style,
  } as CSSProperties;
  return (
    <div
      {...props}
      ref={region}
      className={`squeeze-carousel ${className}`}
      style={vars}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      aria-keyshortcuts={
        keyboardWhenInView ? "ArrowLeft ArrowRight" : undefined
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setHover(-1);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
    >
      <span className="sq-unit" ref={measure} aria-hidden="true" />
      {controls && count > 1 && (
        <div className="sq-controls">
          <span className="sq-count mono" aria-hidden="true">
            {String(open + 1).padStart(2, "0")}{" "}
            <span>/ {String(count).padStart(2, "0")}</span>
          </span>
          <div>
            <button
              type="button"
              aria-label={previousLabel}
              onClick={() => step(-1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() => step(1)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div className="sq-viewport">
        <div
          ref={strip}
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          className="sq-strip"
          style={{
            transform: `translateX(calc(${window.slid} * (var(--sq-slat) + var(--sq-gap))))`,
            transition: window.still
              ? "none"
              : "transform var(--sq-ms) var(--sq-ease)",
          }}
          onKeyDown={(event) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            focusNext.current = true;
            if (event.key === "Home") go(0);
            else if (event.key === "End") go(count - 1);
            else step(event.key === "ArrowRight" ? 1 : -1);
          }}
        >
          {window.cards.map((card, place) => {
            const column = place + window.column;
            const slide = slides[card.slide];
            if (!slide) return null;
            const front = column === 0;
            const inView = column >= 0 && column < visiblePanels(count);
            return (
              <button
                key={card.key}
                type="button"
                role="tab"
                id={`${id}-tab-${card.key}`}
                aria-selected={front}
                aria-controls={`${id}-panel`}
                aria-label={slide.title}
                aria-hidden={!inView}
                tabIndex={front ? 0 : -1}
                data-front={front}
                data-single={count === 1}
                className={`sq-card ${panelClassName}`}
                onPointerMove={() => {
                  if (hoverGrow && finePointer) setHover(column);
                }}
                onClick={() => {
                  if (column > 0) step(column);
                }}
                style={{
                  width: widthOf(column),
                  marginLeft:
                    place === 0
                      ? 0
                      : column < 4
                        ? "var(--sq-gap)"
                        : "var(--sq-slat-gap)",
                  transitionDuration: window.still ? "0s" : "var(--sq-ms)",
                }}
              >
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt || ""}
                    width={1200}
                    height={750}
                    className="sq-picture"
                    draggable={false}
                  />
                ) : (
                  <span
                    className="sq-picture"
                    aria-hidden="true"
                    style={{
                      background:
                        slide.background ||
                        "linear-gradient(135deg, #8290bd, #d9a6ae)",
                    }}
                  />
                )}
                {slide.overlay && (
                  <span
                    aria-hidden="true"
                    className="sq-overlay"
                    style={{ opacity: front ? 1 : 0 }}
                  >
                    {slide.overlay}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-live="polite"
        aria-labelledby={`${id}-tab-${window.cards[-window.column]?.key}`}
        className="sq-details"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id ?? index}
            className="sq-detail"
            aria-hidden={index !== open}
            inert={index !== open}
            style={{
              opacity: index === open ? 1 : 0,
              visibility: index === open ? "visible" : "hidden",
              pointerEvents: index === open ? "auto" : "none",
            }}
          >
            <div className="sq-copy">
              <h3>{slide.title}</h3>
              {slide.description && <p>{slide.description}</p>}
              {slide.meta}
            </div>
            {slide.action &&
              (slide.href ? (
                <a
                  className="sq-action"
                  href={slide.href}
                  target={slide.target}
                  rel={
                    slide.target === "_blank"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  tabIndex={index === open ? 0 : -1}
                  onClick={slide.onAction}
                >
                  {slide.action}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              ) : (
                <button
                  className="sq-action"
                  type="button"
                  tabIndex={index === open ? 0 : -1}
                  onClick={slide.onAction}
                >
                  {slide.action}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
export default SqueezeCarousel;
