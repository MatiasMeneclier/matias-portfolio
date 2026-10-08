import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { collections, type Content, type Entry } from "@/types/content";
import { sections } from "@/lib/admin-config";
import AdminShell from "@/components/admin/admin-shell";
import "../../studio.css";
import { withCVDefaults } from "@/lib/cv-defaults";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "MM Studio — Administración",
  robots: { index: false, follow: false },
};
export default async function Admin({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const segments = (await params).section || [];
  const section = segments[0] || "dashboard";
  if (segments.length > 1 || !sections[section]) notFound();
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    redirect("/admin/login");
  let client;
  try {
    client = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const entries = await Promise.all(
    collections.map(async (table) => {
      const { data, error } = await client
        .from(table)
        .select("*")
        .order("sort_order");
      if (error) throw new Error("No se pudo cargar " + table);
      return [table, data as Entry[]];
    }),
  );
  return (
    <AdminShell
      initial={withCVDefaults(Object.fromEntries(entries) as Content)}
      section={section}
    />
  );
}
