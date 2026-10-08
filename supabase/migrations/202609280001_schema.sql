-- Matias Meneclier portfolio. Run on a new Supabase project.
-- Public, publishable key only in application. No service-role key is needed.
begin;
create or replace function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
 select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

do $$ declare t text; begin
 foreach t in array array['profiles','site_settings','navigation_items','experiences','education','projects','project_images','project_technologies','skills','skill_categories','gallery_items','social_links','seo_settings','media_assets'] loop
 execute format('create table public.%I (id uuid primary key default gen_random_uuid(), data jsonb not null default ''{}''::jsonb check(jsonb_typeof(data) = ''object''), sort_order integer not null default 0 check(sort_order >= 0), is_visible boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now())',t);
 execute format('alter table public.%I enable row level security',t);
 execute format('create index on public.%I (sort_order)',t);
 execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
 execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
 if t not in ('media_assets','project_images','project_technologies') then
 execute format('create policy visible_read on public.%I for select to anon, authenticated using (is_visible)',t);
 end if;
 execute format('grant select on public.%I to anon',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;

create unique index projects_slug on public.projects ((data->>'slug'));
alter table public.projects add constraint valid_slug check (data->>'slug' ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.project_images add column project_id uuid generated always as ((data->>'project_id')::uuid) stored references public.projects(id) on delete cascade;
alter table public.project_technologies add column project_id uuid generated always as ((data->>'project_id')::uuid) stored references public.projects(id) on delete cascade;
create policy visible_parent on public.project_images for select to anon,authenticated using(is_visible and exists(select 1 from public.projects p where p.id=project_id and p.is_visible));
create policy visible_parent on public.project_technologies for select to anon,authenticated using(is_visible and exists(select 1 from public.projects p where p.id=project_id and p.is_visible));

create or replace function public.reorder_content(table_name text,ordered_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
declare item uuid; position integer := 0; begin
 if not public.is_admin() then raise exception 'not authorized'; end if;
 if not table_name = any(array['navigation_items','experiences','education','projects','project_images','project_technologies','skills','skill_categories','gallery_items','social_links','media_assets']) then raise exception 'invalid table'; end if;
 if cardinality(ordered_ids)>1000 then raise exception 'too many records'; end if;
 foreach item in array ordered_ids loop
 execute format('update public.%I set sort_order=$1 where id=$2',table_name) using position,item;
 position := position+1;
 end loop;
end $$;
revoke all on function public.reorder_content(text,uuid[]) from public,anon;
grant execute on function public.reorder_content(text,uuid[]) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('portfolio-media','portfolio-media',true,52428800,array['image/svg+xml','image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','application/pdf'])
on conflict(id) do nothing;
create policy portfolio_admin_insert on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and public.is_admin());
create policy portfolio_admin_update on storage.objects for update to authenticated using(bucket_id='portfolio-media' and public.is_admin()) with check(bucket_id='portfolio-media' and public.is_admin());
create policy portfolio_admin_delete on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and public.is_admin());
create policy portfolio_admin_select on storage.objects for select to authenticated using(bucket_id='portfolio-media' and public.is_admin());

create table public.contact_messages(id uuid primary key default gen_random_uuid(),name text not null,email text not null,message text not null,created_at timestamptz not null default now(),check(char_length(name) between 2 and 100),check(char_length(email)<=200),check(char_length(message) between 10 and 5000));
alter table public.contact_messages enable row level security;
create index contact_time on public.contact_messages(created_at);
create policy admin_read on public.contact_messages for select to authenticated using(public.is_admin());
grant select on public.contact_messages to authenticated;
-- Anon can only insert through this bounded function, never read messages.
create or replace function public.submit_contact(sender_name text,sender_email text,body text) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from public.site_settings where is_visible and coalesce((data->>'contact_enabled')::boolean,true)) then raise exception 'contact disabled'; end if;
 if char_length(sender_name) not between 2 and 100 or char_length(sender_email)>200 or sender_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or char_length(body) not between 10 and 5000 then raise exception 'invalid input'; end if;
 perform pg_advisory_xact_lock(9182471);
 if (select count(*) from public.contact_messages where created_at>now()-interval '1 hour')>=100 or (select count(*) from public.contact_messages where lower(email)=lower(sender_email) and created_at>now()-interval '1 hour')>=3 then raise exception 'rate limit'; end if;
 insert into public.contact_messages(name,email,message) values(trim(sender_name),lower(trim(sender_email)),trim(body));
end $$;
revoke all on function public.submit_contact(text,text,text) from public;
grant execute on function public.submit_contact(text,text,text) to anon,authenticated;
commit;
