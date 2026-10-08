import { writeFileSync } from "node:fs";
import { seed } from "../lib/seed.ts";
const quote = (v: unknown) => "'" + String(v).replaceAll("'", "''") + "'";
let sql =
  "-- Add bilingual content and Soft defaults without replacing edited content.\nbegin;\n";
for (const [table, entries] of Object.entries(seed))
  for (const e of entries) {
    for (const [key, value] of Object.entries(e.data)) {
      if (!key.endsWith("_en")) continue;
      const base = key.slice(0, -3);
      sql += `update public.${table} set data=data||jsonb_build_object(${quote(key)},${quote(JSON.stringify(value))}::jsonb) where id=${quote(e.id)} and not data ? ${quote(key)} and data->${quote(base)}=${quote(JSON.stringify(e.data[base]))}::jsonb;\n`;
    }
  }
const settings = seed.site_settings[0].data;
const defaults = Object.fromEntries(
  Object.entries(settings).filter(
    ([k]) => k.startsWith("soft_") || k === "dark_enabled",
  ),
);
sql += `update public.site_settings set data=${quote(JSON.stringify(defaults))}::jsonb||data;\ncommit;\n`;
writeFileSync("supabase/migrations/202609290005_soft_localization.sql", sql);
