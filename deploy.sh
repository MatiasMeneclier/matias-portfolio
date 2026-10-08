#!/bin/sh
set -eu
cd "$(dirname "$0")"

if [ ! -f .env.production ]; then
  printf '%s\n' 'Falta configurar .env.production.' >&2
  exit 1
fi

docker compose --env-file .env.production config --quiet
docker compose --progress plain --env-file .env.production build web
docker compose --env-file .env.production up -d --wait --wait-timeout 120 web
docker compose --env-file .env.production ps web
printf '%s\n' 'PORTFOLIO_RUNNING'
