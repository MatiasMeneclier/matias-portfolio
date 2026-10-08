import "@/app/admin/studio.css";
export const metadata = { robots: { index: false, follow: false } };
import { notFound } from "next/navigation";
import DemoProject from "@/components/admin/demo-project";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.ENABLE_ADMIN_DEMO !== "true"
  )
    notFound();
  return <DemoProject slug={(await params).slug} />;
}
