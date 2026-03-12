# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LakesSensor is a citizen science IoT platform for water quality monitoring in Guatemalan lakes (CONCYT project). IoT devices collect water/air readings and transmit them via MQTT to a Django backend, which exposes a REST API consumed by a React frontend.

## Development Commands

### Backend (Django)

```bash
# Run tests
pytest

# Run a single test file
pytest lakessensor/users/tests/test_models.py

# Run with coverage
coverage run -m pytest && coverage html

# Type checking
mypy lakessensor

# Lint / format (Ruff)
ruff check .
ruff format .

# Django management
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
```

### Frontend (React)

```bash
cd frontend
npm start        # dev server
npm run build    # production build
npm test         # run tests
```

### Docker (local development)

The project uses Docker Compose. Compose files live in `compose/local/` and `compose/production/`. Run from the repo root using the appropriate compose file for your environment.

## Architecture

### Data Flow

```
IoT Device --MQTT--> MQTT Broker ---> mqtt_listener/ --HTTP POST--> Django API ---> PostgreSQL
                                                                          ^
                                                                          |
                                                              React Frontend (JWT auth)
```

### Key Components

**`mqtt_listener/mqtt_client.py`** — Standalone Python process (separate Docker service). Subscribes to the MQTT topic, parses comma-delimited sensor payloads (index positions: lat[1], long[2], elevation[3], session[4], waterTemp[5], airTemp[6], airHumidity[7], ph[8], deviceMAC[9]), then HTTP-POSTs to `READINGS_ENDPOINT`. Configured via env vars: `MQTT_SERVER`, `MQTT_PORT`, `MQTT_TOPIC`, `READINGS_ENDPOINT`.

**`sensorpipeline/`** — Core sensor domain app:
- `models.py`: `Device` → `ReadingSession` → `Reading` (digital) + `AnalogReading` (one-to-one with `ReadingSession`, entered manually)
- `views.py`: `ReadingCreate` implements auto-session grouping — a new `ReadingSession` is created if the last session's first reading is older than 5 minutes (`session_max_time = 5`)
- `serializers.py`: `ReadingSessionSerializer` includes computed averages (`avg_lat`, `avg_water_temp`, etc.) across all readings in the session, used by the map frontend

**`frontend/src/`** — React SPA:
- Auth via JWT tokens stored in localStorage; `AuthContext.js` manages state; `axiosInstance.js` handles token refresh
- `pages/Data.js` — public map showing all `ReadingSession` markers clustered via react-leaflet-cluster; popups show analog + averaged digital data; clicking "Ver datos completos" opens a full readings table
- `pages/DataForm.js` — authenticated form for submitting `AnalogReading` data for a session
- `services/apiService.js` — all API calls

### API Endpoints (all under `/api/`)

| Path | Method | Auth | Description |
|---|---|---|---|
| `token/` | POST | No | Obtain JWT pair |
| `token/refresh/` | POST | No | Refresh JWT |
| `sensor/readings` | POST | No | Create a `Reading` (from IoT/MQTT listener) |
| `sensor/analog` | GET, POST | JWT | List/create `AnalogReading` |
| `sensor/analog/<id>` | GET, PATCH | JWT | Retrieve/update `AnalogReading` |
| `sensor/user-readings` | GET | JWT | Sessions owned by authenticated user |
| `sensor/all-readings` | GET | No | All sessions (used by public map) |
| `docs/` | GET | Admin | Swagger UI |

### DRF camelCase Convention

The API uses `djangorestframework-camel-case`. Python model fields (`water_temp`, `avg_air_humidity`, etc.) are automatically serialized as camelCase (`waterTemp`, `avgAirHumidity`) in JSON. Frontend JS uses camelCase; backend Python uses snake_case.

### Settings Structure

- `config/settings/base.py` — shared settings (Django 4.2, PostgreSQL via `DATABASE_URL` env var, JWT auth via `simplejwt`, CORS restricted to `/api/*`)
- `config/settings/local.py` — local overrides
- `config/settings/production.py` — production overrides
- `config/settings/test.py` — used by pytest (`--ds=config.settings.test`)

