import { sameOrigin } from "@/lib/request-origin";
import { requireAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import { sanitizeSVG } from "@/lib/media";
import { collections, type Entry } from "@/types/content";
const mime: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request))
      return Response.json({ error: "Origen no permitido" }, { status: 403 });
    const client = await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 51 * 1024 * 1024)
      return Response.json({ error: "Máximo 50 MB" }, { status: 413 });
    const form = await request.formData(),
      file = form.get("file");
    if (
      !(file instanceof File) ||
      !mime[file.type] ||
      file.size > 50 * 1024 * 1024
    )
      throw new Error("Formato o tamaño no permitido");
    const replace = form.get("replace_id");
    let previous: Entry | null = null;
    if (replace) {
      const id = z.uuid().parse(replace);
      const { data, error } = await client
        .from("media_assets")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error("Archivo no encontrado");
      previous = data as Entry;
      if (previous.data.type !== file.type)
        throw new Error("El reemplazo debe tener el mismo formato.");
    }
    const id = previous?.id || crypto.randomUUID(),
      path = `media/${id}-${crypto.randomUUID()}.${mime[file.type]}`;
    const bytes =
      file.type === "image/svg+xml"
        ? new TextEncoder().encode(sanitizeSVG(await file.text()))
        : await file.arrayBuffer();
    const { error } = await client.storage
      .from("portfolio-media")
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "0",
      });
    if (error) throw new Error("No se pudo subir el archivo.");
    const { data: url } = client.storage
      .from("portfolio-media")
      .getPublicUrl(path);
    const { data: last } = await client
      .from("media_assets")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const entry: Entry = {
      id,
      sort_order:
        previous?.sort_order ?? Math.min((last?.sort_order ?? -1) + 1, 100000),
      is_visible: true,
      data: {
        name: file.name.slice(0, 200),
        path,
        url: url.publicUrl,
        type: file.type,
        alt: String(previous?.data.alt || ""),
      },
    };
    const saved = previous
      ? await client.rpc("replace_media", {
          asset_id: id,
          asset_data: entry.data,
        })
      : await client.from("media_assets").insert(entry);
    if (saved.error) {
      await client.storage.from("portfolio-media").remove([path]);
      throw new Error("No se pudo registrar el archivo.");
    }
    if (previous)
      await client.storage
        .from("portfolio-media")
        .remove([String(previous.data.path)]);
    return Response.json({ entry });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "No se pudo subir." },
      { status: 400 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    if (!sameOrigin(request))
      return Response.json({ error: "Origen no permitido" }, { status: 403 });
    const client = await requireAdmin();
    const { id } = z.object({ id: z.uuid() }).parse(await request.json());
    const { data: asset } = await client
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .single();
    if (!asset) throw new Error("Archivo no encontrado");
    for (const table of collections.filter((t) => t !== "media_assets")) {
      const { data, error } = await client.from(table).select("data");
      if (error) throw new Error("No se pudo comprobar el uso del archivo.");
      if (
        data?.some((entry) =>
          JSON.stringify(entry.data).includes(asset.data.url),
        )
      )
        throw new Error(
          "El archivo sigue en uso. Quitalo del contenido primero.",
        );
    }
    const removed = await client.storage
      .from("portfolio-media")
      .remove([asset.data.path]);
    if (removed.error) throw new Error("No se pudo eliminar el archivo");
    const { error } = await client.from("media_assets").delete().eq("id", id);
    if (error) throw new Error("No se pudo eliminar el registro.");
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Error al eliminar" },
      { status: 400 },
    );
  }
}
