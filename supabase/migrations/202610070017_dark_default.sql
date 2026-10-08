-- Set dark as the default while retaining other customized appearance settings.
begin;
update public.site_settings set data=jsonb_set(data,'{theme}','"Apple Dark"'::jsonb) where data->>'theme'='Soft';
commit;
