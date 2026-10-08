import { sameOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { collectionSchema, validateEntry } from "@/lib/schema";
function origin(request: Request) {
  if (!sameOrigin(request)) throw new Error("Origen no permitido");
}
async function handle(request: Request) {
  try {
    origin(request);
    if (Number(request.headers.get("content-length") || 0) > 200000)
      return NextResponse.json(
        { error: "Solicitud demasiado grande" },
        { status: 413 },
      );
    const client = await requireAdmin();
    const input = await request.json();
    const table = collectionSchema.parse(input.table);
    if (request.method === "PUT") {
      const entry = validateEntry(table, input.entry);
      const { error } = await client.from(table).upsert(entry);
      if (error)
        throw new Error(
          error.code === "23505"
            ? "Ya existe un registro con ese slug."
            : "No se pudo guardar el registro.",
        );
    } else if (request.method === "DELETE") {
      const id = z.uuid().parse(input.id);
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw new Error("No se pudo eliminar.");
    } else {
      const ids = z.array(z.uuid()).max(1000).parse(input.ids);
      if (new Set(ids).size !== ids.length) throw new Error("IDs duplicados");
      const { error } = await client.rpc("reorder_content", {
        table_name: table,
        ordered_ids: ids,
      });
      if (error) throw new Error("No se pudo guardar el orden.");
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de solicitud";
    return NextResponse.json(
      { error: msg === "No autorizado" ? "No autorizado" : msg },
      { status: msg === "No autorizado" ? 401 : 400 },
    );
  }
}
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
