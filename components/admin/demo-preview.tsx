"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { readDemo } from "@/store/demo";
const Portfolio = dynamic(() => import("@/components/portfolio/portfolio"), {
  ssr: false,
});
export default function DemoPreview() {
  return (
    <>
      <Portfolio
        content={readDemo()}
        skipIntro
        projectBase="/preview/projects"
      />
      <Link className="preview-banner" href="/admin/demo">
        DEMO LOCAL · Volver a Studio ↗
      </Link>
    </>
  );
}
