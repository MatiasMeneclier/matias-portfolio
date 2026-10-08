"use client";
import { useEffect, useRef, useState } from "react";
import Velaris from "@/components/ui/velaris";
import { useSite } from "./site-preferences";
import { str } from "@/types/content";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  INTRO_PROGRESS_EVENT,
  introPhase,
  type IntroProgressDetail,
} from "@/lib/intro-motion";

const SOFT_COLORS = ["#e7a6aa", "#9daee8", "#e7a6aa", "#9daee8"];
const DARK_COLORS = ["#153d7a", "#468ee6", "#153d7a", "#468ee6"];

export default function AmbientBackground({
  fullIntro,
}: {
  fullIntro: boolean;
}) {
  const { theme, content } = useSite();
  const layer = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const soft = theme === "soft";
  const settings = content.site_settings[0];
  const mobile = useMediaQuery("(max-width: 700px)");
  useEffect(() => {
    const element = layer.current;
    const portfolio = element?.closest<HTMLElement>(".portfolio");
    if (!element || !portfolio) return;
    let active: boolean | undefined;
    let height = innerHeight,
      origin = 0;
    const intro = document.querySelector<HTMLElement>(".intro-full");
    let progress = Number(intro?.dataset.introProgress || 0);
    let opacity = fullIntro ? introPhase(progress).background : 1;
    const draw = () => {
      const offset = scrollY;
      const value = fullIntro
        ? opacity
        : Math.min(
            1,
            Math.max(
              0,
              (height - origin + offset) / Math.max(1, height * 0.35),
            ),
          );
      element.style.opacity = String(value);
      element.dataset.visible = String(value > 0.0001);
      // Warm the renderer before the shared intro fade makes it visible.
      const running = value > 0.0001 || (fullIntro && progress >= 0.72);
      if (active !== running) {
        active = running;
        setReady(running);
      }
    };
    const measure = () => {
      height = innerHeight;
      origin = portfolio.getBoundingClientRect().top + scrollY;
      draw();
    };
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<IntroProgressDetail>).detail;
      progress = detail.progress;
      opacity = detail.background;
      draw();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(portfolio);
    window.addEventListener(INTRO_PROGRESS_EVENT, onProgress);
    if (!fullIntro) window.addEventListener("scroll", draw, { passive: true });
    window.addEventListener("resize", measure);
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener(INTRO_PROGRESS_EVENT, onProgress);
      window.removeEventListener("scroll", draw);
      window.removeEventListener("resize", measure);
    };
  }, [fullIntro]);
  return (
    <div ref={layer} className="portfolio-ambient" aria-hidden="true">
      <Velaris
        resolutionScale={mobile ? 0.65 : 0.85}
        frameRate={mobile ? 24 : 30}
        paused={!ready}
        height="100%"
        bg={
          soft
            ? str(settings, "soft_background", "#f8f7f3")
            : str(settings, "background", "#08090b")
        }
        colors={soft ? SOFT_COLORS : DARK_COLORS}
        speed={str(settings, "animation_intensity") === "Off" ? 0 : 0.85}
        grain={0.08}
        vignette={soft ? 0 : 0.18}
        glow={soft ? 0 : 0.18}
      />
    </div>
  );
}
