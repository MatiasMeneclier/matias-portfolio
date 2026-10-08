import { requireAdmin } from "@/lib/supabase/server";
export async function GET() {
  try {
    const client = await requireAdmin();
    const { data, error } = await client
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return Response.json(
      { messages: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
}
