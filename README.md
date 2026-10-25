# Wind Day-Ahead Briefing — Frontend

React dashboard for GB day-ahead wind forecasts and January 2026 forecast accuracy.

Backend repo: https://github.com/pramod8959/wind-forecast-backend

> **AI tools:** Built with assistance from Cursor (Composer).

## Run locally

Start the API (see backend repo) on port 8000, then:

```bash
npm install
npm run dev
```

UI: http://localhost:5173 (Vite proxies `/api` → `http://localhost:8000`).

For a remote API:

```bash
VITE_API_BASE=https://YOUR-API-URL npm run build
```

## Docker

```bash
docker build -t wind-briefing-ui .
docker run -p 3000:80 wind-briefing-ui
```

(`nginx.conf` proxies `/api` to host `backend` — use compose with the API, or set `VITE_API_BASE` at build time for a public API.)

## Views

1. **Day-ahead briefing** — decision-time forecast vs actual for a January 2026 delivery day  
2. **Forecast accuracy** — overall MAE / RMSE / bias and **Daily MAE (MW)** chart  

## Limitations

Pilot scope is January 2026 national wind only. Wind error ≠ buy quantity.
