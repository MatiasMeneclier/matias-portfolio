# Despliegue con Docker

El sitio requiere un servidor Next.js para el admin, las sesiones y las API. No es un export estático. El Dockerfile genera una salida `standalone` en Linux y ejecuta Node como usuario sin privilegios.

La instancia del autor está publicada en [matiasmeneclier.com.ar](https://matiasmeneclier.com.ar), en un servidor propio con CasaOS y Supabase. Cloudflare Tunnel ofrece el acceso público HTTPS. Los scripts personales de publicación, credenciales y registros operativos no se distribuyen en este repositorio.

## Preparar una instancia

Requisitos: Docker y Docker Compose en un servidor amd64 o arm64. Mantener el proyecto en una carpeta separada de las otras aplicaciones de CasaOS.

```sh
git clone https://github.com/MatiasMeneclier/matias-portfolio.git
cd matias-portfolio
cp .env.example .env.production
chmod 600 .env.production
```

Completar `.env.production` con el origen HTTPS definitivo y los servicios de [Supabase](SUPABASE.md) y [Resend](CONTACT.md). Si se omiten las variables de Supabase, se muestra el contenido inicial del código y el admin real queda sin conexión. El formulario solo se habilita con ambos servicios configurados.

Las variables `NEXT_PUBLIC_` se incorporan durante la compilación: si cambian, reconstruir la imagen. `RESEND_API_KEY` se inyecta al iniciar el contenedor y no se usa como argumento de build.

## Compilar e iniciar

```sh
docker compose --env-file .env.production build web
docker compose --env-file .env.production up -d --wait web
docker compose --env-file .env.production ps web
curl -I http://127.0.0.1:3100/
```

También se incluye `sh deploy.sh`, que valida la configuración, compila y espera la comprobación de salud. Ejecutar con `sudo` si el usuario no tiene permiso para Docker.

El servicio escucha en `127.0.0.1:3100` del host y usa el puerto `3000` dentro del contenedor. `PORTFOLIO_PORT` y `PORTFOLIO_BIND_IP` permiten configurar esos valores del host. El reinicio automático usa `unless-stopped`; se incluye un volumen para la caché de Next.js y rotación de logs.

## Dominio y HTTPS

Un proxy en el host puede enviar tráfico a `http://127.0.0.1:3100`. Si el proxy o túnel se ejecuta en otro contenedor, debe compartir una red Docker con `web` y apuntar a `http://web:3000`. `localhost` dentro de ese contenedor se refiere al propio contenedor.

Para Cloudflare Tunnel, crear el túnel y guardar su token en `.env.tunnel` en el servidor:

```dotenv
TUNNEL_TOKEN=TOKEN_DEL_TUNEL
```

Ese archivo es privado y está excluido del repositorio y de la imagen. Configurar en Cloudflare una aplicación publicada con el dominio elegido, sin path, y destino `http://web:3000`. Iniciar el conector con ambos archivos Compose:

```sh
docker compose --env-file .env.production -f compose.yaml -f compose.tunnel.yaml up -d tunnel
```

También se incluye `sh start-tunnel.sh`. La conexión requiere que el dominio esté activo en Cloudflare y que el DNS apunte al túnel. La API de Supabase utiliza una ruta y un hostname propios; no duplicar el hostname del portfolio para dos servicios.

Ver [documentación de Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/). Verificar desde una red externa el certificado HTTPS, la portada, un proyecto, el CV y el login antes de dar la publicación por terminada.

## Actualizar

Los cambios de contenido guardados en el admin persisten en Supabase y no requieren un build. Los cambios de código necesitan publicar una imagen nueva:

```sh
git pull --ff-only
docker compose --env-file .env.production build web
docker compose --env-file .env.production up -d --wait web
```

Este repositorio no configura CI/CD: un push a GitHub guarda el código, pero no ejecuta estos comandos en el servidor automáticamente. Antes de actualizar, conservar el código y la imagen anterior para poder revertir, además de respaldar [la base de datos y Storage](SUPABASE-CASAOS.md).

Conservar `.env.production`, `.env.tunnel` y los volúmenes. Revisar las migraciones nuevas y aplicarlas una sola vez, en orden, si el cambio requiere modificar la base de datos.

Para investigar un arranque fallido:

```sh
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs --tail 100 web
```

Comprobar la salud del servicio y las rutas públicas tras cada despliegue. Los PDF estáticos del CV requieren regeneración y copia a `public/cv/` si cambió su contenido; la ruta `/cv` usa los registros actuales.
