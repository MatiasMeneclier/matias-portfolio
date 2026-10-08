import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("migrations compile and enforce anonymous/member/admin isolation", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema public,auth,storage to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select,insert,update,delete on storage.objects to anon,authenticated;`);
    for (const name of [
      "202609280001_schema.sql",
      "202609280002_seed.sql",
      "202609280003_integrity.sql",
      "202609290004_media_replacement.sql",
      "202609290005_soft_localization.sql",
      "202609290006_soft_default.sql",
      "202610060007_project_examples.sql",
      "202610070008_securegate_project.sql",
      "202610070009_portfolio_project.sql",
      "202610070010_cliped_project.sql",
      "202610070015_section_titles.sql",
      "202610070016_skills_update.sql",
      "202610070017_dark_default.sql",
      "202610070018_profile_photo.sql",
    ]) {
      if (name === "202609290005_soft_localization.sql")
        await db.exec(
          `update public.profiles set data=(data-'bio_en')||'{"bio":"Edited biography"}'::jsonb;`,
        );
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + name, import.meta.url),
          "utf8",
        ),
      );
    }
    const translatedProfile = (
      await db.query<{ data: Record<string, unknown> }>(
        "select data from public.profiles",
      )
    ).rows[0].data;
    const exampleProjects = await db.query<{ data: Record<string, unknown> }>(
      "select data from public.projects where data->>'is_demo'='true'",
    );
    assert.equal(exampleProjects.rows.length, 6);
    assert.ok(exampleProjects.rows.every(({ data }) => data.is_demo === true));
    const firstProject = (
      await db.query<{ data: Record<string, unknown> }>(
        "select data from public.projects order by sort_order limit 1",
      )
    ).rows[0].data;
    assert.equal(firstProject.title, "secureGate");
    assert.equal(firstProject.is_demo, false);
    assert.equal(firstProject.github, "https://github.com/JFCrypT/secureGate");
    const personalProject = (
      await db.query<{ data: Record<string, unknown> }>(
        "select data from public.projects order by sort_order offset 1 limit 1",
      )
    ).rows[0].data;
    assert.equal(personalProject.slug, "portfolio-personal");
    assert.equal(personalProject.is_demo, false);
    const cliped = (
      await db.query<{ data: Record<string, unknown> }>(
        "select data from public.projects order by sort_order offset 2 limit 1",
      )
    ).rows[0].data;
    assert.equal(cliped.title, "Cliped");
    assert.equal(cliped.status, "En desarrollo");
    assert.equal(cliped.is_demo, false);
    const originalProjectOrder = (
      await db.query(
        "select id,sort_order from public.projects order by sort_order",
      )
    ).rows;
    await db.exec(
      "update public.projects set data=jsonb_set(data,'{title}','\"Edited secureGate\"') where data->>'slug'='securegate'",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610070008_securegate_project.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.deepEqual(
      (
        await db.query(
          "select id,sort_order from public.projects order by sort_order",
        )
      ).rows,
      originalProjectOrder,
    );
    await db.exec(
      "update public.projects set data=jsonb_set(data,'{title}','\"Edited Cliped\"') where data->>'slug'='cliped'",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610070010_cliped_project.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='cliped'",
        )
      ).rows[0].title,
      "Edited Cliped",
    );
    assert.deepEqual(
      (
        await db.query(
          "select id,sort_order from public.projects order by sort_order",
        )
      ).rows,
      originalProjectOrder,
    );
    await db.exec(
      "update public.projects set data=jsonb_set(data,'{title}','\"Edited portfolio\"') where data->>'slug'='portfolio-personal'",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610070009_portfolio_project.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.deepEqual(
      (
        await db.query(
          "select id,sort_order from public.projects order by sort_order",
        )
      ).rows,
      originalProjectOrder,
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='portfolio-personal'",
        )
      ).rows[0].title,
      "Edited portfolio",
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='securegate'",
        )
      ).rows[0].title,
      "Edited secureGate",
    );
    await db.exec(
      "update public.projects set data=jsonb_set(data,'{title}','\"Edited example\"') where data->>'slug'='ejemplo-orbit-tasks'",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610060007_project_examples.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      9,
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='ejemplo-orbit-tasks'",
        )
      ).rows[0].title,
      "Edited example",
    );
    assert.equal(translatedProfile.bio, "Edited biography");
    const removeExamples = await readFile(
      new URL(
        "../supabase/migrations/202610070011_remove_project_examples.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(removeExamples);
    await db.exec(removeExamples);
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      3,
    );
    assert.equal(
      (
        await db.query(
          "select * from public.projects where data->>'is_demo'='true'",
        )
      ).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='securegate'",
        )
      ).rows[0].title,
      "Edited secureGate",
    );
    assert.equal(translatedProfile.bio_en, undefined);
    const gpsMigration = await readFile(
      new URL(
        "../supabase/migrations/202610070012_gps_project.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(gpsMigration);
    assert.equal(
      (
        await db.query<{ slug: string }>(
          "select data->>'slug' as slug from public.projects order by sort_order desc limit 1",
        )
      ).rows[0].slug,
      "navegador-gps-brujula-solar",
    );
    await db.exec(
      "update public.projects set data=jsonb_set(data,'{title}','\"Edited GPS\"') where data->>'slug'='navegador-gps-brujula-solar'",
    );
    await db.exec(gpsMigration);
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      4,
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='navegador-gps-brujula-solar'",
        )
      ).rows[0].title,
      "Edited GPS",
    );
    const audioMigration = await readFile(
      new URL(
        "../supabase/migrations/202610070013_audio_amplifier_project.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(audioMigration);
    assert.equal(
      (
        await db.query<{ slug: string }>(
          "select data->>'slug' as slug from public.projects order by sort_order desc limit 1",
        )
      ).rows[0].slug,
      "amplificador-audio-analogico",
    );
    await db.exec(
      `update public.projects set data=jsonb_set(data,'{title}','"Edited amplifier"') where data->>'slug'='amplificador-audio-analogico'`,
    );
    await db.exec(audioMigration);
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      5,
    );
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select data->>'title' as title from public.projects where data->>'slug'='amplificador-audio-analogico'",
        )
      ).rows[0].title,
      "Edited amplifier",
    );
    assert.match(String(translatedProfile.about_en), /curiosity/);
    const profileMigration = await readFile(
      new URL(
        "../supabase/migrations/202610070014_profile_update.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(profileMigration);
    const refreshedProfile = (
      await db.query<{ data: Record<string, unknown> }>(
        "select data from public.profiles",
      )
    ).rows[0].data;
    assert.equal(refreshedProfile.bio, "Edited biography");
    assert.match(String(refreshedProfile.about), /bases de datos/);
    assert.match(String(refreshedProfile.about_en), /cybersecurity/);
    await db.exec(
      `update public.site_settings set data=jsonb_set(data,'{hero_description}','"My customized hero"')`,
    );
    await db.exec(profileMigration);
    assert.equal(
      (
        await db.query<{ description: string }>(
          "select data->>'hero_description' as description from public.site_settings",
        )
      ).rows[0].description,
      "My customized hero",
    );
    assert.equal(
      (
        await db.query(
          "select * from public.skills where data->>'name'='Bases de datos'",
        )
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query<{ theme: string }>(
          "select data->>'theme' as theme from public.site_settings",
        )
      ).rows[0].theme,
      "Apple Dark",
    );
    await db.exec(
      `update public.site_settings set data=jsonb_set(data,'{theme}','"Developer"')`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609290006_soft_default.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(
      (
        await db.query<{ theme: string }>(
          "select data->>'theme' as theme from public.site_settings",
        )
      ).rows[0].theme,
      "Developer",
    );
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from public.experiences")).rows.length,
      3,
    );
    await assert.rejects(() =>
      db.exec(`insert into public.projects(data) values(' {"slug":"attack"}')`),
    );
    await assert.rejects(() => db.exec(`update public.profiles set data='{}'`));
    await assert.rejects(() =>
      db.exec(`select public.reorder_content('experiences','{}')`),
    );
    await assert.rejects(() =>
      db.exec(`select * from public.contact_messages`),
    );
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{},"user_metadata":{"role":"admin"}}',false)`,
    );
    await assert.rejects(() =>
      db.exec(`insert into public.projects(data) values('{"slug":"member"}')`),
    );
    assert.equal(
      (await db.query("select * from public.contact_messages")).rows.length,
      0,
    );
    await assert.rejects(() =>
      db.exec(
        `insert into storage.objects(bucket_id,name) values('portfolio-media','unauthorized.png')`,
      ),
    );
    await db.exec(
      `select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`,
    );
    await db.exec(`insert into public.projects(id,data,is_visible) values('11111111-1111-4111-8111-111111111111','{"title":"Private","slug":"private"}',false);
 insert into public.project_images(data,is_visible) values('{"project_id":"11111111-1111-4111-8111-111111111111","url":"/test.png"}',true);
 insert into storage.objects(bucket_id,name) values('portfolio-media','allowed.png');
 update public.skill_categories set data=jsonb_set(data,'{name}','"Code"') where data->>'name'='Programming';`);
    assert.equal(
      (
        await db.query(
          `select * from public.skills where data->>'category'='Code'`,
        )
      ).rows.length,
      6,
    );
    await assert.rejects(() =>
      db.exec(`delete from public.skill_categories where data->>'name'='Code'`),
    );
    await db.exec(
      `reset role;select set_config('request.jwt.claims','{}',false);set role anon;`,
    );
    assert.equal(
      (await db.query("select * from public.projects")).rows.length,
      5,
    );
    assert.equal(
      (
        await db.query(
          "select * from public.projects where data->>'slug'='private'",
        )
      ).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.project_images")).rows.length,
      0,
    );
    for (let i = 0; i < 3; i++)
      await db.exec(
        `select public.submit_contact('QA Test','qa@example.test','Mensaje de prueba controlado')`,
      );
    await assert.rejects(() =>
      db.exec(
        `select public.submit_contact('QA Test','qa@example.test','Cuarto mensaje bloqueado')`,
      ),
    );
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`,
    );
    assert.equal(
      (await db.query("select * from public.contact_messages")).rows.length,
      3,
    );
    await db.exec(
      `insert into public.media_assets(id,data) values('22222222-2222-4222-8222-222222222222','{"url":"https://example.test/old.png"}');update public.projects set data=data||'{"cover":"https://example.test/old.png","screenshots":["https://example.test/old.png"]}';select public.replace_media('22222222-2222-4222-8222-222222222222','{"url":"https://example.test/new.png"}');`,
    );
    const mediaProject = (
      await db.query<{ data: { cover: string; screenshots: string[] } }>(
        "select data from public.projects",
      )
    ).rows[0];
    assert.equal(mediaProject.data.cover, "https://example.test/new.png");
    assert.deepEqual(mediaProject.data.screenshots, [
      "https://example.test/new.png",
    ]);
    await db.exec(`select set_config('request.jwt.claims','{}',false)`);
    await assert.rejects(() =>
      db.exec(
        `select public.replace_media('22222222-2222-4222-8222-222222222222','{"url":"https://evil.test/a.png"}')`,
      ),
    );
  } finally {
    await db.close();
  }
});
