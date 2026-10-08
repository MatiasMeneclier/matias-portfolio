import { writeFileSync } from "node:fs";
import { seed } from "../lib/seed.ts";
const quote = (value: unknown) =>
  "'" + String(value).replaceAll("'", "''") + "'";
let sql =
  "-- Real user-provided content. Fictional projects use a separate migration.\nbegin;\n";
for (const [table, entries] of Object.entries(seed)) {
  for (const e of entries) {
    if (table === "projects" && e.data.is_demo === true) continue;
    sql += `insert into public.${table}(id,data,sort_order,is_visible) values(${quote(e.id)},${quote(JSON.stringify(e.data))}::jsonb,${e.sort_order},${e.is_visible}) on conflict(id) do nothing;\n`;
  }
}
sql += "commit;\n";
writeFileSync("supabase/migrations/202609280002_seed.sql", sql);
console.log("Seed migration generated.");
