# Tests: Real Data Pipeline

> Companion to [`real-data-pipeline.md`](real-data-pipeline.md). In this repo a
> "test" is a provable behavior: exact command or browser steps + expected result,
> plus `node --check` on every touched JS file. Verify-first: confirm the current
> state fails (red) before implementing.

## 1. Coverage map

| Plan step | Test group | Verifies |
|-----------|------------|----------|
| 1 — Fetch scripts | T1 | Downloads exist, are idempotent, meet minimum sizes |
| 2 — Normalizers | T2 | UAO field fidelity per source; spot-checked real objects |
| 3 — Image enrichment | T3 | Real image URLs resolve; no Authorization header used |
| 4 — Database | T4 | Schema loads; full import, zero rejects; counts match |
| 5 — API | T5 | Endpoints, filtering, CORS, readonly access |
| 6 — k3s deployment | T6 | Cluster serves the API off-machine |
| 7 — Frontend wiring | T7 | Real data renders; mock fallback; design-token states |

## 2. Test cases

### T1 — Fetch scripts

**T1.1 Downloads land and meet minimums**
- Setup: empty `var/data/`; run `node tools/import/fetch-sources.js`
- Expected: exit 0; files present with at least:
  - OpenNGC ≥ 13,000 data rows
  - NEA PSCompPars ≥ 5,000 rows (confirmed planets, 2026)
  - HYG ≥ 100,000 rows
  - SBDB export ≥ 1,000 rows (with the "named bodies" filter applied)
- Assertions: `wc -l var/data/*.csv` against the minimums above

**T1.2 Idempotent re-run**
- Setup: run the script a second time immediately
- Expected: exit 0, no duplicate files, no corruption (checksums unchanged or files cleanly re-downloaded)

**Edge cases:** network failure mid-download must not leave a truncated file that
passes T1.1 (write to temp name, rename on success).

### T2 — Normalizers

**T2.1 UAO field checklist (every source)**
- Setup: `node tools/import/normalize-<source>.js` → JSON output
- Expected: every object has non-empty `id`, `name`, `category`, `catalogSource`;
  `ra`/`dec` present where the source has coordinates; no field names outside the
  UAO model (`src/models/UniversalAstronomicalObject.js` is the contract)
- Assertions: a small `validate-uao.js` helper run over the output reports 0 violations

**T2.2 Spot checks against known truth**
| Object | Source | Assert |
|--------|--------|--------|
| M31 (Andromeda) | OpenNGC | category `galaxy`, alias includes NGC 224, magnitude ≈ 3.4 |
| Kepler-22 b | NEA | category `exoplanet`, discoveryMethod `Transit`, orbitalPeriod ≈ 290 d |
| Sirius | HYG | category `star`, spectralType starts `A1`, magnitude ≈ −1.46 |
| Ceres | SBDB | category `asteroid` (dwarf planet tag ok), parentBody/orbit populated |

**T2.3 Curation filters hold**
- Expected: HYG output only named stars with magnitude < 6; SBDB output only named bodies
- Assertions: output row counts are thousands, not 120k; zero unnamed entries

**Edge cases:** objects with missing magnitude/distance emit `null`, never `NaN`
or `"": ""`; duplicate objects across sources keep distinct `catalogSource` values
(merging is future work, not silently deduped).

### T3 — Image enrichment

