# Restaurar iotLagos/lakessensor despues de formatear

## Que se perdio y que se salvo

| Volume | Contenido | Estado |
|--------|-----------|--------|
| `lakessensor_lakessensor_local_postgres_data` | PostgreSQL con datos de sensores | PERDIDO → dump en `backups/postgres_all_FECHA.sql` |
| `lakessensor_lakessensor_local_postgres_data_backups` | Backups internos de la app | PERDIDO → tar en `backups/postgres_backups_internos_FECHA.tar.gz` |

El codigo fuente esta en bind mounts → SEGURO, en /home.

## Pasos para restaurar

### 1. Buildear las imagenes custom (el codigo esta en /home)
```bash
cd /home/javiscript13/docker/iotLagos/lakessensor
docker compose -f local.yml build
```

### 2. Levantar solo PostgreSQL
```bash
docker compose -f local.yml up -d postgres
sleep 10
```
Si el puerto 5432 ya esta en uso por otro proyecto/contenedor, este paso falla
silenciosamente (postgres no arranca) y el restore del paso 3 tambien falla sin
avisar claramente. Verificar con `docker compose -f local.yml ps` que el
contenedor `lakessensor_local_postgres` este `Up` antes de continuar.

### 3. Restaurar la base de datos
```bash
ls -lt backups/*.sql | head -3

# Si la BDD "lakessensor" ya tiene tablas (p.ej. porque django ya corrio migrate),
# hay que borrarla primero o el restore falla con errores de PK/FK duplicados:
docker compose -f local.yml exec -T postgres psql -U debug -d postgres -c "DROP DATABASE IF EXISTS lakessensor;"

# OJO: -d postgres es obligatorio. Sin -d, psql intenta conectar a una BDD
# llamada "debug" (mismo nombre que el usuario) que no existe, y falla.
docker compose -f local.yml exec -T postgres psql -U debug -d postgres < backups/postgres_all_FECHA.sql
```

El dump (`pg_dumpall`) incluye su propio `CREATE DATABASE lakessensor`, asi que
no hace falta crearla antes — solo asegurarse de que no exista con tablas ya migradas.

### 4. Levantar todo
```bash
docker compose -f local.yml up -d
```

## Credenciales PostgreSQL
Ver `.envs/.local/.postgres` (usuario, password y nombre de la BDD).

## Imagenes custom que hay que buildear
- `lakessensor_local_django`
- `lakessensor_local_frontend`
- `lakessensor_local_mqtt`
- `lakessensor_production_postgres` (postgres customizado)
