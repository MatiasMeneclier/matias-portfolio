import { writeFileSync } from "node:fs";
import { secureGateProject as project } from "../lib/securegate-project.ts";

const quote = (value: unknown) =>
  "'" + String(value).replaceAll("'", "''") + "'";
const sql = `-- Real academic project supplied by the user. Preserve existing records and matching slugs.
begin;
update public.projects set sort_order=sort_order+1
where not exists(select 1 from public.projects where id=${quote(project.id)} or data->>'slug'=${quote(project.data.slug)});
insert into public.projects(id,data,sort_order,is_visible)
select ${quote(project.id)},${quote(JSON.stringify(project.data))}::jsonb,0,${project.is_visible}
where not exists(select 1 from public.projects where id=${quote(project.id)} or data->>'slug'=${quote(project.data.slug)})
on conflict(id) do nothing;
commit;
`;
writeFileSync("supabase/migrations/202610070008_securegate_project.sql", sql);
console.log("secureGate migration generated.");
