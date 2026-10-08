import { writeFileSync } from "node:fs";
import { audioAmplifierProject as project } from "../lib/audio-amplifier-project.ts";
const quote = (value: unknown) =>
  "'" + String(value).replaceAll("'", "''") + "'";
const sql = `-- Academic analog audio amplifier, based on the user's Electronics 1 report.
begin;
insert into public.projects(id,data,sort_order,is_visible)
select ${quote(project.id)},${quote(JSON.stringify(project.data))}::jsonb,
  (select coalesce(max(sort_order),-1)+1 from public.projects),${project.is_visible}
where not exists(select 1 from public.projects where id=${quote(project.id)} or data->>'slug'=${quote(project.data.slug)})
on conflict(id) do nothing;
commit;
`;
writeFileSync(
  "supabase/migrations/202610070013_audio_amplifier_project.sql",
  sql,
);
console.log("Audio amplifier project migration generated.");
