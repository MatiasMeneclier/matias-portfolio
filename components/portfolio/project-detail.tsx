"use client";
import { SiteProvider, PreferenceControls, useSite } from "./site-preferences";
import Image from "./media-image";
import Link from "next/link";
import { str, list, visible, type Content, type Entry } from "@/types/content";
function DetailView({
  content: original,
  project,
  back = "/#projects",
}: {
  content: Content;
  project: Entry;
  back?: string;
}) {
  const { content: c, t, locale } = useSite();
  const p = c.projects.find((x) => x.id === project.id) || project;
  void original;
  return (
    <div>
      <main className="project-detail">
        <div className="project-toolbar">
          <Link href={back} className="text-link">
            ← {t("projects")}
          </Link>
          <PreferenceControls />
        </div>
        <h1>{str(p, "title")}</h1>
        {p.data.is_demo === true && (
          <p className="project-example-notice">
            {locale === "es"
              ? "Proyecto ficticio de ejemplo · Creado para probar el portfolio."
              : "Fictional sample project · Created to preview the portfolio."}
          </p>
        )}
        <p className="lead">{str(p, "short_description")}</p>
        <p className="mono muted">
          {str(p, "category")} / {str(p, "year")} / {str(p, "status")}
        </p>
        {str(p, "cover") && (
          <Image
            src={str(p, "cover")}
            alt={str(p, "title")}
            width={1400}
            height={900}
            priority
          />
        )}
        {[
          [t("overview"), "long_description"],
          [t("problem"), "problem"],
          [t("solution"), "solution"],
          [t("architecture"), "architecture"],
          [t("challenges"), "challenges"],
          [t("results"), "results"],
        ]
          .filter(([, key]) => str(p, key))
          .map(([label, key]) => (
            <section key={key}>
              <h2>{label}</h2>
              <p>{str(p, key)}</p>
            </section>
          ))}
        <section>
          <h2>{t("technology")}</h2>
          <div className="tags">
            {[
              ...list(p, "technologies"),
              ...visible(c.project_technologies)
                .filter((x) => str(x, "project_id") === p.id)
                .map((x) => str(x, "name")),
            ].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </section>
        {(list(p, "screenshots").length > 0 ||
          c.project_images.some((x) => str(x, "project_id") === p.id)) && (
          <section>
            <h2>{t("screenshots")}</h2>
            <div className="gallery-grid">
              {list(p, "screenshots").map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  width={900}
                  height={600}
                  alt={`${str(p, "title")} — ${t("screenshots")} ${i + 1}`}
                />
              ))}
              {visible(c.project_images)
                .filter((x) => str(x, "project_id") === p.id)
                .map((x) => (
                  <Image
                    key={x.id}
                    src={str(x, "url")}
                    width={900}
                    height={600}
                    alt={str(x, "alt")}
                  />
                ))}
            </div>
          </section>
        )}
        {str(p, "video") && (
          <section>
            <h2>Video</h2>
            <video src={str(p, "video")} controls preload="metadata" />
          </section>
        )}
        <div className="hero-buttons" style={{ marginTop: 40 }}>
          {["github", "demo"]
            .filter((key) => str(p, key))
            .map((key) => (
              <a
                key={key}
                className="button"
                href={str(p, key)}
                target="_blank"
                rel="noreferrer"
              >
                {key === "github" ? "GitHub" : t("demo")} ↗
              </a>
            ))}
        </div>
      </main>
    </div>
  );
}

export default function ProjectDetail(props: Parameters<typeof DetailView>[0]) {
  return (
    <SiteProvider content={props.content}>
      <DetailView {...props} />
    </SiteProvider>
  );
}
