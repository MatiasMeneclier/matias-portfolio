begin;
create unique index navigation_section_unique on public.navigation_items((data->>'section'));
create unique index skill_category_name_unique on public.skill_categories((data->>'name'));
-- Renaming a category preserves its skills. Prevent orphaning on delete.
create or replace function public.sync_skill_category() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='DELETE' then
  if exists(select 1 from public.skills where data->>'category'=old.data->>'name') then raise exception 'La categoría tiene skills asociadas'; end if;
  return old;
 end if;
 if old.data->>'name' is distinct from new.data->>'name' then
  update public.skills set data=jsonb_set(data,'{category}',new.data->'name') where data->>'category'=old.data->>'name';
 end if;
 return new;
end $$;
create trigger sync_category after update on public.skill_categories for each row execute function public.sync_skill_category();
create trigger protect_category before delete on public.skill_categories for each row execute function public.sync_skill_category();
commit;
