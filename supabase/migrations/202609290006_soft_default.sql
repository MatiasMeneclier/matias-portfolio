-- Use Soft for the original default; preserve explicitly customized variants.
update public.site_settings
set data = jsonb_set(data, '{theme}', '"Soft"'::jsonb)
where id = '00000000-0000-4000-8000-000000000002'
  and data->>'theme' = 'Apple Dark';
