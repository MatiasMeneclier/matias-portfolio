-- Add the approved transparent portrait only where no photo is configured.
begin;
update public.profiles set data=jsonb_set(data,'{photo}','"/images/matias-portrait.png"'::jsonb) where coalesce(data->>'photo','')='';
commit;
