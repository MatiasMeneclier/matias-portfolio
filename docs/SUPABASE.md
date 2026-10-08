# Supabase: contenido y administrador

Supabase autentica al administrador, guarda el contenido y los mensajes en PostgreSQL y sirve los archivos de Storage. Puede usarse una instancia propia o un proyecto en la nube. La instancia publicada del autor utiliza [Supabase en CasaOS](SUPABASE-CASAOS.md).

## Migraciones

Para una instancia nueva, ejecutar los **18 archivos de `supabase/migrations/` en orden alfabético**, una sola vez por base. La instancia debe tener los esquemas de Supabase Auth y Storage preparados; las migraciones de la aplicación no instalan esos servicios.

Los archivos iniciales crean tablas, permisos, contenido y reglas de integridad. Los siguientes incorporan traducciones, proyectos reales, textos, conocimientos, tema y retrato. La migración `202610060007_project_examples.sql` es parte del historial: la migración `202610070011_remove_project_examples.sql` retira los ejemplos ficticios. Aplicar la secuencia completa deja los cinco proyectos reales.

En un proyecto administrado puede usarse SQL Editor o el flujo de migraciones de Supabase CLI. En una instalación propia, aplicar los SQL desde una conexión administrativa a PostgreSQL. Registrar qué archivos ya se aplicaron y no volver a ejecutar el seed sobre contenido editado.

Las tablas usan `data JSONB` con validación Zod en la aplicación, además de `id`, fechas, `sort_order` e `is_visible`. Las relaciones y restricciones de unicidad se imponen también en PostgreSQL. RLS está activado en todas las tablas de contenido.

## Administrador

Crear un usuario desde Supabase Auth. Deshabilitar el registro público si no se necesita. Asignar el rol desde una sesión administrativa de SQL, sustituyendo el UUID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where id = 'UUID-DEL-ADMINISTRADOR';
```

El rol usa **app_metadata**, que no puede modificarse desde el perfil del usuario. `user_metadata.role` no concede permisos. Si había una sesión abierta, cerrar sesión e ingresar otra vez para renovar el token.

La aplicación comprueba la identidad y el rol en el servidor; RLS impone el mismo permiso en la base de datos y Storage. Una cuenta autenticada sin rol admin no puede editar. Los enlaces contextuales de edición solo se muestran al administrador.

## Variables

En `.env.local` para desarrollo, o `.env.production` para Docker:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU-API-SUPABASE
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=CLAVE_PUBLICA
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
ENABLE_ADMIN_DEMO=false
```

Usar la clave publishable del proyecto o la clave pública `anon` de la instancia propia. La aplicación no necesita `service_role` ni secretos de PostgreSQL. En Auth, configurar la URL del sitio y los redirects permitidos con el origen real. El login implementado usa correo y contraseña.

Reiniciar el desarrollo después de cambiar las variables. En producción, reconstruir si cambia una variable `NEXT_PUBLIC_`. Configurar [Resend](CONTACT.md) para habilitar también el formulario.

## Comprobar la integración

1. Entrar en `/admin/login` con el administrador.
2. Editar un texto y verificarlo tras recargar el sitio en una ventana privada.
3. Crear un borrador: debe estar oculto al público. Publicarlo y comprobar su detalle.
4. Subir un archivo, usarlo como portada y verificar su reemplazo.
5. Comprobar que una cuenta sin rol admin no puede editar mediante el panel ni las API.
6. Enviar un mensaje propio y comprobar la bandeja privada y la notificación de correo.

Probar contra una instancia de desarrollo evita modificar el contenido publicado. `/admin/demo` es otra opción: persiste solo en `localStorage`, sin conexión a Supabase y sin publicación.

## Archivos y mensajes

El bucket `portfolio-media` admite JPG, PNG, WEBP, AVIF, SVG estático saneado, MP4, WEBM y PDF hasta 50 MB. La demo limita cada archivo a 3 MB y depende del espacio de `localStorage`.

Los archivos del bucket son públicos. Ocultar un proyecto lo retira de las consultas y de la web, pero no convierte sus archivos en privados. El Media Manager evita eliminar un archivo todavía utilizado; al reemplazarlo actualiza las referencias.

El formulario limita a 3 mensajes por dirección y 100 totales por hora mediante un lock transaccional en PostgreSQL. La API valida formato, tamaño y honeypot. Los mensajes se leen solamente desde el panel autorizado.

Documentación oficial: [Auth](https://supabase.com/docs/guides/auth), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage](https://supabase.com/docs/guides/storage).
