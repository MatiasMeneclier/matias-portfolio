-- Simplify section titles in ES/EN while preserving customized titles.
begin;
update public.profiles set data=jsonb_set(data,'{about_title}','"Sobre mí"'::jsonb) where data->'about_title'='"Entender cómo funciona.\nConstruir lo que sigue."'::jsonb;
update public.profiles set data=jsonb_set(data,'{about_title_en}','"About me"'::jsonb) where data->'about_title_en'='"Understand the foundations.\nBuild what comes next."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{experience_title}','"Experiencia laboral"'::jsonb) where data->'experience_title'='"Experiencia que suma."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{experience_title_en}','"Work experience"'::jsonb) where data->'experience_title_en'='"Experience that adds perspective."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{education_title}','"Formación académica"'::jsonb) where data->'education_title'='"Bases sólidas.\nAprendizaje continuo."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{education_title_en}','"Education"'::jsonb) where data->'education_title_en'='"Strong foundations.\nContinuous learning."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{projects_title}','"Proyectos listos y en proceso"'::jsonb) where data->'projects_title'='"Ideas que toman forma."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{projects_title_en}','"Completed and ongoing projects"'::jsonb) where data->'projects_title_en'='"Ideas taking shape."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{skills_title}','"Conocimientos y herramientas"'::jsonb) where data->'skills_title'='"Un toolkit en evolución."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{skills_title_en}','"Knowledge and tools"'::jsonb) where data->'skills_title_en'='"An evolving toolkit."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{gallery_title}','"Galería"'::jsonb) where data->'gallery_title'='"Más allá del código."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{gallery_title_en}','"Gallery"'::jsonb) where data->'gallery_title_en'='"Beyond the code."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{contact_title}','"Contacto"'::jsonb) where data->'contact_title'='"La próxima idea empieza con una conversación."'::jsonb;
update public.site_settings set data=jsonb_set(data,'{contact_title_en}','"Contact"'::jsonb) where data->'contact_title_en'='"The next idea starts with a conversation."'::jsonb;
commit;
