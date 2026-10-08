import { notFound } from "next/navigation";
import DemoPreview from "@/components/admin/demo-preview";
import "../admin/studio.css";
export const metadata = {
  title: "Vista previa local — Matias Meneclier",
  robots: { index: false, follow: false },
};
export default function Preview() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.ENABLE_ADMIN_DEMO !== "true"
  )
    notFound();
  return <DemoPreview />;
}
