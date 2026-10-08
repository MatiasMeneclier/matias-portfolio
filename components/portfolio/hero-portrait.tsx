"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LiquidGlassSurface } from "@/components/ui/liquid-glass-button";
import Image from "./media-image";
import { str, type Entry } from "@/types/content";

export default function HeroPortrait({
  profile,
  children,
}: {
  profile: Entry;
  children: ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const photo = str(profile, "photo");

  useEffect(() => {
    const element = frame.current;
    const hero = element?.closest<HTMLElement>(".portfolio-hero");
    if (!element || !hero || !photo) return;
    // Cut only the opaque hero surface behind this lens. The glass samples
    // the existing live background; no duplicate shader or wallpaper is used.
    const update = () => {
      const parent = hero.getBoundingClientRect();
      const card = element.getBoundingClientRect();
      if (!parent.width || !parent.height || !card.width || !card.height)
        return;
      // The hero's ::before covers its padding box, not its outer border box.
      // Match that coordinate space so the cutout does not leave a side seam.
      const heroStyle = getComputedStyle(hero);
      const left = parseFloat(heroStyle.borderLeftWidth) || 0;
      const top = parseFloat(heroStyle.borderTopWidth) || 0;
      const width =
        parent.width - left - (parseFloat(heroStyle.borderRightWidth) || 0);
      const height =
        parent.height - top - (parseFloat(heroStyle.borderBottomWidth) || 0);
      const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius);
      const mask = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><mask id="cutout" maskUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="white"/><rect x="${card.left - parent.left - left}" y="${card.top - parent.top - top}" width="${card.width}" height="${card.height}" rx="${radius}" fill="black"/></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#cutout)"/></svg>`;
      hero.style.setProperty(
        "--hero-portrait-cutout",
        `url("data:image/svg+xml,${encodeURIComponent(mask)}")`,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(hero);
    observer.observe(element);
    return () => {
      observer.disconnect();
      hero.style.removeProperty("--hero-portrait-cutout");
    };
  }, [photo]);

  return (
    <div
      ref={frame}
      className={"hero-portrait" + (photo ? " liquid-glass" : "")}
      aria-hidden={!photo}
    >
      {photo ? (
        <>
          <LiquidGlassSurface refractionScale={12} refractionDepth={40} />
          <Image
            src={photo}
            alt={str(profile, "first_name") + " " + str(profile, "last_name")}
            fill
            sizes="(max-width: 720px) 84vw, 42vw"
            preload
            style={{
              objectPosition: str(profile, "photo_position", "50% 50%"),
            }}
          />
        </>
      ) : (
        children
      )}
    </div>
  );
}
