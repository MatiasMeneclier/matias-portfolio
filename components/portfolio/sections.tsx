"use client";
import Image from "./media-image";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Plus,
  Minus,
  ArrowDown,
  Github,
  Instagram,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Reveal } from "@/components/animations/reveal";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import HeroPortrait from "./hero-portrait";
import ProjectsCarousel from "./projects-carousel";
import { str, list, visible, type Content, type Entry } from "@/types/content";
import ContactForm from "./contact";
import { useSite } from "./site-preferences";
import { EditShortcut } from "./admin-access";
export function Hero({
  profile,
  settings,
  children,
}: {
  profile: Entry;
  settings: Entry;
  children?: ReactNode;
}) {
  const { t, locale } = useSite();
  return (
    <section
      className={
        "portfolio-hero " + (str(profile, "photo") ? "has-portrait" : "")
      }
      aria-labelledby="hero-name"
    >
      {children}
      <EditShortcut section="profile" />
      <div className="hero-meta mono">
        <span>{str(profile, "degree")}</span>
        <span>{str(profile, "short_location", str(profile, "location"))}</span>
      </div>
      <div className="hero-identity">
        <h1
          id="hero-name"
          aria-label={
            str(profile, "first_name") + " " + str(profile, "last_name")
          }
        >
          <span>{str(settings, "hero_name")}</span>
          <span>{str(settings, "hero_surname")}</span>
        </h1>
        <HeroPortrait profile={profile}>
          <div className="portrait-placeholder">
            <span className="portrait-monogram">
              <span>M</span>
              <span>M</span>
            </span>
            <span className="portrait-signature">
              {locale === "en"
                ? "Ideas\nCode\nPeople"
                : "Ideas\nCódigo\nPersonas"}
            </span>
          </div>
        </HeroPortrait>
      </div>
      <div className="hero-bottom">
        <div>
          <p className="hero-degree">{str(profile, "degree")}</p>
          <p className="mono hero-subtitle">{str(settings, "hero_subtitle")}</p>
          <p className="hero-description">
            {str(settings, "hero_description")}
          </p>
          <div className="hero-buttons">
            <LiquidMetalButton href="#projects">
              {str(settings, "hero_cta") || t("projects")}{" "}
              <ArrowRight size={22} />
            </LiquidMetalButton>
            <a className="button secondary" href="#about">
              {str(settings, "hero_about_cta") || t("about")}
            </a>
            <a
              className="text-link"
              href={str(profile, "cv") || "/cv?lang=" + locale}
              target="_blank"
              rel="noreferrer"
            >
              {str(settings, "hero_cv_cta") || t("cv")} <ArrowDown size={23} />
            </a>
          </div>
        </div>
        <div className="hero-side">
          <span className="mono">{str(settings, "hero_statement")}</span>
          <nav
            className="hero-socials"
            aria-label={locale === "es" ? "Redes sociales" : "Social profiles"}
          >
            <a
              aria-label="LinkedIn"
              className="text-link"
              href={str(profile, "linkedin")}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="linkedin-mark"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM7.9 19H4.96V9.46H7.9ZM6.43 8.15a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19.04 19H16.1v-4.64c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46V19H9.82V9.46h2.82v1.3h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.58 1.95 3.58 4.49Z"
                />
              </svg>
            </a>
            {[
              { key: "github", label: "GitHub", Icon: Github },
              { key: "instagram", label: "Instagram", Icon: Instagram },
            ].map(({ key, label, Icon }) => {
              const href = str(profile, key);
              if (!/^https?:\/\//i.test(href)) return null;
              return (
                <a
                  key={key}
                  aria-label={label}
                  className="text-link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={36} aria-hidden="true" />
                </a>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="hero-shortcuts mono">
        <a href="#experience">{t("experience")} ↘</a>
        <a href="#contact">{t("contact")} ↗</a>
      </div>
    </section>
  );
}
function SectionTitle({
  number,
  label,
  title,
}: {
  number: string;
  label: string;
  title: string;
}) {
  return (
    <Reveal>
      <p className="section-label mono">
        {number} <span>/</span> {label}
      </p>
      <h2 className="section-title">
        <AccentTitle title={title} />
      </h2>
    </Reveal>
  );
}
function AccentTitle({ title }: { title: string }) {
  const split = title.includes("\n")
    ? title.lastIndexOf("\n")
    : title.lastIndexOf(" ");
  if (split < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, split + 1)}
      <span className="title-accent">{title.slice(split + 1)}</span>
    </>
  );
}
function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((x, i) => (
        <span key={x + i}>{x}</span>
      ))}
    </div>
  );
}
const date = (value: string, locale: string) =>
  value
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-AR", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value + "T12:00:00Z"))
    : "";
