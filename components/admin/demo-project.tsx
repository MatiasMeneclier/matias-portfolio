"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import ProjectDetail from "@/components/portfolio/project-detail";
import { readDemo } from "@/store/demo";
import { str, visible } from "@/types/content";
function View({ slug }: { slug: string }) {
  const content = readDemo(),
    project = visible(content.projects).find((p) => str(p, "slug") === slug);
  return (
    <>
      {project ? (
        <ProjectDetail
          content={content}
          project={project}
          back="/preview#projects"
        />
      ) : (
        <main className="center-page">
          <h1>Proyecto no encontrado</h1>
          <Link href="/preview">Volver a la vista previa</Link>
        </main>
      )}
      <Link className="preview-banner" href="/admin/demo/projects">
        DEMO LOCAL · Volver a Projects
      </Link>
    </>
  );
}
export default dynamic(() => Promise.resolve(View), { ssr: false });
