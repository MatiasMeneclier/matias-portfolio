import { notFound } from "next/navigation";
import { sections } from "@/lib/admin-config";
import DemoShell from "@/components/admin/demo-shell";
import "../../studio.css";
export const metadata = {
  title: "Demo — MM Studio",
  robots: { index: false, follow: false },
};
export default async function Demo({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.ENABLE_ADMIN_DEMO !== "true"
  )
    notFound();
  const args = (await params).section || [];
  const section = args[0] || "dashboard";
  if (args.length > 1 || !sections[section]) notFound();
  return <DemoShell section={section} />;
}
