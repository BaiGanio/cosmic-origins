# Brief: Cosmic Origins on BGAPI (cosmic-origins)

> Status: APPROVED 2026-11-24. Revised 2026-11-28 (BaiGanio/baiganio-platform#1, #2, #3, #4, #6). Copied from baiganio-platform `plans/cosmic-origins/brief-cosmic-origins.md`. Do not edit it here.
> To change it, open an issue in `BaiGanio/baiganio-platform` (template "Change request").
> Master plan: baiganio-platform `plans/cosmic-origins/README.md` (private).
> This brief has all you need. You do not need the platform repo.

## Goal

Replace Firebase and the mock `CATALOG` with BGAPI:
- **Data** comes from BGAPI (`https://api.baiganio.io/api/cosmic`).
- **No user accounts.** No login, no sign-up. Favorites stay in the browser.
- **Images** are links to NASA / ESA / ESO / NOIRLab servers. We store no image files.

Read `CLAUDE.md` first. Its rules hold: never commit, `node --check` every
touched file, load the app and click the changed flow, code a junior can read.
This brief replaces the DB, API and k3s steps of `docs/plans/real-data-pipeline.md`.
Its fetch and normalize steps are dropped too. The import has its own repo,
`BaiGanio/cosmic-importer`. This repo has no import code and needs no Keycloak.

## Website


1. `src/core/api-config.js`: the API URL. Pick the dev URL when `location.hostname` is
   `localhost`. Run locally with `npx serve -l 4300 .` (BGAPI's dev CORS allows this port).
2. **Remove Firebase and the auth UI.** Delete `firebase-config.js`, `auth.js`,
   `firestoreImport.js` and the SDK script tags. Remove the login and sign-up forms
   (`data-stub`) and `initAuthStubs()`. Change `index.html` and `cosmic.js` together
   (coupling map). Check with Lyuben first if a UI session changed these parts.
3. **Catalog.** `renderGrid()` stays the one render entry. Load the whole short list
   once from `GET /catalog`. Filter by category and search by name and aliases **in the
   browser**. Load details from `GET /objects/{slug}` when a card opens.
   If BGAPI does not answer, or has no objects, show a one-line notice and no cards. There is no mock catalog.
   Loading and error states use the design tokens (`--ion`, `--signal`, `--ease-hud`).
4. **Favorites.** `localStorage` key `co-favs`, as today, storing `slug` values.
   Old mock IDs are dropped. An object can be deleted in BGAPI: skip a favorite whose
   slug is not in `/catalog`, and treat a 404 from `GET /objects/{slug}` as "gone", not as an error.
5. **Credits.** Detail panel shows each image's `credit` + `license` + `sourcePage`
   and each `sources` entry. Footer links to a credits section (CC-BY-SA needs it).
   What to show, and the credit text for each source: `docs/data-sources.md`, "Credits we must show".
6. Remove the `Authorization` header and key from `src/ui/nasa.js`.
7. **Privacy.**
   - **Self-host fonts and libraries.** Copy Chakra Petch, IBM Plex Sans and IBM Plex
     Mono (SIL Open Font License; `woff2`, only the weights we use) into `fonts/`, and
     Bootstrap, Bootstrap Icons and three.js into `vendor/`. Link to those files, not to
     `fonts.googleapis.com` or `cdn.jsdelivr.net`.
   - No cookies. Footer link to a short privacy notice (URL not decided yet).
8. **Small extras.** A URL per object (`#/object/messier-31`) so people can share it.
   Image `alt` = object name + credit.
9. **Metrics.** Add the Cloudflare Web Analytics beacon `<script>` to `index.html`
   (token from Lyuben; it is public).

## Contract

**BGAPI** (base `/api/cosmic`, errors are ProblemDetails, 429 has `Retry-After`)

| Method and path | Who |
|---|---|
| `GET /catalog` → `{ version, count, items }`, all objects, short form | everyone |
| `GET /objects/{slug}` → object | everyone |
| `POST /import` → `{ inserted, updated, rejected }` | `cosmic-importer` only |
| `DELETE /objects/{slug}` → 204 | `cosmic-importer` only |

**Object shape** (also the new UAO model in `src/models/UniversalAstronomicalObject.js`):

```json
{
  "slug": "messier-31", "name": "Andromeda Galaxy", "aliases": ["M 31", "NGC 224"],
  "category": "galaxy", "subcategory": "spiral", "constellation": "Andromeda",
  "ra": "00h 42m 44.3s", "dec": "+41° 16′ 09″", "distanceLy": 2537000, "magnitude": 3.44,
  "discovered": "964", "description": "", "tags": ["local-group"],
  "facts":   [{ "key": "diameter", "label": "Diameter", "value": "152000", "unit": "ly" }],
  "images":  [{ "url": "https://images-assets.nasa.gov/...", "thumbUrl": "...", "credit": "NASA/JPL-Caltech",
                "license": "public-domain", "sourcePage": "https://images.nasa.gov/details/...",
                "description": "The text of the image page." }],
  "sources": [{ "catalog": "OpenNGC", "catalogId": "NGC0224", "license": "CC-BY-SA-4.0", "url": "https://github.com/mattiaverga/OpenNGC" }],
  "updatedAt": "2026-11-24T10:00:00Z"
}
```

- `slug`: lowercase `a-z 0-9 -`, max 80, never changes. Make it from the main catalog ID (`messier-31`, `ngc-1976`, `kepler-22-b`).
- `category`: `galaxy, nebula, cluster, star, exoplanet, solar_system, exotic` (the website's groups).
- `/catalog` item: `slug, name, aliases, category, subcategory, constellation, magnitude, distanceLy, thumbUrl, credit`.
- Every object has at least 1 image. BGAPI rejects an object with none.
- Image `description`: optional, plain text, max 4000 characters. Only in `GET /objects/{slug}`, not in `/catalog`.
  You may show it in the detail panel. Set it as text (`textContent`), never as HTML.
- Image hosts BGAPI accepts: `images-assets.nasa.gov`, `cdn.esahubble.org`, `cdn.esawebb.org`, `cdn.eso.org`, `storage.noirlab.edu`.
- Scale trigger: past 20k objects or 1 MB gzip, search moves to the server (master plan §11).

## Works when

1. `node --check` passes on every touched file.
2. At `http://localhost:4300/`:
   - The grid shows real objects from BGAPI. Filters and search work with **no** extra network request.
   - Every card has a real photo. No card shows a placeholder image.
   - Add a favorite. Reload. It is still there.
   - Every image in the detail panel shows its credit and license.
   - Stop BGAPI. Reload. The top bar and the notice 'Catalog not reachable' show. No cards, no hero, no errors in the console.
   - Network tab: no request to Firebase, `fonts.googleapis.com`, `fonts.gstatic.com` or `cdn.jsdelivr.net`.
   - No login or sign-up button anywhere. No cookies set.
   - The Cloudflare Web Analytics beacon loads.

## Doc updates (confirm with Lyuben first, per `CLAUDE.md`)

`README.md` (architecture, credits, a link to `BaiGanio/cosmic-importer` for the import), `CLAUDE.md` (stack, config,
no auth, coupling map: API shape ↔ UAO model), `docs/follow-ups.md` (tasks 1, 3, 4 changed).
