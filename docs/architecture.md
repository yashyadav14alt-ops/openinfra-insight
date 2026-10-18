# Architecture

## Boundaries

- **Client:** `index.html`, `styles.css`, and `app.js` render the dashboard and make same-origin `fetch` requests. No third-party assets or libraries are loaded.
- **HTTP/API:** `app.py` uses `ThreadingHTTPServer` and `SimpleHTTPRequestHandler`. It binds to `127.0.0.1:8000` and serves both the static app and read-only JSON routes.
- **Data:** `data/assets.csv`, `data/sample-events.log`, and markdown notes in `docs/` are the only inputs. The sample CSV is validated at startup. There is no database, login, network ingestion, or external AI call.

## Request flow

1. The page requests `/api/summary`, `/api/assets`, and `/api/logs`.
2. The API reads the fictional asset rows, derives a repeatable 14-day series, and evaluates a transparent score.
3. The client renders counts, a filterable registry, schematic pins, and a selected asset chart.
4. The event explorer filters local sample lines in the browser after loading them.
5. `/api/search?q=...` ranks headings in local markdown notes using term frequency. Query text remains on the same machine.
6. The export button serializes the current API response into a browser download.

## API surface

| Route | Purpose |
|---|---|
| `GET /api/health` | Local demo mode and asset count |
| `GET /api/summary` | Counts by signal level |
| `GET /api/assets` | Validated fictional asset records with signal and explanation |
| `GET /api/assets/{asset_id}/series` | Synthetic 14-day readings and score details |
| `GET /api/logs?q=...` | Filtered synthetic event lines |
| `GET /api/search?q=...` | Term-ranked local playbook sections |

All routes are read-only. Unknown API routes return a JSON 404. Static content is served from this project directory.

## Design choices

- **Local-first:** the demo works without accounts, secrets, installs, hosted services, or third-party requests.
- **Explainable outputs:** each signal has a level, numeric score, baseline deviation, and plain-language reasons.
- **Small dependencies:** Python's standard library keeps setup easy to inspect.
- **Synthetic by construction:** sample coordinates, names, signals, and events are fictional. The schematic is not intended to represent a real district.

## Production gaps

This is not a production architecture. It has no authentication, authorization, CSRF strategy, rate limiting, persistent database, structured audit trail, secrets management, sensor validation beyond the supplied CSV, observability, model evaluation, or deployment hardening. Keep the server on loopback. Do not put real data in the sample files or expose it to a network.
