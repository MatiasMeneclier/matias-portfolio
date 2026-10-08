"use client";

import { useLayoutEffect } from "react";
import { useSpring, useTransform } from "motion/react";
import { APPLE_CHROME_SPRING } from "@/lib/apple-motion";
import { usePastHero } from "./use-past-hero";

export function useScrollControls(reduced: boolean) {
  const visible = usePastHero();
  // One spring drives both surfaces, including reversals and the final hide.
  const progress = useSpring(0, {
    ...APPLE_CHROME_SPRING,
    restDelta: 0.001,
    restSpeed: 0.01,
  });
  const visibility = useTransform(progress, (value) =>
    value > 0 ? "visible" : "hidden",
  );

  useLayoutEffect(() => {
    if (reduced) progress.jump(visible ? 1 : 0);
    else progress.set(visible ? 1 : 0);
  }, [visible, reduced, progress]);

  return { visible, progress, visibility, reduced };
}

export type ScrollControls = ReturnType<typeof useScrollControls>;
