"use client";
/* eslint-disable @next/next/no-img-element -- Local upload previews include data URLs and need no image proxy. */
import { useRef, useState } from "react";
import { sanitizeSVG } from "@/lib/media";
import {
  Upload,
  Trash2,
  RefreshCw,
  Check,
  File,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { str, type Entry, type Content } from "@/types/content";
const accepted =
  "image/svg+xml,image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,application/pdf";
export default function MediaManager({
  items,
  content,
  demo,
  onChange,
  onSelect,
}: {
  items: Entry[];
  content: Content;
  demo: boolean;
  onChange: (items: Entry[]) => void;
  onSelect?: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null),
    [replace, setReplace] = useState<Entry | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const used = (item: Entry) =>
    Object.entries(content).some(
      ([table, entries]) =>
        table !== "media_assets" &&
        entries.some((e) =>
          Object.values(e.data).some((value) =>
            Array.isArray(value)
              ? value.includes(str(item, "url"))
              : value === str(item, "url"),
          ),
        ),
    );
  async function upload(file: globalThis.File) {
    setBusy(true);
    setMessage("");
    try {
      if (file.type === "image/svg+xml")
        file = new globalThis.File(
          [sanitizeSVG(await file.text())],
          file.name,
          { type: "image/svg+xml" },
        );
      if (!accepted.split(",").includes(file.type))
        throw new Error(
          "Formato no permitido. Usá JPG, PNG, WEBP, AVIF, SVG estático, MP4, WEBM o PDF.",
        );
      if (file.size > (demo ? 3 : 50) * 1024 * 1024)
        throw new Error(
          demo
            ? "La demo permite archivos de hasta 3 MB."
            : "El máximo es 50 MB.",
        );
      if (replace && str(replace, "type") !== file.type)
        throw new Error("El reemplazo debe usar el mismo formato.");
      let result: Entry;
      if (demo) {
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        result = {
          id: replace?.id || crypto.randomUUID(),
          sort_order: replace?.sort_order ?? items.length,
          is_visible: true,
          data: {
            name: file.name,
            url,
            path: "demo/" + file.name,
            type: file.type,
            alt: "",
          },
        };
      } else {
        const body = new FormData();
        body.set("file", file);
        if (replace) body.set("replace_id", replace.id);
        const response = await fetch("/api/admin/media", {
          method: "POST",
          body,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        result = data.entry as Entry;
      }
      const next = replace
        ? items.map((x) => (x.id === replace.id ? result : x))
        : [...items, result];
      onChange(next);
      setMessage("Archivo guardado.");
      setReplace(null);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al subir archivo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function remove(item: Entry) {
    if (used(item)) {
      setMessage(
        "Este archivo está en uso. Quitalo del contenido antes de eliminarlo.",
      );
      return;
    }
    if (!confirm("¿Eliminar este archivo de la biblioteca?")) return;
    setBusy(true);
    try {
      if (!demo) {
        const r = await fetch("/api/admin/media", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error);
      }
      onChange(items.filter((x) => x.id !== item.id));
      setMessage("Archivo eliminado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al eliminar.");
    } finally {
      setBusy(false);
    }
  }
  async function reorder(index: number, delta: number) {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setBusy(true);
    try {
      if (!demo) {
        const response = await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: "media_assets",
            ids: next.map((e) => e.id),
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
      }
      onChange(next.map((e, i) => ({ ...e, sort_order: i })));
      setMessage("Orden guardado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo reordenar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="media-manager">
      <div
        className="upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy && e.dataTransfer.files[0])
            void upload(e.dataTransfer.files[0]);
        }}
      >
        <Upload size={24} />
        <p>Arrastrá un archivo o elegilo desde tu equipo.</p>
        <button
          disabled={busy}
          className="button secondary"
          type="button"
          onClick={() => {
            setReplace(null);
            input.current?.click();
          }}
        >
          {busy ? "Subiendo…" : "Subir archivo"}
        </button>
        <small>JPG · PNG · WEBP · AVIF · SVG · MP4 · WEBM · PDF</small>
        <input
          ref={input}
          type="file"
          accept={accepted}
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) void upload(e.target.files[0]);
          }}
        />
      </div>
      <p className="form-status" role="status">
        {message}
      </p>
      <div className="media-grid">
        {items.map((item, index) => (
          <div className="media-tile" key={item.id}>
            <a
              href={str(item, "url")}
              target="_blank"
              rel="noreferrer"
              aria-label={"Ver " + str(item, "name")}
            >
              {str(item, "type").startsWith("image/") ? (
                <img
                  src={str(item, "url")}
                  alt={str(item, "alt") || str(item, "name")}
                />
              ) : str(item, "type").startsWith("video/") ? (
                <video preload="metadata" src={str(item, "url")} controls />
              ) : (
                <div className="media-document">
                  <File size={36} />
                </div>
              )}
            </a>
            <p>{str(item, "name")}</p>
            <div className="media-controls">
              {onSelect && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={"Usar " + str(item, "name")}
                  onClick={() => onSelect(str(item, "url"))}
                >
                  <Check size={17} />
                </button>
              )}
              <button
                type="button"
                className="icon-button"
                aria-label={"Reemplazar " + str(item, "name")}
                disabled={busy}
                onClick={() => {
                  setReplace(item);
                  input.current?.click();
                }}
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={"Eliminar " + str(item, "name")}
                disabled={busy}
                onClick={() => void remove(item)}
              >
                <Trash2 size={16} />
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="Mover arriba"
                disabled={busy || index === 0}
                onClick={() => void reorder(index, -1)}
              >
                <ArrowUp size={14} />
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="Mover abajo"
                disabled={busy || index === items.length - 1}
                onClick={() => void reorder(index, 1)}
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