**T3.1 Enrichment coverage**
- Setup: `node tools/import/enrich-images.js` over the curated set
- Expected: ≥ 80% of objects gain an `imageUrl`; script prints a report of misses
- Assertions: `curl -sI <url>` on 10 random URLs returns HTTP 200, content-type image/*

**T3.2 No API key sent**
- Assertions: `grep -ri authorization tools/import/` finds nothing; requests to
  images-api.nasa.gov are bare GETs

**T3.3 Hero images are right and real**
- Setup: the ~12 featured objects' URLs opened in a browser
- Expected: each image actually depicts the object (eyeball check — this is the
  "no wrong pictures" gate) and comes from NASA/ESA domains only

**Edge cases:** ambiguous names ("Ceres", "Phoenix") must not match unrelated
imagery — query includes category keyword; misses stay `null` (UI has a no-image state).

### T4 — Database

**T4.1 Schema applies cleanly**
- Setup: fresh `docker run postgres` per the script-header instructions; `psql -f db/schema.sql`
- Expected: exit 0; `\d objects` shows UAO core columns + `extras JSONB`; indexes on `category`, `name`

**T4.2 Full import, zero rejects**
- Setup: `node tools/import/load-db.js`
- Expected: exit 0; inserted count == normalizer output count; per-category
  `SELECT category, count(*)` matches the T2 output exactly

**T4.3 Re-import is safe**
- Setup: run `load-db.js` again
- Expected: upsert by `id` — total count unchanged, no duplicates

### T5 — API

Run against local docker-compose (DB + API).

| # | Command | Expected |
|---|---------|----------|
| T5.1 | `curl :3000/healthz` | 200, `{"ok":true}` |
| T5.2 | `curl ':3000/api/objects?category=galaxy&limit=5'` | 200, 5 items, every field name a UAO field |
| T5.3 | `curl :3000/api/objects/<id-of-M31>` | 200, full UAO JSON incl. `imageUrl`, `catalogSource` |
| T5.4 | `curl ':3000/api/objects?q=andromeda'` | 200, results include M31 (name + alias search) |
| T5.5 | `curl -H 'Origin: https://baiganio.github.io' -i ...` | `access-control-allow-origin` echoes the Pages origin |
| T5.6 | `curl :3000/api/objects/nonexistent` | 404 JSON error, not a crash |
| T5.7 | API's DB role attempts `INSERT` (psql as that role) | permission denied — readonly confirmed |

**Edge cases:** `limit` capped server-side (e.g. ≤ 100); malformed query params →
400, never 500.

### T6 — k3s deployment

**T6.1 Cluster healthy**
- Setup: `kubectl apply -f deploy/k3s/` on the Pi 5
- Expected: all pods `Running`, PVC `Bound`, no CrashLoopBackOff over 10 minutes

**T6.2 Served off-machine**
- Setup: from a laptop on the LAN: `curl https://<pi-host>/api/objects?category=galaxy`
- Expected: 200 with rows; TLS cert valid (or explicitly documented as staging)

**T6.3 Survives a reboot**
- Setup: reboot the Pi
- Expected: pods return, data intact (PVC), T6.2 passes again without manual steps

**T6.4 Tunnel path (if Cloudflare Tunnel chosen)**
- Setup: `curl https://<public-hostname>/api/objects` from off-network (phone hotspot)
- Expected: 200; home router has no newly opened ports

### T7 — Frontend wiring (browser walkthrough)

Manual steps the developer clicks — this is the handoff checklist.

**T7.1 Real data renders**
1. `npx serve .`, open the app with the API running
2. Expected: grid populates from the API (verify via devtools Network tab: one
   fetch to `/api/objects`); hero rotation shows real featured objects;
   detail panel shows real values and `catalogSource` attribution

**T7.2 Mock fallback**
1. Stop the API (or set a bogus URL in `src/core/api-config.js`); reload
2. Expected: app still renders the mock catalog — never a blank page; a subtle
   token-styled notice indicates offline/demo data

**T7.3 Design-system conformance**
- Loading and error states use `--ion`/`--signal` tokens and `var(--ease-hud)`
  motion — no raw hex values, no default spinners (grep the diff for hex colors)

**T7.4 Regressions**
- Search/filter still works over fetched data; favorites (localStorage `co-favs`)
  still toggle; `renderGrid()` remains the only render entry point (grep confirms
  no new render paths)

**T7.5 Syntax gate**
- `node --check` on every touched JS file — zero errors

## 3. Test execution order

T1 → T2 → T3 → T4 → T5 → T6 → T7. Within a group, cases are independent. T3
depends only on T2 output; T7's fallback case (T7.2) can be tested before T6 exists.

## 4. Required setup

- Node ≥ 18 (built-in fetch) on the dev machine; Docker for local Postgres
- `var/data/` gitignored (already is, via `var/`)
- Pi 5: k3s installed, `kubectl` context reachable, SSD-backed storage for the PVC preferred
- No seed fixtures needed — the ETL output *is* the fixture; keep one committed
  `tools/import/sample-output.json` (a dozen objects) so API tests can run without
  the full download
