"use client";
import { useState } from "react";
import { Save, Trash2, Upload } from "lucide-react";
import Image from "@/components/portfolio/media-image";
import { localizedKeys } from "@/lib/localization";
import { fields, validateEntry } from "@/lib/schema";
import {
  str,
  type Entry,
  type Collection,
  type Content,
  type Value,
} from "@/types/content";
import MediaManager from "./media-manager";
export default function EntryForm({
  item,
  table,
  content,
  keys,
  onSave,
  onDelete,
  busy,
  demo,
  onMediaChange,
}: {
  item: Entry;
  table: Collection;
  content: Content;
  keys?: string[];
  onSave: (entry: Entry) => Promise<void>;
  onDelete?: () => void;
  busy: boolean;
  demo: boolean;
  onMediaChange: (items: Entry[]) => void;
}) {
  const [draft, setDraft] = useState(item),
    [error, setError] = useState(""),
    [picker, setPicker] = useState<string | null>(null),
    [dirty, setDirty] = useState(false),
    [language, setLanguage] = useState("base"),
    [search, setSearch] = useState("");
  const set = (key: string, value: Value) => {
    setDirty(true);
    setDraft((old) => ({ ...old, data: { ...old.data, [key]: value } }));
  };
  const baseFields = fields[table].filter(
    (f) => !/_es$|_en$/.test(f.key) && (!keys || keys.includes(f.key)),
  );
  const selectedFields =
    language === "base"
      ? baseFields
      : baseFields
          .filter(
            (f) =>
              localizedKeys.has(f.key) &&
              ![
                "media",
                "url",
                "email",
                "checkbox",
                "number",
                "color",
                "date",
              ].includes(f.type || ""),
          )
          .map((f) =>
            fields[table].find((x) => x.key === f.key + "_" + language)!,
          )
          .filter(Boolean);
  return (
    <form
      className="editor-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          const result = validateEntry(table, draft, demo);
          await onSave(result);
          setDirty(false);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "No se pudo guardar.",
          );
        }
      }}
    >
      <div className="editor-heading">
        <div>
          <h2>
            {table === "experiences"
              ? "Editar experiencia"
              : "Editar contenido"}
          </h2>
          <p>
            {dirty
              ? "Cambios sin guardar"
              : "Completá los detalles de esta sección."}
          </p>
        </div>
        {!["profiles", "site_settings", "seo_settings"].includes(table) && (
          <label className="switch-label">
            Visible en el portfolio
            <input
              type="checkbox"
              role="switch"
              checked={draft.is_visible}
              onChange={(e) => {
                setDirty(true);
                setDraft({ ...draft, is_visible: e.target.checked });
              }}
            />
          </label>
        )}
      </div>
      <div
        className="editor-languages"
        role="group"
        aria-label="Idioma del contenido"
      >
        {[
          ["base", "Contenido principal"],
          ["es", "Copies ES"],
          ["en", "Copies EN"],
        ].map(([code, label]) => (
          <button
            type="button"
            key={code}
            aria-pressed={language === code}
            className="button secondary"
            onClick={() => setLanguage(code)}
          >
            {label}
          </button>
        ))}
      </div>
      {language !== "base" && (
        <p className="muted">
          Los campos vacíos usan el contenido principal. Escribí una versión
          natural en cada idioma. Los nuevos proyectos se traducen desde su
          propio editor.
        </p>
      )}
      {table === "projects" && language === "base" && (
        <p className="project-editor-note">
          La portada aparece en el carrusel; el título, la descripción breve y
          las tecnologías acompañan al proyecto seleccionado. Guardá y activá
          “Visible en el portfolio” para mostrarlo. Ordená los proyectos desde
          la lista. Marcá “Proyecto ficticio de ejemplo” mientras sea contenido
          de prueba.
        </p>
      )}
      {language !== "base" && (
        <label className="translation-search">
          Buscar copy
          <input
            aria-label="Buscar copy"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Título, descripción, mensaje…"
          />
        </label>
      )}
      <div className="editor-fields">
        {selectedFields
          .filter(
            (f) =>
              language === "base" ||
              f.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
          )
          .map((field) => {
            const value = draft.data[field.key];
            let options = field.options;
            if (table === "skills" && field.key === "category")
              options = content.skill_categories.map((c) => str(c, "name"));
            return (
              <label
                key={field.key}
                className={
                  ["textarea", "list"].includes(field.type || "")
                    ? "field-wide"
                    : ""
                }
              >
                {field.label}
                {field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    aria-label={field.label}
                    checked={Boolean(value)}
                    onChange={(e) => set(field.key, e.target.checked)}
                  />
                ) : field.type === "textarea" || field.type === "list" ? (
                  <>
                    <textarea
                      aria-label={field.label}
                      rows={field.type === "textarea" ? 5 : 3}
                      value={
                        Array.isArray(value)
                          ? value.join("\n")
                          : String(value ?? "")
                      }
                      onChange={(e) =>
                        set(
                          field.key,
                          field.type === "list"
                            ? e.target.value.split("\n")
                            : e.target.value,
                        )
                      }
                    />
                    {field.key === "screenshots" && (
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => setPicker("screenshots")}
                      >
                        Elegir imagen de la biblioteca
                      </button>
                    )}
                  </>
                ) : options ? (
                  <select
                    aria-label={field.label}
                    value={String(value ?? "")}
                    onChange={(e) => {
                      set(field.key, e.target.value);
                      if (field.key === "theme") {
                        const themes: Record<string, Record<string, string>> = {
                          Soft: {},
                          "Apple Dark": {
                            background: "#08090b",
                            primary: "#f5f5f7",
                            secondary: "#a1a1aa",
                            accent: "#a8c4e6",
                          },
                          "Minimal Dark": {
                            background: "#0b0b0b",
                            primary: "#f6f6f6",
                            secondary: "#a6a6a6",
                            accent: "#c4c4c4",
                          },
                          "Minimal Light": {
                            background: "#fafafa",
                            primary: "#17181b",
                            secondary: "#62636a",
                            accent: "#315b89",
                          },
                          Developer: {
                            background: "#080c13",
                            primary: "#e8eef6",
                            secondary: "#a1aabb",
                            accent: "#9cbbef",
                          },
                        };
                        Object.entries(themes[e.target.value] || {}).forEach(
                          ([key, value]) => set(key, value),
                        );
                      }
                    }}
                  >
                    <option value="" disabled>
                      Seleccionar…
                    </option>
                    {options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === "media" ? (
                  <div className="media-field">
                    <div className="media-input">
                      <input
                        aria-label={field.label}
                        value={String(value ?? "")}
                        onChange={(e) => set(field.key, e.target.value)}
                        placeholder="URL o archivo de la biblioteca"
                      />
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={"Elegir " + field.label}
                        onClick={() => setPicker(field.key)}
                      >
                        <Upload size={18} />
                      </button>
                    </div>
                    {value && (
                      <>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => set(field.key, "")}
                        >
                          Quitar {field.label.toLowerCase()}
                        </button>
                        {!["cv", "video"].includes(field.key) && (
                          <Image
                            className={
                              "editor-media-preview " +
                              (field.key === "square_logo" ||
                              field.key === "logo"
                                ? "logo-preview"
                                : "")
                            }
                            src={String(value)}
                            alt={"Preview · " + field.label}
                            width={400}
                            height={320}
                            style={{
                              objectPosition:
                                field.key === "photo"
                                  ? str(draft, "photo_position", "50% 50%")
                                  : undefined,
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type || "text"}
                    aria-label={field.label}
                    value={String(value ?? "")}
                    min={field.type === "number" ? 0 : undefined}
                    max={field.key === "radius" ? 40 : undefined}
                    onChange={(e) =>
                      set(
                        field.key,
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                      )
                    }
                    required={field.required}
                  />
                )}
              </label>
            );
          })}
      </div>
      {picker && (
        <div className="media-picker">
          <div className="editor-heading">
            <h3>Elegir archivo</h3>
            <button
              type="button"
              className="button secondary"
              onClick={() => setPicker(null)}
            >
              Cerrar
            </button>
          </div>
          <MediaManager
            items={content.media_assets}
            content={content}
            demo={demo}
            onChange={onMediaChange}
            onSelect={(url) => {
              set(
                picker,
                picker === "screenshots"
                  ? [
                      ...(Array.isArray(draft.data.screenshots)
                        ? draft.data.screenshots
                        : []),
                      url,
                    ]
                  : url,
              );
              setPicker(null);
            }}
          />
        </div>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div className="editor-footer">
        {onDelete && (
          <button
            type="button"
            className="button secondary danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        )}
        <span />
        {dirty && <span className="muted">Sin guardar</span>}
        <button disabled={busy} className="button">
          <Save size={16} />
          {busy ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
