"use client";

import { useLayoutEffect, useId, useRef, type ComponentProps } from "react";
import "./liquid-glass.css";

// Maps encode sampling of the live page, not replacement wallpaper. Identical
// lenses share a cached bitmap; geometry is rebuilt only on layout resize.
const lensMaps = new Map<string, string>();

function convexMap(
  width: number,
  height: number,
  radius: number,
  edgeDepth: number,
) {
  const key = `${width}:${height}:${radius}:${edgeDepth}`;
  const cached = lensMaps.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const image = context.createImageData(width, height);
  const halfW = width / 2,
    halfH = height / 2;
  const circular = Math.abs(width - height) <= 2 && radius >= halfH - 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - halfW,
        py = y + 0.5 - halfH;
      let dx = 0,
        dy = 0;
      if (circular) {
        const nx = px / halfW,
          ny = py / halfH;
        const distance = nx * nx + ny * ny;
        if (distance < 1) {
          // Convex magnification, smoothly returning at the curved perimeter.
          const bend = Math.sin(Math.pow(distance, 0.8) * Math.PI);
          dx = -nx * bend;
          dy = -ny * bend;
        }
      } else {
        // Rounded-rectangle distance and normal: the toolbar has a physical
        // bevel of constant thickness rather than an elongated circular lens.
        const qx = Math.abs(px) - (halfW - radius);
        const qy = Math.abs(py) - (halfH - radius);
        const ox = Math.max(qx, 0),
          oy = Math.max(qy, 0);
        const length = Math.hypot(ox, oy);
        const distance = length + Math.min(Math.max(qx, qy), 0) - radius;
        const depth = Math.min(edgeDepth, halfH);
        if (distance <= 0 && distance > -depth) {
          const bend = Math.sin((-distance / depth) * Math.PI);
          const nx = length > 0 ? ox / length : qx > qy ? 1 : 0;
          const ny = length > 0 ? oy / length : qx > qy ? 0 : 1;
          dx = -Math.sign(px) * nx * bend;
          dy = -Math.sign(py) * ny * bend;
        }
      }
      const i = (y * width + x) * 4;
      image.data[i] = Math.round(128 + dx * 120);
      image.data[i + 1] = Math.round(128 + dy * 120);
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const url = canvas.toDataURL();
  if (lensMaps.size >= 24) lensMaps.delete(lensMaps.keys().next().value!);
  lensMaps.set(key, url);
  return url;
}

export function LiquidGlassSurface({
  refractionScale,
  refractionDepth = 24,
}: {
  refractionScale?: number;
  refractionDepth?: number;
} = {}) {
  const id = `liquid-lens-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layer = useRef<HTMLSpanElement>(null);
  const map = useRef<SVGFEImageElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);

  useLayoutEffect(() => {
    const element = layer.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    const resize = () => {
      // Layout dimensions ignore entrance and press transforms.
      const width = Math.round(element.offsetWidth);
      const height = Math.round(element.offsetHeight);
      if (!width || !height) return;
      const corner = getComputedStyle(parent).borderTopLeftRadius;
      const radius = Math.min(
        width / 2,
        height / 2,
        parseFloat(corner) *
          (corner.endsWith("%") ? Math.min(width, height) / 100 : 1),
      );
      const url = convexMap(width, height, radius, refractionDepth);
      if (!url) return;
      map.current?.setAttribute("href", url);
      displacement.current?.setAttribute(
        "scale",
        String(refractionScale ?? (width > height * 2 ? 34 : 28)),
      );
      element.style.setProperty("--liquid-refraction", `url("#${id}")`);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [id, refractionScale, refractionDepth]);

  return (
    <>
      <svg
        className="liquid-glass-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={id}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              ref={map}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="convex-lens"
            />
            <feDisplacementMap
              ref={displacement}
              in="SourceGraphic"
              in2="convex-lens"
              scale={refractionScale ?? 28}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <span ref={layer} className="liquid-glass-layer" aria-hidden="true" />
      <span className="liquid-glass-edge" aria-hidden="true" />
    </>
  );
}

export function LiquidButton({
  children,
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button {...props} className={`liquid-glass liquid-button ${className}`}>
      <LiquidGlassSurface />
      <span className="liquid-button-content">{children}</span>
    </button>
  );
}
