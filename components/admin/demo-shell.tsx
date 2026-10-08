"use client";
import dynamic from "next/dynamic";
import { readDemo } from "@/store/demo";
const Shell = dynamic(() => import("./admin-shell"), {
  ssr: false,
  loading: () => <div className="center-page">Cargando Studio…</div>,
});
export default function DemoShell({ section }: { section: string }) {
  return <Shell section={section} initial={readDemo()} demo />;
}
