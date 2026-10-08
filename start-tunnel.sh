#!/bin/sh
set -eu
cd "$(dirname "$0")"

if [ ! -f .env.tunnel ] || ! grep -Eq '^TUNNEL_TOKEN=.+$' .env.tunnel; then
  printf '%s\n' 'Falta guardar el token del tunel en .env.tunnel.' >&2
  exit 1
fi

docker compose --env-file .env.production -f compose.yaml -f compose.tunnel.yaml config --quiet
docker compose --env-file .env.production -f compose.yaml -f compose.tunnel.yaml up -d tunnel
docker compose --env-file .env.production -f compose.yaml -f compose.tunnel.yaml ps tunnel
printf '%s\n' 'TUNNEL_CONTAINER_STARTED'
