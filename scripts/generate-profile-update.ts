import { writeFileSync } from "node:fs";
import { profileCopyUpdates, databaseSkill } from "../lib/profile-update.ts";
const quote = (value: unknown) =>
  "'" + String(value).replaceAll("'", "''") + "'";
let sql =
  "-- Refresh unchanged profile copy and add database knowledge; preserve administrator edits.\nbegin;\n";
for (const update of profileCopyUpdates) {
  sql += `update public.${update.table} set data=jsonb_set(data,'{${update.key}}',${quote(JSON.stringify(update.value))}::jsonb) where data->${quote(update.key)}=${quote(JSON.stringify(update.previous))}::jsonb;\n`;
}
sql += `insert into public.skills(id,data,sort_order,is_visible) select ${quote(databaseSkill.id)},${quote(JSON.stringify(databaseSkill.data))}::jsonb,${databaseSkill.sort_order},true where not exists(select 1 from public.skills where id=${quote(databaseSkill.id)} or data->>'name'=${quote(databaseSkill.data.name)}) on conflict(id) do nothing;\ncommit;\n`;
writeFileSync("supabase/migrations/202610070014_profile_update.sql", sql);
