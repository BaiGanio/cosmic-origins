# 🌌 Cosmic Origins

_A record of humanity's — and its machines' — discoveries across the universe._

**Cosmic Origins** is a single-page web app. It shows real astronomical objects (galaxies, nebulae, stars, exoplanets, moons and more) with real NASA photos. No AI-made images. It is also a project to help young developers learn vanilla JavaScript.

---

## What it does today

- Full-screen gallery of objects with real NASA photos
- Filter by category, search by name. "All" turns every category on, or clears them all
- Detail page for each object: Esc goes back, ← / → (or the ‹ › buttons) go to the previous / next object in your filtered list, a click on the photo opens the original NASA file
- Favorite star on each card. Favorites stay in your browser (`localStorage`, key `co-favs`)
- **No accounts.** No login, no sign-up, no cookies. A slim top bar holds the brand (back to the gallery) and the Ambience switch.
- Data comes from BGAPI only. If BGAPI does not answer, or has no objects yet, the page says so in one line and shows no cards

## Where it is going

Data will come from BGAPI (`https://api.baiganio.io/api/cosmic`). Only objects with a real photo are shown. Image files stay on NASA, ESA, ESO and NOIRLab servers.
Plan and contract: [docs/briefs/cosmic-origins.md](docs/briefs/cosmic-origins.md). Roadmap: [docs/follow-ups.md](docs/follow-ups.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Code | Vanilla JavaScript (ES6+), no build step |
| UI | Bootstrap 5.3 + Bootstrap Icons (CDN), design system in `styles/cosmic.css` |
| 3D | three.js (CDN) |
| Fonts | Chakra Petch, IBM Plex Sans, IBM Plex Mono (Google Fonts) |
| Tests | Playwright Test (Chromium, Firefox, WebKit) — dev tooling only, the app does not use it |
| Hosting | GitHub Pages, deployed by GitHub Actions only after the tests pass |

---

## Quick Start

```bash
git clone https://github.com/BaiGanio/cosmic-origins.git
cd cosmic-origins
npx serve -l 4300 .
```

Then open <http://localhost:4300>.

## Run the tests

The app needs no install. The tests do (Node 22+):

```bash
npm ci                    # test tools only (devDependencies)
npx playwright install    # the 3 browser engines, once
npm test                  # all tests in Chromium, Firefox and WebKit
npm run test:firefox      # one engine (also test:chromium, test:webkit)
npm run test:report       # open the HTML report of the last run
```

The tests start their own server on port 4310 and need no network: NASA
pictures and CDN files come from local copies. GitHub Actions runs the same
tests on every pull request and every push to `master`; a red test stops the
deploy.

---

## Project Structure

```
cosmic-origins/
├── index.html                           # The one page; loads only src/ui/cosmic.js
├── src/
│   ├── ui/cosmic.js                     # App shell: loads BGAPI, grid, detail, favorites
│   └── models/UniversalAstronomicalObject.js   # UAO data model (reference shape)
├── styles/cosmic.css                    # Design system and all styles
├── tests/                               # Playwright UI tests (dev only)
├── playwright.config.js, package.json   # Test tooling only — the app has no build
├── .github/workflows/ui-tests.yml       # CI: tests, then deploy to Pages
├── docs/                                # Brief, plans, roadmap, data sources
└── README.md
```

---

## Data Model

The `UniversalAstronomicalObject` (UAO) is the shape every source catalog is parsed into. **The platform brief changes this model** (slugs, image credits, `distanceLy`). Treat the table as today's shape.

| Field | Description |
|---|---|
| `name` | Main name (NGC 891, Kepler-22b, etc.) |
| `aliases` | Other catalog names |
| `category` | galaxy, nebula, star, exoplanet, planet, moon, asteroid, comet, quasar, AGN, supernova |
| `subcategory` | Finer type (spiral, emission, red_dwarf, gas_giant, etc.) |
| `catalogSource` | Where it came from: SAC, SIMBAD, NASA, JPL |
| `ra` / `dec` | Sky position (J2000) |
| `distance` | Distance, with its unit |
| `magnitude` | Apparent brightness |
| `spectralType` | Star class |
| `mass` / `radius` / `temperature` / `luminosity` | Physical values |
| `orbitalPeriod` / `semiMajorAxis` / `eccentricity` | Orbit values |
| `parentBody` | Parent body (Jupiter for Europa) |
| `tags` | Filter tags |
| `imageUrl` | Image link |

---

## 📜 License

MIT License — see [LICENSE](LICENSE).

Copyright (c) 2021 Lyuben Kikov

## ✨ Author

Created by **Lyuben Kikov** — a developer exploring full-stack web development and the cosmos.

- GitHub: [@BaiGanio](https://github.com/BaiGanio)
