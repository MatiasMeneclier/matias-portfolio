# Supabase en CasaOS

El sitio del autor utiliza Supabase en su propio servidor, junto al contenedor de Next.js. CasaOS administra el entorno Docker; Supabase es una instalación separada con varios servicios, no una dependencia incluida dentro de la imagen del portfolio.

## Servicios

- **PostgreSQL:** textos, registros, traducciones y mensajes.
- **Auth:** sesiones y usuarios autorizados.
- **Storage:** imágenes, videos y documentos públicos del portfolio.
- **Gateway/API:** conecta el cliente de Supabase con los servicios.
- **Studio:** consola administrativa de Supabase, distinta del admin del portfolio.

Para reproducir el entorno, seguir [la instalación oficial de Supabase con Docker](https://supabase.com/docs/guides/self-hosting/docker) y luego [aplicar las migraciones del portfolio](SUPABASE.md). La distribución oficial incluye Compose, configuración y servicios adicionales. El repositorio del portfolio no distribuye la instalación personalizada ni las credenciales de la instancia del autor.

## Conexión con el portfolio

La API debe tener una URL HTTPS accesible al navegador. Configurar esa URL y la clave pública en `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, tanto para el build como para el contenedor.

La API puede compartir una red Docker con el conector de Cloudflare, usando un hostname distinto al del sitio. Publicar los endpoints necesarios de la API y Storage; conservar Studio y PostgreSQL en acceso privado. Los secretos JWT, las claves administrativas y las contraseñas pertenecen al entorno de Supabase y no deben incorporarse a Next.js.

El admin del portfolio está en `/admin/login`. Studio sirve para mantenimiento de la infraestructura y no se necesita para editar proyectos o textos. El rol de la aplicación se asigna mediante `app_metadata.role=admin` y RLS.

## Mantenimiento y respaldos

Respaldar por separado:

1. PostgreSQL, incluidos los roles que requiera la restauración.
2. Los archivos persistentes de Storage.
3. La configuración de Docker y los secretos necesarios para recuperarla.

Conservar una copia fuera del servidor y probar la restauración en una instancia separada. Un respaldo de código en GitHub no reemplaza una copia de la base de datos ni de los archivos subidos desde el panel.

Antes de actualizar Supabase, revisar la compatibilidad de las versiones y las instrucciones oficiales. Conservar los volúmenes y la configuración existente; no usar `docker compose down -v` para una actualización habitual. Las migraciones nuevas de la aplicación se agregan como archivos nuevos, sin reescribir los SQL ya aplicados.

El SMTP de Supabase para recuperar contraseñas requiere su propia configuración. El correo del formulario usa [Resend](CONTACT.md) desde Next.js; son dos flujos diferentes.
