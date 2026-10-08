import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { seed } from "@/lib/seed";
import { collections, type Content, type Entry } from "@/types/content";
export const getContent = cache(async (): Promise<Content> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return structuredClone(seed);
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const results = await Promise.all(
    collections
      .filter((k) => k !== "media_assets")
      .map(async (table) => {
        const { data, error } = await client
          .from(table)
          .select("*")
          .eq("is_visible", true)
          .order("sort_order");
        if (error) throw new Error("No se pudo cargar " + table);
        return [table, data as Entry[]] as const;
      }),
  );
  return {
    ...Object.fromEntries(collections.map((k) => [k, []])),
    ...Object.fromEntries(results),
  } as Content;
});
