import { getContent } from "@/services/content";
import CVView from "@/components/portfolio/cv-view";
import { buildCV } from "@/lib/cv";
export const dynamic = "force-dynamic";
export const metadata = { title: "CV — Matias Meneclier" };
export default async function CV({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  const locale = lang === "es" ? "es" : "en";
  return <CVView cv={buildCV(await getContent(), locale)} />;
}
