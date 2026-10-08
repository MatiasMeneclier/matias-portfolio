-- Remove fictional projects as requested. Projects converted to real content are preserved.
begin;
delete from public.projects where data->>'is_demo'='true';
commit;
