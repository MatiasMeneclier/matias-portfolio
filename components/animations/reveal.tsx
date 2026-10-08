"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createContext, useContext, type ReactNode } from "react";
export const MotionPreferences = createContext("Full");
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const preference = useContext(MotionPreferences),
    mobile = useMediaQuery("(max-width: 700px)"),
    systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)"),
    reduced = systemReduced || preference === "Off";
  return (
    <motion.div
      className={"reveal " + className}
      initial={
        reduced
          ? false
          : { opacity: 0, y: preference === "Subtle" ? 8 : mobile ? 12 : 24 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: mobile ? "0px" : "0px 0px -30px 0px" }}
      transition={{ type: "spring", bounce: 0, visualDuration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}
export function MagneticLink({
  children,
  href,
  className = "button",
  ...rest
}: {
  children: ReactNode;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
}) {
  const x = useMotionValue(0),
    y = useMotionValue(0),
    sx = useSpring(x, { stiffness: 350, damping: 28 }),
    sy = useSpring(y, { stiffness: 350, damping: 28 });
  const preference = useContext(MotionPreferences),
    systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)"),
    reduced = systemReduced || preference !== "Full";
  return (
    <motion.a
      tabIndex={0}
      href={href}
      className={className}
      {...rest}
      style={{ x: sx, y: sy }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      onPointerMove={(e) => {
        if (reduced || !matchMedia("(pointer: fine)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.06);
        y.set((e.clientY - r.top - r.height / 2) * 0.1);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.a>
  );
}
