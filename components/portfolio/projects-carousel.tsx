"use client";
import { SqueezeCarousel } from "@/components/ui/carousel-squeeze";
import { str, list, visible, type Entry } from "@/types/content";
import { useSite } from "./site-preferences";

export default function ProjectsCarousel({
  projects,
  projectBase,
}: {
  projects: Entry[];
  projectBase: string;
}) {
  const { locale, t } = useSite();
  const items = visible(projects);
  const example = locale === "es" ? "Ejemplo" : "Example";
  return (
    <SqueezeCarousel
      key={items.map(({ id }) => id).join("-")}
      keyboardWhenInView
      label={locale === "es" ? "Proyectos del portfolio" : "Portfolio projects"}
      previousLabel={locale === "es" ? "Proyecto anterior" : "Previous project"}
      nextLabel={locale === "es" ? "Proyecto siguiente" : "Next project"}
      swipeLabel={
        locale === "es"
          ? "Deslizá para ver más proyectos"
          : "Swipe to explore projects"
      }
      slides={items.map((project) => ({
        id: project.id,
        title: str(project, "title"),
        description: str(project, "short_description"),
        image: str(project, "cover") || undefined,
        imageAlt: "",
        action: locale === "es" ? "Ver proyecto" : "View project",
        href: `${projectBase}/${str(project, "slug")}`,
        overlay: (
          <>
            <span className="sq-wordmark">{str(project, "title")}</span>
            {project.data.is_demo === true && (
              <span className="sq-example">{example}</span>
            )}
          </>
        ),
        meta: (
          <>
            <div className="sq-project-meta mono">
              <span>
                {[str(project, "category"), str(project, "year")]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
              <span>
                {project.data.featured ? t("featured") : str(project, "status")}
              </span>
              {project.data.is_demo === true && (
                <span className="sq-demo-label">
                  {locale === "es"
                    ? "Proyecto ficticio de ejemplo"
                    : "Fictional sample project"}
                </span>
              )}
            </div>
            {list(project, "technologies").length > 0 && (
              <div className="sq-technologies">
                {list(project, "technologies").map((name, i) => (
                  <span key={name + i}>{name}</span>
                ))}
              </div>
            )}
          </>
        ),
      }))}
    />
  );
}