function Experience({ item, initial }: { item: Entry; initial: boolean }) {
  const { t, locale } = useSite();
  const [open, setOpen] = useState(initial);
  return (
    <article className="experience-row">
      <button
        className="experience-toggle"
        aria-expanded={open}
        aria-controls={"exp-" + item.id}
        onClick={() => setOpen(!open)}
      >
        <span className="timeline-date mono">
          {date(str(item, "start"), locale)}
          <br />
          <span>
            —{" "}
            {item.data.current ? t("current") : date(str(item, "end"), locale)}
          </span>
        </span>
        <span className="experience-company">
          {str(item, "square_logo", str(item, "logo")) && (
            <Image
              className="institution-logo"
              width={40}
              height={40}
              alt=""
              src={str(item, "square_logo", str(item, "logo"))}
            />
          )}
          {str(item, "company")}
          <span>{str(item, "role")}</span>
        </span>
        <span className="experience-mode">
          {str(item, "work_mode")}
          <br />
          {str(item, "employment_type")}
        </span>
        {open ? <Minus size={20} /> : <Plus size={20} />}
      </button>
      <div hidden={!open} id={"exp-" + item.id} className="experience-content">
        <p className="muted">
          {str(item, "location")} · {str(item, "duration")}
        </p>
        <ul>
          {str(item, "description")
            .split("\n")
            .filter(Boolean)
            .map((x) => (
              <li key={x}>{x}</li>
            ))}
        </ul>
        <Tags items={list(item, "skills")} />
        {str(item, "company_image") && (
          <Image
            className="company-image"
            src={str(item, "company_image")}
            alt={str(item, "company")}
            width={1000}
            height={500}
          />
        )}
        {str(item, "website") && (
          <a
            className="text-link"
            href={str(item, "website")}
            target="_blank"
            rel="noreferrer"
          >
            {t("website")} <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </article>
  );
}
export default function Sections({
  content,
  connected,
  projectBase = "/projects",
}: {
  content: Content;
  connected: boolean;
  projectBase?: string;
}) {
  const { t } = useSite();
  const p = content.profiles[0],
    s = content.site_settings[0];
  const nav = visible(content.navigation_items);
  return (
    <>
      {nav.map((item, i) => {
        const section = str(item, "section");
        const number = String(i + 1).padStart(2, "0");
        return (
          <section
            key={item.id}
            id={section}
            className={"content-section section-" + section}
          >
            {["experience", "projects", "skills"].includes(section) && (
              <EditShortcut
                section={section as "experience" | "projects" | "skills"}
              />
            )}
            {section === "about" && (
              <>
                <div className="about-layout">
                  <div className="about-intro">
                    <SectionTitle
                      number={number}
                      label={str(item, "label")}
                      title={str(p, "about_title")}
                    />
                    <p className="mono">{str(p, "about_caption")}</p>
                  </div>
                  <Reveal className="about-copy">
                    {str(p, "about")
                      .split("\n\n")
                      .map((text, index) => (
                        <p key={index}>{text}</p>
                      ))}
                    <a
                      className="text-link"
                      target="_blank"
                      rel="noreferrer"
                      href={str(p, "linkedin")}
                    >
                      {t("connect")} <ArrowUpRight size={16} />
                    </a>
                  </Reveal>
                </div>
                <div className="facts">
                  {[
                    [str(p, "age") + " " + t("years"), t("age")],
                    [
                      str(p, "short_location", str(p, "location")),
                      t("location"),
                    ],
                    [str(p, "university"), t("university")],
                    [str(p, "nationality"), t("nationality")],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <span className="mono">{label}</span>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {section === "experience" && (
              <>
                <SectionTitle
                  number={number}
                  label={str(item, "label")}
                  title={str(s, "experience_title")}
                />
                <Reveal className="timeline">
                  {visible(content.experiences).map((exp, i) => (
                    <Experience key={exp.id} item={exp} initial={i === 0} />
                  ))}
                </Reveal>
              </>
            )}
            {section === "education" && (
              <>
                <SectionTitle
                  number={number}
                  label={str(item, "label")}
                  title={str(s, "education_title")}
                />
                <div className="education-timeline">
                  {visible(content.education).map((edu) => (
                    <Reveal className="education-row" key={edu.id}>
                      <div className="mono timeline-date">
                        {str(edu, "start")} —{" "}
                        {edu.data.current ? t("current") : str(edu, "end")}
                      </div>
                      <div>
                        {str(edu, "logo") && (
                          <Image
                            className="institution-logo"
                            width={48}
                            height={48}
                            alt=""
                            src={str(edu, "logo")}
                          />
                        )}
                        <h3>{str(edu, "institution")}</h3>
                        <p className="education-degree">{str(edu, "degree")}</p>
                        <p className="muted">
                          {str(edu, "field")}
                          {str(edu, "description")
                            ? " · " + str(edu, "description")
                            : ""}
                        </p>
                        <Tags items={list(edu, "skills")} />
                      </div>
                    </Reveal>
                  ))}
                </div>
              </>
            )}
            {section === "projects" && (
              <>
                <SectionTitle
                  number={number}
                  label={str(item, "label")}
                  title={str(s, "projects_title")}
                />
                {visible(content.projects).length ? (
                  <ProjectsCarousel
                    projects={content.projects}
                    projectBase={projectBase}
                  />
                ) : (
                  <Reveal className="empty-projects">
                    <Code2 size={40} strokeWidth={1} />
                    <h3>{str(s, "projects_empty_title")}</h3>
                    <p>{str(s, "projects_empty")}</p>
                    <a className="text-link" href="#contact">
                      {t("talk")} <ArrowUpRight size={18} />
                    </a>
                  </Reveal>
                )}
              </>
            )}
            {section === "skills" && (
              <>
                <SectionTitle
                  number={number}
                  label={str(item, "label")}
                  title={str(s, "skills_title")}
                />
                <div className="skills-grid">
                  {visible(content.skill_categories).map((cat) => (
                    <Reveal className="skill-category" key={cat.id}>
                      <h3 className="mono">{str(cat, "name")}</h3>
                      <div className="skill-items">
                        {visible(content.skills)
                          .filter(
                            (skill) =>
                              str(skill, "category") === str(cat, "name"),
                          )
                          .map((skill) => (
                            <span key={skill.id}>
                              {str(skill, "icon") && (
                                <Image
                                  width={20}
                                  height={20}
                                  alt=""
                                  src={str(skill, "icon")}
                                />
                              )}{" "}
                              {str(skill, "name")}
                            </span>
                          ))}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </>
            )}
            {section === "gallery" && (
              <>
                <SectionTitle
                  number={number}
                  label={str(item, "label")}
                  title={str(s, "gallery_title")}
                />
                {visible(content.gallery_items).length ? (
                  <div className="gallery-grid">
                    {visible(content.gallery_items).map((media) => (
                      <figure key={media.id}>
                        {str(media, "kind") === "video" ? (
                          <video
                            controls
                            preload="metadata"
                            src={str(media, "url")}
                            aria-label={str(media, "title")}
                          />
                        ) : (
                          <a
                            href={str(media, "url")}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Image
                              src={str(media, "url")}
                              width={900}
                              height={650}
                              alt={str(media, "alt") || str(media, "title")}
                            />
                          </a>
                        )}
                        <figcaption>
                          {str(media, "title")}{" "}
                          <span>{str(media, "caption")}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="gallery-empty">{str(s, "gallery_empty")}</p>
                )}
              </>
            )}
            {section === "contact" && (
              <>
                <p className="section-label mono">
                  {number} / {str(item, "label")}
                </p>
                <div className="contact-layout">
                  <Reveal>
                    <h2>
                      <AccentTitle title={str(s, "contact_title")} />
                    </h2>
                    <div className="contact-links">
                      {[
                        ["LinkedIn", str(p, "linkedin")],
                        ["GitHub", str(p, "github")],
                        ["Instagram", str(p, "instagram")],
                        [
                          "Email",
                          str(p, "email") ? "mailto:" + str(p, "email") : "",
                        ],
                        [
                          t("phone"),
                          str(p, "phone") ? "tel:" + str(p, "phone") : "",
                        ],
                      ]
                        .filter(([, url]) => url)
                        .map(([label, url]) => (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {label}
                            <ArrowUpRight size={19} />
                          </a>
                        ))}
                      {visible(content.social_links)
                        .filter(
                          (link) =>
                            ![
                              "LinkedIn",
                              "GitHub",
                              "Instagram",
                              "Email",
                            ].includes(str(link, "label")),
                        )
                        .map((link) => (
                          <a
                            key={link.id}
                            href={str(link, "url")}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {str(link, "label")} <ArrowUpRight size={19} />
                          </a>
                        ))}
                    </div>
                    <p className="mono muted">{str(p, "location")}</p>
                  </Reveal>
                  {s?.data.contact_enabled !== false && (
                    <ContactForm connected={connected} />
                  )}
                </div>
              </>
            )}
          </section>
        );
      })}
    </>
  );
}
