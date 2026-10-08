"use client";
import Image, { type ImageProps } from "next/image";
export default function MediaImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const optimize =
    src.startsWith("/") ||
    Boolean(storage && src.startsWith(storage + "/storage/"));
  return <Image {...props} alt={props.alt} unoptimized={!optimize} />;
}
