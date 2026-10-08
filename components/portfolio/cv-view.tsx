import type { CVModel } from "@/lib/cv";
import Link from "next/link";
import CVPrintButton from "./cv-print-button";
import "./cv-view.css";

export default function CVView({ cv }: { cv: CVModel }) {
  const english = cv.locale === "en";
  return (
    <main className="cv-workspace" lang={cv.locale}>
      <nav
        className="cv-controls no-print"
        aria-label={english ? "Resume controls" : "Controles del CV"}
      >
        <Link href="/" prefetch={false}>
          {english ? "Back to portfolio" : "Volver al portfolio"}
        </Link>
        <div className="cv-control-actions">
          <div
            className="cv-languages"
            aria-label={english ? "Resume language" : "Idioma del CV"}
          >
            <Link
              href="/cv?lang=es"
              prefetch={false}
              lang="es"
              hrefLang="es"
              aria-current={!english ? "page" : undefined}
            >
              Español
            </Link>
            <Link
              href="/cv?lang=en"
              prefetch={false}
              lang="en"
              hrefLang="en"
              aria-current={english ? "page" : undefined}
            >
              English
            </Link>
          </div>
          <CVPrintButton locale={cv.locale} />
        </div>
      </nav>
      <article
        className="cv-sheet"
        aria-label={english ? "Resume of " + cv.name : "CV de " + cv.name}
      >
        <header className="cv-heading">
          <h1>{cv.name}</h1>
          <p className="cv-contact-line">
            {cv.contact.map((item, index) => (
              <span key={item.label}>
                {index > 0 && <span aria-hidden="true"> · </span>}
                {item.href ? <a href={item.href}>{item.label}</a> : item.label}
              </span>
            ))}
          </p>
          <p className="cv-profile-links">
            {cv.links.map((item, index) => (
              <span key={item.href}>
                {index > 0 && <span aria-hidden="true"> · </span>}
                <a href={item.href}>{item.label}</a>
              </span>
            ))}
          </p>
        </header>
        {cv.sections.map((section) => (
          <section className="cv-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.entries.map((entry) => (
              <div className="cv-entry" key={entry.id}>
                <div className="cv-entry-heading">
                  <h3>
                    {entry.title}
                    {entry.link && (
                      <a className="cv-project-link" href={entry.link.href}>
                        {entry.link.label}
                      </a>
                    )}
                  </h3>
                  <span className="cv-date">{entry.date}</span>
                </div>
                {(entry.subtitle || entry.technologies) && (
                  <p className="cv-subtitle">
                    {entry.subtitle}
                    {entry.technologies && (
                      <span className="cv-technologies">
                        {entry.subtitle && " | "}
                        {entry.technologies}
                      </span>
                    )}
                  </p>
                )}
                {entry.note && <p className="cv-note">{entry.note}</p>}
                {entry.bullets.length > 0 && (
                  <ul>
                    {entry.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ))}
        {cv.skills.length > 0 && (
          <section className="cv-section cv-skills">
            <h2>{cv.skillsTitle}</h2>
            {cv.skills.map((row, index) => (
              <p key={index}>
                {row.label && <strong>{row.label}: </strong>}
                {row.text}
              </p>
            ))}
          </section>
        )}
      </article>
      <p className="cv-print-hint no-print">
        {english
          ? "For a clean PDF, choose A4 and turn off browser headers and footers in the print dialog."
          : "Para un PDF limpio, elegí A4 y desactivá los encabezados y pies de página del navegador al imprimir."}
      </p>
    </main>
  );
}
