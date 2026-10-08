"use client";

import { useEffect, useState } from "react";

export function usePastHero() {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".portfolio-hero");
    if (!hero) return;
    const navigation = hero.querySelector(
      ".portfolio-nav:not(.portfolio-nav-floating)",
    );
    if (!navigation) return;
    let frame = 0;
    const update = () => {
      const bottom = navigation.getBoundingClientRect().bottom;
      // Show both controls just after the inline navigation leaves the screen.
      // A small return margin keeps trackpad noise from toggling them.
      setPast((current) => bottom <= (current ? 8 : -24));
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    // A fast scroll can skip the navigation without crossing an observer threshold.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(hero);
    resize.observe(navigation);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return past;
}