### Environment Variables

Key variables expected at runtime:
- `DATABASE_URL` — PostgreSQL connection string
- `DJANGO_SECRET_KEY`
- `MQTT_SERVER`, `MQTT_PORT`, `MQTT_TOPIC` — for the mqtt_listener service
- `READINGS_ENDPOINT` — URL the mqtt_listener POSTs readings to (e.g. `http://django:8000/api/sensor/readings`)

## File Map

Quick reference to avoid unnecessary exploration. Read only the files relevant to your task.

### Backend (Python/Django)

```
config/
  api_router.py           # DRF router — registers all app URLs
  urls.py                 # Root URL conf (includes api_router)
  settings/
    base.py               # Shared settings (DB, JWT, CORS, installed apps)
    local.py              # Local dev overrides
    production.py         # Production overrides (ALLOWED_HOSTS, HTTPS, etc.)
    test.py               # Test settings (used by pytest)

sensorpipeline/           # Core sensor domain app
  models.py               # Device → ReadingSession → Reading + AnalogReading
  views.py                # ReadingCreate (auto-session), AnalogReadingViewSet, etc.
  serializers.py          # ReadingSessionSerializer with computed averages
  urls.py                 # Sensor API URL patterns

lakessensor/users/        # User management app
  models.py               # Custom User model
  api/views.py            # User API views
  api/serializers.py      # User serializers

mqtt_listener/
  mqtt_client.py          # Standalone MQTT subscriber → HTTP POST to Django API
```

### Frontend (React + MUI)

```
frontend/src/
  App.js                  # Root component, wraps with AuthContext + Router
  AppRoutes.js            # All React Router routes defined here
  index.js                # Entry point

  pages/
    Home.js               # Landing page
    Data.js               # Public map with ReadingSession markers (react-leaflet-cluster)
    DataForm.js           # Authenticated form for submitting/editing AnalogReading
    LoginPage.jsx         # Login form
    About.js / Contact.js / Ressources.js / NoMatch.js

  components/
    Map.jsx               # Leaflet map component used by Data.js
    Menu.js               # Navigation menu — use React Router Link, NOT href
    PrivateRoute.jsx      # Auth guard for protected routes
    LogoutButton.jsx
    forms/                # Reusable MUI form field wrappers
      InputField.jsx
      SelectField.jsx
      SliderField.jsx
      SwitchField.jsx     # MUI Switch — use `checked` prop, NOT `value`
      TextFieldField.jsx
      ToggleButtonGroupField.jsx

  context/
    AuthContext.js        # JWT auth state (login/logout, user info)

  services/
    apiService.js         # All API calls (single source of truth)
    axiosInstance.js      # Axios with JWT refresh interceptor
```

### Docker / Infrastructure

```
local.yml                 # Docker Compose for local dev
production.yml            # Docker Compose for production

compose/local/            # Local Dockerfiles and start scripts
  django/                 # Django dev container
  frontend/               # React dev container (npm start)
  mqtt/                   # MQTT listener container

compose/production/       # Production Dockerfiles and configs
  django/                 # Django production container
  frontend/               # React build + nginx to serve static files
  nginx/default.conf      # nginx reverse proxy config (routes /api/ to django)
  postgres/               # PostgreSQL container + backup scripts
  traefik/                # Traefik reverse proxy config (alternative to nginx-proxy)

.envs/
  .local/                 # Local env files (.django, .postgres, .mqtt)
  .production/            # Production env files (.django, .postgres, .mqtt)
```

## Debugging Guidelines

- **UI navigation issues**: Check for `href` on MUI or custom components first — use React Router `Link` or `component={Link}` instead to avoid full page reloads.
- **MUI controlled components**: `Switch`/`Checkbox` use `checked` prop (not `value`). `TextField` uses `value`.
- **Deployment config**: Always use environment variables for hosts, origins, and secrets. Never hardcode IPs or domain names.
- **API field names**: Backend uses `snake_case` (Python), API JSON uses `camelCase` (djangorestframework-camel-case), Frontend uses `camelCase` (JS).
