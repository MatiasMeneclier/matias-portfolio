"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MoveHorizontal,
} from "lucide-react";
import Image from "@/components/portfolio/media-image";
import { MotionPreferences } from "@/components/animations/reveal";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { SqueezeCarouselProps } from "./carousel-squeeze";

export default function TouchCarousel({
  slides,
  defaultIndex = 0,
  onIndexChange,
  controls = true,
  label = "Featured",
  previousLabel = "Previous",
  nextLabel = "Next",
  swipeLabel = "Swipe to explore",
  keyboardWhenInView = false,
  autoplay = false,
  interval = 6000,
  radius = 16,
  accent = "var(--text)",
  accentForeground = "var(--surface)",
  className = "",
  panelClassName = "",
  style,
}: SqueezeCarouselProps) {
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const destination = useRef<number | null>(null);
  const [open, setOpen] = useState(
    Math.max(0, Math.min(defaultIndex, slides.length - 1)),
  );
  const current = useRef(open);
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const preference = useContext(MotionPreferences);
  const reduced = systemReduced || preference === "Off";

  const stride = useCallback(() => {
    const element = rail.current;
    const first = element?.children[0] as HTMLElement | undefined;
    const next = element?.children[1] as HTMLElement | undefined;
    return next && first
      ? next.offsetLeft - first.offsetLeft
      : element?.clientWidth || 1;
  }, []);
  const go = useCallback(
    (index: number, instant = false) => {
      const to = Math.max(0, Math.min(index, slides.length - 1));
      destination.current = to;
      rail.current?.scrollTo({
        left: to * stride(),
        behavior: reduced || instant ? "instant" : "smooth",
      });
    },
    [slides.length, stride, reduced],
  );
  const step = useCallback(
    (by: number) => go((destination.current ?? current.current) + by),
    [go],
  );
  const readPosition = useCallback(() => {
    frame.current = 0;
    const index = Math.max(
      0,
      Math.min(
        slides.length - 1,
        Math.round((rail.current?.scrollLeft || 0) / stride()),
      ),
    );
    current.current = index;
    setOpen(index);
  }, [slides.length, stride]);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const finish = () => {
      destination.current = null;
      readPosition();
    };
    const resize = new ResizeObserver(() => {
      // Preserve the selected project across rotation without animating layout.
      element.scrollTo({
        left: current.current * stride(),
        behavior: "instant",
      });
    });
    resize.observe(element);
    element.addEventListener("scrollend", finish);
    return () => {
      cancelAnimationFrame(frame.current);
      resize.disconnect();
      element.removeEventListener("scrollend", finish);
    };
  }, [readPosition, stride]);
  useEffect(() => {
    onIndexChange?.(open);
  }, [open, onIndexChange]);
  useEffect(() => {
    if (!keyboardWhenInView || slides.length < 2) return;
    const key = (event: KeyboardEvent) => {
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
      const box = region.current?.getBoundingClientRect();
      if (
        !box ||
        Math.min(box.bottom, innerHeight) - Math.max(box.top, 0) <
          Math.min(box.height, innerHeight) * 0.6
      )
        return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [keyboardWhenInView, slides.length, step]);
  useEffect(() => {
    if (!autoplay || reduced || slides.length < 2) return;
    const timer = setTimeout(() => go((open + 1) % slides.length), interval);
    return () => clearTimeout(timer);
  }, [autoplay, reduced, slides.length, open, interval, go]);
  if (!slides.length) return null;
  return (
    <div
      ref={region}
      className={`squeeze-carousel sq-touch ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      style={
        {
          "--sq-radius": typeof radius === "number" ? `${radius}px` : radius,
          "--sq-fill": accent,
          "--sq-on-fill": accentForeground,
          ...style,
        } as CSSProperties
      }
    >
      {controls && slides.length > 1 && (
        <div className="sq-controls">
          <span className="sq-count mono" aria-hidden="true">
            {String(open + 1).padStart(2, "0")}{" "}
            <span>/ {String(slides.length).padStart(2, "0")}</span>
          </span>
          <div>
            <button
              type="button"
              aria-label={previousLabel}
              disabled={open === 0}
              onClick={() => step(-1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              disabled={open === slides.length - 1}
              onClick={() => step(1)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div
        ref={rail}
        className="sq-touch-rail"
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        onPointerDown={() => {
          destination.current = null;
          const element = rail.current;
          element?.scrollTo({ left: element.scrollLeft, behavior: "instant" });
        }}
        onScroll={() => {
          if (!frame.current)
            frame.current = requestAnimationFrame(readPosition);
        }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const index =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? slides.length - 1
                : Math.max(
                    0,
                    Math.min(
                      slides.length - 1,
                      open + (event.key === "ArrowRight" ? 1 : -1),
                    ),
                  );
          go(index);
          (rail.current?.children[index] as HTMLElement | undefined)?.focus({
            preventScroll: true,
          });
        }}
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id ?? index}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={open === index}
            aria-controls={`${id}-panel`}
            aria-label={slide.title}
            tabIndex={open === index ? 0 : -1}
            data-single={slides.length === 1}
            className={`sq-touch-card ${panelClassName}`}
            onClick={() => go(index)}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.imageAlt || ""}
                width={1200}
                height={750}
                className="sq-touch-picture"
                draggable={false}
              />
            ) : (
              <span
                className="sq-touch-picture"
                aria-hidden="true"
                style={{
                  background:
                    slide.background ||
                    "linear-gradient(135deg, #8290bd, #d9a6ae)",
                }}
              />
            )}
            {slide.overlay && (
              <span className="sq-overlay" aria-hidden="true">
                {slide.overlay}
              </span>
            )}
          </button>
        ))}
      </div>
      {slides.length > 1 && (
        <p className="sq-swipe-hint">
          <MoveHorizontal size={16} aria-hidden="true" />
          {swipeLabel}
        </p>
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {open + 1} / {slides.length}: {slides[open]?.title}
      </span>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${open}`}
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
