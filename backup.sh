#!/bin/bash
# Backup de iotLagos/lakessensor antes de formatear
#
# Named volumes en riesgo:
#   - lakessensor_lakessensor_local_postgres_data: PostgreSQL con datos de sensores
#   - lakessensor_lakessensor_local_postgres_data_backups: backups internos

set -e
cd "$(dirname "$0")"
mkdir -p backups

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Backup iotLagos/lakessensor ==="

echo "Levantando servicio postgres..."
docker compose -f local.yml up -d postgres
echo "Esperando que PostgreSQL este lista..."
sleep 10

echo "Haciendo dump de PostgreSQL..."
# Credenciales en .envs/.local/.postgres
docker compose -f local.yml exec postgres pg_dumpall -U debug \
  > "backups/postgres_all_${TIMESTAMP}.sql"
echo "Dump guardado: backups/postgres_all_${TIMESTAMP}.sql ($(du -sh "backups/postgres_all_${TIMESTAMP}.sql" | cut -f1))"

echo "Backup de backups internos..."
docker run --rm \
  -v lakessensor_lakessensor_local_postgres_data_backups:/data \
  -v "$(pwd)/backups":/backup \
  alpine tar czf "/backup/postgres_backups_internos_${TIMESTAMP}.tar.gz" -C /data .
echo "Guardado: backups/postgres_backups_internos_${TIMESTAMP}.tar.gz"

echo "=== Listo ==="
du -sh backups/
