"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { animate, motion, type AnimationPlaybackControls } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { str, type Entry } from "@/types/content";
import {
  introPhase,
  range,
  smooth,
  INTRO_PROGRESS_EVENT,
  INTRO_SCROLL_VIEWPORTS,
  dampIntroProgress,
  type ScreenAnchor,
} from "@/lib/intro-motion";
import {
  PreferenceControls,
  useSite,
} from "@/components/portfolio/site-preferences";
const Scene = dynamic(() => import("./laptop-scene"), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function Intro({
  profile,
  settings,
  onFailure,
}: {
  profile: Entry;
  settings: Entry;
  onFailure: () => void;
}) {
  const { t, locale } = useSite();
  const anchor = useRef<ScreenAnchor>({ x: 0, y: 0, width: 0 });
  const skip = useRef<(() => void) | null>(null);
  const fastForward = useRef<(() => void) | null>(null);
  const holder = useRef<HTMLElement>(null),
    layer = useRef<HTMLDivElement>(null),
    title = useRef<HTMLDivElement>(null),
    progress = useRef({ value: 0 });
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)"),
    mobile = useMediaQuery("(max-width: 700px)");
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const enabled = settings.data.intro_enabled !== false;
  const reserved =
    !failed &&
    enabled &&
    !reduce &&
    str(settings, "animation_intensity") !== "Off";
  const full = reserved;
  useEffect(() => {
    if (!full || !holder.current) return;
    const intro = holder.current;
    const sticky = layer.current;
    const heading = title.current;
    const hero = document.querySelector<HTMLElement>(".portfolio-hero");
    const nav = document.querySelector<HTMLElement>(
      ".portfolio-nav:not(.portfolio-nav-floating)",
    );
    const files = document.querySelector<HTMLElement>(".file-nav");
    if (!hero) return;
    const rest = hero.querySelectorAll<HTMLElement>(
      ".hero-meta,.hero-degree,.hero-subtitle,.hero-description,.hero-buttons,.hero-side,.hero-shortcuts,.hero-portrait,.edit-shortcut",
    );
    const alpha = (element: HTMLElement) => (value: number) => {
      element.style.opacity = String(value);
      element.style.visibility = value <= 0.0001 ? "hidden" : "visible";
    };
    const setNavAlpha = nav ? alpha(nav) : undefined;
    const scene = layer.current?.querySelector<HTMLElement>(".scene");
    const backdrop =
      layer.current?.querySelector<HTMLElement>(".intro-backdrop");
    const chrome = [
      ...intro.querySelectorAll<HTMLElement>(".intro-top,.intro-bottom"),
    ];
    const reveals = [...rest].map((element) => ({
      alpha: alpha(element),
      start: element.matches(".hero-degree,.hero-subtitle,.hero-meta")
        ? 0.82
        : element.matches(".hero-description")
          ? 0.84
          : element.matches(".hero-buttons,.hero-side")
            ? 0.86
            : 0.87,
    }));
    let scrollStart = 0,
      scrollEnd = 1;
    const apply = () => {
      const p = progress.current.value,
        phase = introPhase(p);
      intro.dataset.introProgress = p.toFixed(3);
      anchor.current.invalidate?.();
      hero.style.opacity = String(phase.hero);
      hero.style.pointerEvents = p >= 0.94 ? "auto" : "none";
      hero.inert = p < 0.94;
      hero.style.setProperty("--hero-surface-reveal", String(phase.surface));
      reveals.forEach(({ alpha, start }) => {
        const reveal = smooth(range(p, start, Math.min(0.99, start + 0.08)));
        alpha(reveal);
      });
      setNavAlpha?.(phase.chrome);
      if (files) alpha(files)(phase.chrome);
      if (scene) scene.style.opacity = String(phase.canvas);
      if (backdrop) backdrop.style.opacity = String(1 - phase.background);
      if (title.current) {
        title.current.style.opacity = String(phase.title);
        title.current.style.transform = `translateY(${-18 * (1 - phase.title)}px)`;
      }
      chrome.forEach((element) => {
        const opacity = element.matches(".intro-top")
          ? phase.topControls
          : phase.controls;
        alpha(element)(opacity);
        element.inert = opacity < 0.05;
      });
      if (layer.current) {
        layer.current.style.opacity = String(phase.layer);
        layer.current.style.visibility =
          phase.layer <= 0.0001 ? "hidden" : "visible";
        layer.current.style.pointerEvents = p >= 0.94 ? "none" : "";
        layer.current.inert = p >= 0.94;
        if (scene) scene.style.pointerEvents = p >= 0.94 ? "none" : "auto";
      }
      window.dispatchEvent(
        new CustomEvent(INTRO_PROGRESS_EVENT, {
          detail: {
            progress: p,
            scrollEnd,
            background: phase.background,
          },
        }),
      );
    };
    let forwardTween: AnimationPlaybackControls | undefined;
    let frame = 0,
      lastTime = 0,
      target = 0,
      disposed = false;
    const tick = (time: number) => {
      frame = 0;
      const delta = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      progress.current.value = dampIntroProgress(
        progress.current.value,
        target,
        delta,
        mobile ? 0.04 : 1,
      );
      apply();
      if (progress.current.value !== target)
        frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };
    const onScroll = () => {
      target = range(window.scrollY, scrollStart, scrollEnd);
      if (!frame && progress.current.value !== target)
        frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      scrollStart = intro.getBoundingClientRect().top + window.scrollY;
      // The small viewport stays stable when a phone's address bar opens/closes.
      scrollEnd =
        scrollStart +
        intro.offsetHeight -
        (sticky?.offsetHeight || window.innerHeight);
      onScroll();
    };
    const cancelForward = () => {
      if (!forwardTween) return;
      forwardTween.stop();
      forwardTween = undefined;
      onScroll();
    };
    const cancelOnKey = (event: KeyboardEvent) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
          "Escape",
        ].includes(event.key)
      )
        cancelForward();
    };
    measure();
    cancelAnimationFrame(frame);
    frame = 0;
    progress.current.value = target;
    apply();
    skip.current = () => {
      cancelForward();
      cancelAnimationFrame(frame);
      frame = 0;
      window.scrollTo({ top: scrollEnd, behavior: "instant" });
      progress.current.value = target = 1;
      apply();
    };
    fastForward.current = () => {
      if (forwardTween || window.scrollY >= scrollEnd) return;
      forwardTween = animate(window.scrollY, scrollEnd, {
        type: "spring",
        duration: 2.5,
        bounce: 0,
        onUpdate: (scroll) => {
          window.scrollTo({
            top: Math.min(scrollEnd, scroll),
            behavior: "instant",
          });
          onScroll();
        },
        onComplete: () => {
          forwardTween = undefined;
          window.scrollTo({ top: scrollEnd, behavior: "instant" });
          onScroll();
        },
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(intro);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("wheel", cancelForward, { passive: true });
    window.addEventListener("touchstart", cancelForward, { passive: true });
    window.addEventListener("pointerdown", cancelForward, { passive: true });
    window.addEventListener("keydown", cancelOnKey);
    void document.fonts.ready.then(() => {
      if (!disposed) measure();
    });
    return () => {
      disposed = true;
      skip.current = null;
      fastForward.current = null;
      cancelForward();
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", cancelForward);
      window.removeEventListener("touchstart", cancelForward);
      window.removeEventListener("pointerdown", cancelForward);
      window.removeEventListener("keydown", cancelOnKey);
      [
        hero,
        nav,
        files,
        ...rest,
        heading,
        ...chrome,
        scene,
        backdrop,
        sticky,
      ].forEach((element) => {
        if (!element) return;
        for (const prop of ["opacity", "visibility", "pointer-events"])
          element.style.removeProperty(prop);
        element.inert = false;
      });
      heading?.style.removeProperty("transform");
      hero.style.removeProperty("--hero-surface-reveal");
      intro.removeAttribute("data-intro-progress");
    };
  }, [full, mobile]);
  const fallback = (
    <div className="intro-fallback">
      <span className="mono">
        {str(settings, "hero_statement").replaceAll("\n", " ")}
      </span>
      <a className="button" href="#portfolio">
        {t("explore")} <ArrowDown size={16} />
      </a>
    </div>
  );
  if (!enabled || reduce || str(settings, "animation_intensity") === "Off")
    return null;
  return (
    <section
      ref={holder}
      className={`intro ${full ? "intro-full" : "intro-simple"} ${reserved ? "intro-reserved" : ""}`}
      style={
        {
          "--intro-height": `${(1 + INTRO_SCROLL_VIEWPORTS) * 100}svh`,
        } as CSSProperties
      }
      aria-label={
        locale === "es"
          ? "Presentación de Matias Meneclier"
          : "Introduction to Matias Meneclier"
      }
    >
      <div ref={layer} className="intro-sticky">
        <div className="intro-backdrop" />
        <div className="intro-top">
          <a
            href="#portfolio"
            className="brand"
            onClick={(event) => {
              if (!skip.current) return;
              event.preventDefault();
              skip.current();
            }}
          >
            MM<span>/</span>
          </a>
          <PreferenceControls />
          <a href={str(profile, "linkedin")} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="intro-title" ref={title}>
          <h2>{str(settings, "intro_title")}</h2>
          <p>{str(settings, "hero_subtitle")}</p>
        </div>
        {full ? (
          <SceneBoundary
            fallback={fallback}
            onFailure={() => {
              setFailed(true);
              onFailure();
            }}
          >
            <div className="scene">
              <Scene
                progress={progress}
                profile={profile}
                anchor={anchor}
                onSkip={() => fastForward.current?.()}
                onReady={onReady}
                mobile={mobile}
              />
            </div>
          </SceneBoundary>
        ) : (
          fallback
        )}
        {full && !ready && (
          <p className="intro-loading" role="status">
            {locale === "es"
              ? "Preparando la laptop…"
              : "Preparing the laptop…"}
          </p>
        )}
        <div className="intro-bottom">
          <span>
            {str(profile, "short_location", str(profile, "location"))}
          </span>
          <div className="intro-entry">
            <motion.a
              href="#portfolio"
              className="intro-enter"
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(event) => {
                if (!fastForward.current) return;
                event.preventDefault();
                fastForward.current();
              }}
            >
              {t("explore")} <ArrowDown size={16} />
            </motion.a>
            <span className="intro-hint">
              {full
                ? locale === "es"
                  ? "O deslizá para abrir la laptop"
                  : mobile
                    ? "Swipe up to open the laptop"
                    : "Or scroll to open the laptop"
                : t("scroll")}
            </span>
          </div>
          <a
            href="#portfolio"
            onClick={(event) => {
              if (!skip.current) return;
              event.preventDefault();
              skip.current();
            }}
          >
            {t("skipIntro")}
          </a>
        </div>
      </div>
    </section>
  );
}
