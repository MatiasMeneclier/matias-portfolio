begin;
-- Move every exact URL reference together; new storage paths avoid stale image caches.
create or replace function public.replace_media(asset_id uuid, asset_data jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare old_url text; new_url text; t text;
begin
 if not public.is_admin() then raise exception 'not authorized'; end if;
 select data->>'url' into old_url from public.media_assets where id=asset_id for update;
 new_url := asset_data->>'url';
 if old_url is null or new_url is null or jsonb_typeof(asset_data)<>'object' then raise exception 'invalid asset'; end if;
 foreach t in array array['profiles','site_settings','navigation_items','experiences','education','projects','project_images','project_technologies','skills','skill_categories','gallery_items','social_links','seo_settings'] loop
  execute format('update public.%I set data=replace(data::text,$1,$2)::jsonb where data::text like $3',t)
   using to_jsonb(old_url)::text,to_jsonb(new_url)::text,'%'||old_url||'%';
 end loop;
 update public.media_assets set data=asset_data where id=asset_id;
end $$;
revoke all on function public.replace_media(uuid,jsonb) from public,anon;
grant execute on function public.replace_media(uuid,jsonb) to authenticated;
commit;
