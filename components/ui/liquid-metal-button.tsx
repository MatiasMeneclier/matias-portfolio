"use client";

import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from "react";
import { motion } from "motion/react";
import type { ShaderMount } from "@paper-design/shaders";
import { MotionPreferences } from "@/components/animations/reveal";
import { useMediaQuery } from "@/hooks/use-media-query";
import "./liquid-metal-button.css";

interface LiquidMetalButtonProps {
  children?: ReactNode;
  label?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function LiquidMetalButton({
  children,
  label = "Get Started",
  href,
  type = "button",
  disabled = false,
  className = "",
}: LiquidMetalButtonProps) {
  const shaderRef = useRef<HTMLSpanElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);
  const hovered = useRef(false);
  const boostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleId = useRef(0);
  const [ripples, setRipples] = useState<
    { x: number; y: number; id: number }[]
  >([]);
  const preference = useContext(MotionPreferences);
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const reduced = systemReduced || preference === "Off";

  useEffect(() => {
    const element = shaderRef.current;
    if (!element) return;
    let cancelled = false;
    let loading = false;

    // Mount only when needed. ShaderMount itself pauses offscreen and in hidden tabs.
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;
      loading = true;
      observer.disconnect();
      try {
        const { ShaderMount, liquidMetalFragmentShader } =
          await import("@paper-design/shaders");
        if (cancelled) return;
        shaderMount.current = new ShaderMount(
          element,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_isImage: false,
            u_colorBack: [0, 0, 0, 0],
            u_colorTint: [1, 1, 1, 0],
            u_fit: 0,
            u_rotation: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_worldWidth: 0,
            u_worldHeight: 0,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          { alpha: true, antialias: false, powerPreference: "low-power" },
          reduced || disabled ? 0 : 0.6,
          1200,
          1,
          160_000,
        );
      } catch {
        // The static metallic rim remains usable when WebGL is unavailable.
        element.replaceChildren();
      }
    });
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (boostTimer.current) clearTimeout(boostTimer.current);
      shaderMount.current?.dispose();
      shaderMount.current = null;
    };
  }, [reduced, disabled]);

  const interactions = {
    className: "liquid-metal-button " + className,
    whileTap: disabled || reduced ? undefined : { scale: 0.98, y: 1 },
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 34,
      mass: 0.85,
    },
    onPointerEnter: () => {
      hovered.current = true;
      if (!disabled && !reduced) shaderMount.current?.setSpeed(1);
    },
    onPointerLeave: () => {
      hovered.current = false;
      if (!disabled && !reduced) shaderMount.current?.setSpeed(0.6);
    },
    onPointerDown: (
      event: PointerEvent<HTMLAnchorElement | HTMLButtonElement>,
    ) => {
      if (disabled || reduced || event.button !== 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ripple = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        id: rippleId.current++,
      };
      setRipples((previous) => [...previous.slice(-3), ripple]);
      shaderMount.current?.setSpeed(2.4);
      if (boostTimer.current) clearTimeout(boostTimer.current);
      boostTimer.current = setTimeout(() => {
        shaderMount.current?.setSpeed(hovered.current ? 1 : 0.6);
      }, 300);
    },
  };
  const content = (
    <>
      <span
        className="liquid-metal-shader"
        ref={shaderRef}
        aria-hidden="true"
      />
      <span className="liquid-metal-face" aria-hidden="true" />
      <span className="liquid-metal-label">{children || label}</span>
      <span className="liquid-metal-ripples" aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="liquid-metal-ripple"
            style={{ left: ripple.x, top: ripple.y }}
            onAnimationEnd={() =>
              setRipples((previous) =>
                previous.filter(({ id }) => id !== ripple.id),
              )
            }
          />
        ))}
      </span>
    </>
  );
  return href ? (
    <motion.a {...interactions} href={href}>
      {content}
    </motion.a>
  ) : (
    <motion.button {...interactions} type={type} disabled={disabled}>
      {content}
    </motion.button>
  );
}
