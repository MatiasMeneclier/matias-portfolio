import { writeFileSync } from "node:fs";
import { portfolioProject as project } from "../lib/portfolio-project.ts";

const quote = (value: unknown) =>
  "'" + String(value).replaceAll("'", "''") + "'";
const sql = `-- This portfolio as a real editable project. Preserve existing records and matching slugs.
begin;
do $$
declare project_order integer;
begin
  if not exists(select 1 from public.projects where id=${quote(project.id)} or data->>'slug'=${quote(project.data.slug)}) then
    select coalesce((select sort_order+1 from public.projects where data->>'slug'='securegate'),0) into project_order;
    update public.projects set sort_order=sort_order+1 where sort_order>=project_order;
    insert into public.projects(id,data,sort_order,is_visible)
    values(${quote(project.id)},${quote(JSON.stringify(project.data))}::jsonb,project_order,${project.is_visible});
  end if;
end $$;
commit;
`;
writeFileSync("supabase/migrations/202610070009_portfolio_project.sql", sql);
console.log("Portfolio project migration generated.");
