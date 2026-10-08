import { notFound } from "next/navigation";
import ProjectDetail from "@/components/portfolio/project-detail";
import type { Metadata } from "next";
import { getContent } from "@/services/content";
import { str, visible } from "@/types/content";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = visible((await getContent()).projects).find(
    (p) => str(p, "slug") === slug,
  );
  if (!project) return { title: "Proyecto no encontrado" };
  const title = str(project, "title") + " — Matias Meneclier",
    description = str(project, "short_description"),
    cover = str(project, "cover");
  return {
    title,
    description,
    openGraph: { title, description, images: cover ? [cover] : [] },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: cover ? [cover] : [],
    },
  };
}
export default async function Project({ params }: Props) {
  const { slug } = await params;
  const c = await getContent();
  const p = visible(c.projects).find((p) => str(p, "slug") === slug);
  if (!p) notFound();
  return <ProjectDetail content={c} project={p} />;
}
