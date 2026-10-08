"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowUpRight,
  Plus,
  Menu,
  LogOut,
  LayoutDashboard,
  User,
  Monitor,
  FileText,
  Briefcase,
  GraduationCap,
  Folder,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  Palette,
  Search,
  Settings,
  Upload,
  Languages,
  Download,
} from "lucide-react";
import { sections, mainSections } from "@/lib/admin-config";
import { fields } from "@/lib/schema";
import {
  str,
  type Content,
  type Entry,
  type Collection,
  type Fields,
} from "@/types/content";
import { saveDemo, resetDemo } from "@/store/demo";
import { browserClient } from "@/lib/supabase/client";
import SortableRow from "./sortable-row";
import EntryForm from "./entry-form";
import MediaManager from "./media-manager";
const icons = [
  LayoutDashboard,
  User,
  Monitor,
  FileText,
  Briefcase,
  GraduationCap,
  Folder,
  Layers,
  ImageIcon,
  LinkIcon,
  List,
  Palette,
  Search,
  Settings,
  Languages,
  Upload,
];
export default function AdminShell({
  initial,
  section = "dashboard",
  demo = false,
}: {
  initial: Content;
  section?: string;
  demo?: boolean;
}) {
  const router = useRouter(),
    [content, setContent] = useState(initial),
    [selected, setSelected] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [sidebar, setSidebar] = useState(false),
    [revision, setRevision] = useState(0),
    [inbox, setInbox] = useState<
      {
        id: string;
        name: string;
        email: string;
        message: string;
        created_at: string;
      }[]
    >([]);
  const config = sections[section],
    table = config.table;
  const base = demo ? "/admin/demo" : "/admin";
  const rows = table ? content[table] : [];
  const current =
    rows.find((x) => x.id === selected) ||
    (config.single ? rows[0] : undefined);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  useEffect(() => {
    if (section === "dashboard" && !demo) {
      fetch("/api/admin/messages")
        .then((r) => r.json())
        .then((r) => {
          if (r.messages) setInbox(r.messages);
        })
        .catch(() => setMessage("No se pudieron cargar los mensajes."));
    }
  }, [section, demo]);
  function commit(next: Content) {
    if (demo) saveDemo(next);
    setContent(next);
  }
  async function request(method: string, body: unknown) {
    const response = await fetch("/api/admin/content", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
    return result;
  }
  async function save(entry: Entry) {
    if (!table) return;
    setBusy(true);
    try {
      if (
        table === "projects" &&
        rows.some(
          (x) => x.id !== entry.id && str(x, "slug") === str(entry, "slug"),
        )
      )
        throw new Error("Ya existe ese slug.");
      if (
        table === "navigation_items" &&
        rows.some(
          (x) =>
            x.id !== entry.id && str(x, "section") === str(entry, "section"),
        )
      )
        throw new Error("La sección ya está en la navegación.");
      if (
        table === "skill_categories" &&
        rows.some(
          (x) => x.id !== entry.id && str(x, "name") === str(entry, "name"),
        )
      )
        throw new Error("La categoría ya existe.");
      if (!demo) await request("PUT", { table, entry });
      const next = {
        ...content,
        [table]: [...rows.filter((x) => x.id !== entry.id), entry].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      };
      if (table === "skill_categories") {
        const old = rows.find((x) => x.id === entry.id);
        if (old)
          next.skills = content.skills.map((x) =>
            str(x, "category") === str(old, "name")
              ? { ...x, data: { ...x.data, category: str(entry, "name") } }
              : x,
          );
      }
      commit(next);
      setSelected(entry.id);
      setMessage(
        demo ? "Cambios guardados en la demo local." : "Cambios publicados.",
      );
    } finally {
      setBusy(false);
    }
  }
  function create() {
    if (!table) return;
    const data: Fields = {};
    fields[table].forEach(
      (f) =>
        (data[f.key] =
          f.type === "checkbox"
            ? false
            : f.type === "list"
              ? []
              : f.type === "number"
                ? 0
                : f.options?.[0] || ""),
    );
    const entry: Entry = {
      id: crypto.randomUUID(),
      sort_order: rows.length,
      is_visible: Boolean(config.single),
      data,
    };
    setContent({ ...content, [table]: [...rows, entry] });
    setSelected(entry.id);
    setRevision((r) => r + 1);
    setMessage("Nuevo borrador. Completá los campos y guardá.");
  }
  async function remove() {
    if (
      !table ||
      !current ||
      !confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")
    )
      return;
    setBusy(true);
    try {
      if (
        table === "skill_categories" &&
        content.skills.some((x) => str(x, "category") === str(current, "name"))
      )
        throw new Error("Mové o eliminá las skills de esta categoría primero.");
      if (!demo) await request("DELETE", { table, id: current.id });
      commit({ ...content, [table]: rows.filter((x) => x.id !== current.id) });
      setSelected(null);
      setMessage("Registro eliminado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }
  async function reorder(event: DragEndEvent) {
    if (!table || !event.over || event.active.id === event.over.id) return;
    const next = arrayMove(
      rows,
      rows.findIndex((x) => x.id === event.active.id),
      rows.findIndex((x) => x.id === event.over?.id),
    ).map((entry, i) => ({ ...entry, sort_order: i }));
    setBusy(true);
    try {
      if (!demo) await request("PATCH", { table, ids: next.map((x) => x.id) });
      commit({ ...content, [table]: next });
      setMessage("Orden guardado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo reordenar.");
    } finally {
      setBusy(false);
    }
  }
  function mediaChange(items: Entry[]) {
    try {
      let next = { ...content, media_assets: items };
      for (const asset of items) {
        const old = content.media_assets.find((x) => x.id === asset.id);
        if (old && str(old, "url") !== str(asset, "url")) {
          next = JSON.parse(
            JSON.stringify(next).replaceAll(
              JSON.stringify(str(old, "url")),
              JSON.stringify(str(asset, "url")),
            ),
          ) as Content;
        }
      }
      commit(next);
    } catch {
      const error = new Error(
        "Sin espacio en la demo local. Usá archivos más pequeños.",
      );
      setMessage(error.message);
      throw error;
    }
  }
  function exportContent() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "matias-portfolio-content.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="studio">
      <aside className={"studio-sidebar " + (sidebar ? "open" : "")}>
        <Link className="brand" href={base}>
          MM<span>/ Studio</span>
        </Link>
        <p>
          Matias Meneclier
          <br />
          <small>Portfolio CMS</small>
        </p>
        <nav aria-label="Administración">
          {mainSections.map((key, i) => {
            const Icon = icons[i];
            return (
              <Link
                className={key === section ? "active" : ""}
                key={key}
                href={key === "dashboard" ? base : base + "/" + key}
                onClick={() => {
                  setSidebar(false);
                  setSelected(null);
                }}
              >
                <Icon size={19} />
                {sections[key].title}
              </Link>
            );
          })}
        </nav>
        <div className="studio-sidebar-bottom">
          <span>{demo ? "Demo local" : "Administración privada"}</span>
          <button
            className="text-link"
            onClick={async () => {
              if (!demo) await browserClient().auth.signOut();
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <LogOut size={16} />
            {demo ? "Salir de la demo" : "Cerrar sesión"}
          </button>
        </div>
      </aside>
      <div className="studio-workspace">
        <header className="studio-top">
          <button
            className="icon-button studio-menu"
            aria-label="Menú de administración"
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu size={20} />
          </button>
          <span className="mono">
            {demo ? "SANDBOX / SOLO ESTE NAVEGADOR" : "MM / CONTENT STUDIO"}
          </span>
          <Link href={demo ? "/preview" : "/"} target="_blank">
            Ver portfolio <ArrowUpRight size={16} />
          </Link>
        </header>
        <main className="studio-main">
          <div className="studio-heading">
            <div>
              <h1>{config.title}</h1>
              <p>{config.description}</p>
            </div>
            {table && !config.single && section !== "media" && (
              <button className="button" onClick={create} disabled={busy}>
                <Plus size={17} />
                Agregar
              </button>
            )}
          </div>
          {demo && (
            <div className="demo-notice">
              Modo demo: los cambios se guardan en este navegador y se ven en la
              vista previa. No se publican ni reemplazan la autenticación.
            </div>
          )}
          <p className="studio-status" role="status">
            {message}
          </p>
          {section === "dashboard" && (
            <>
              <div className="dashboard-stats">
                {[
                  ["projects", "Proyectos"],
                  ["experiences", "Experiencias"],
                  ["skills", "Skills"],
                  ["media_assets", "Archivos"],
                ].map(([table, label]) => (
                  <div key={table}>
                    <span>{label}</span>
                    <strong>{content[table as Collection].length}</strong>
                  </div>
                ))}
              </div>
              <div className="dashboard-welcome">
                <h2>Un portfolio que evoluciona con vos.</h2>
                <p>
                  Actualizá tu perfil, documentá tus proyectos y elegí qué
                  querés compartir.
                </p>
                <Link className="button" href={base + "/profile"}>
                  Editar perfil <ArrowUpRight size={16} />
                </Link>
              </div>
              <h2 className="inbox-title">Mensajes recibidos</h2>
              {demo ? (
                <p className="muted">
                  La bandeja se habilita al conectar Supabase.
                </p>
              ) : inbox.length ? (
                inbox.map((m) => (
                  <article className="inbox-message" key={m.id}>
                    <strong>{m.name}</strong>
                    <a href={"mailto:" + m.email}>{m.email}</a>
                    <p>{m.message}</p>
                    <small>
                      {new Date(m.created_at).toLocaleString("es-AR")}
                    </small>
                  </article>
                ))
              ) : (
                <p className="muted">Todavía no recibiste mensajes.</p>
              )}
            </>
          )}
          {section === "skills" && (
            <Link href={base + "/categories"} className="text-link">
              Administrar categorías <ArrowUpRight size={15} />
            </Link>
          )}
          {section === "media" && (
            <MediaManager
              content={content}
              items={content.media_assets}
              demo={demo}
              onChange={mediaChange}
            />
          )}
          {table && !config.single && section !== "media" && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                if (!busy) void reorder(event);
              }}
            >
              <SortableContext
                items={rows.map((x) => x.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="admin-list">
                  {rows.length ? (
                    rows.map((item) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        title={
                          str(item, "title") ||
                          str(item, "company") ||
                          str(item, "institution") ||
                          str(item, "name") ||
                          str(item, "label") ||
                          "Nuevo borrador"
                        }
                        subtitle={
                          str(item, "role") ||
                          str(item, "degree") ||
                          str(item, "category") ||
                          str(item, "section")
                        }
                        selected={item.id === current?.id}
                        onSelect={() => {
                          setSelected(item.id);
                          setRevision((r) => r + 1);
                        }}
                      />
                    ))
                  ) : (
                    <div className="admin-empty">
                      <Folder size={30} />
                      <h2>Todavía no hay contenido.</h2>
                      <p>Agregá tu primer registro cuando esté listo.</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {table && current && section !== "media" && (
            <EntryForm
              key={current.id + "-" + section + "-" + revision}
              item={current}
              table={table}
              keys={config.keys}
              content={content}
              onSave={save}
              onDelete={!config.single ? () => void remove() : undefined}
              busy={busy}
              demo={demo}
              onMediaChange={mediaChange}
            />
          )}
          {table && config.single && !current && (
            <button className="button" onClick={create}>
              Crear configuración
            </button>
          )}
          {section === "seo" && (
            <div className="seo-preview">
              <span className="mono">VISTA PREVIA SOCIAL</span>
              <h3>{str(content.seo_settings[0], "title")}</h3>
              <p>{str(content.seo_settings[0], "description")}</p>
            </div>
          )}
          {section === "settings" && (
            <div className="settings-actions">
              <button className="button secondary" onClick={exportContent}>
                <Download size={16} />
                Exportar contenido
              </button>
              {demo && (
                <button
                  className="button secondary"
                  onClick={() => {
                    if (confirm("¿Restablecer los datos de la demo?")) {
                      resetDemo();
                      location.reload();
                    }
                  }}
                >
                  Restablecer demo
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
