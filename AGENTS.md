# AGENTS.md — Cosmic Origins

> This file orients AI agents working in this repo: what the project is, where the
> sharp edges are, and how the developer wants to fly. It is a light marker, read at
> the start of every session — keep it short, point to deeper docs, never duplicate them.
>
> *On lineage: this template is the form; every filled AGENTS.md is a particular
> that partakes of it. But the truth of a project lives in neither file — it lives
> in the developer. The protocol below exists only to recollect it.*
>
> *And the destination is never the code. Code is the idea made visible — the
> becoming, not the being. When the particulars disagree, climb: steer by the
> idea, and the idea decides.*

## Project: Cosmic Origins

A single-page, no-build web app cataloging real astronomical objects —
[github.com/BaiGanio/cosmic-origins](https://github.com/BaiGanio/cosmic-origins), served on GitHub Pages.

The eidos: **a record of humanity's — and its machines' — discoveries across the
universe.** Free public data (NASA, ESA, and other sources publishing open catalogs,
e.g. yearly CSVs) is parsed into one `UniversalAstronomicalObject` model and shown
with real imagery and real data — **no AI-generated content, only the truth and the
wonders as the probes captured them.** It is equally a **learning vehicle for young
developers**: clarity and easy-to-understand code are core values. When trade-offs
collide, real data and readable code win; the immersive full-bleed imagery is the
product surface that makes both worth looking at.

Direction (approved 2026-11-24, see `docs/briefs/cosmic-origins-platform.md`): the
backend moves to the BaiGanio platform — data from BGAPI
(`https://api.baiganio.io/api/cosmic`). **No user accounts** for now: no login, no
sign-up; favorites stay in `localStorage`. Only objects with a real photo are shown; image files stay on
NASA/ESA/ESO/NOIRLab servers. All data comes from BGAPI; there is no mock catalog
(change request for the brief: `docs/change-requests/2026-11-27-no-mock-fallback.md`). Open work is tracked as GitHub issues (see Issues below). Data import is BGAPI's job, not this repo's (#3 closed).

## Co-pilot Contract

- **Never commit.** Do the work, verify it, then hand over a Conventional Commits
  message; the developer reviews and commits themselves if they wish.
- Produce only work that can be looked at and verified — no unreviewable side
  effects (live data writes, deploys, external publishing) without explicit
  instruction.
- **Done means:** `node --check` passes on every touched JS file, `npm test` is
  green in all 3 engines, the app was actually loaded (`npx serve .`) and the
  changed flow exercised, **and** the handoff lists the exact manual steps the developer should click to verify.
- Code must stay legible to a junior developer: obvious over clever.
- **Platform contract.** This repo is part of the BaiGanio platform (BGAPI, Keycloak,
  the websites). Files in `docs/briefs/` hold contracts other repos depend on:
  endpoints, data shapes, roles, client IDs, URLs, CORS origins. If a change would
  alter or break one, stop and tell Lyuben. The contract changes first in the
  platform plan (baiganio-platform, private), then here. Never edit a brief to fit
  your change.

## Quick Start

```bash
npx serve .                       # serve locally (or just open index.html)
node --check src/ui/cosmic.js     # syntax-check any touched JS file
npm ci && npx playwright install  # once: test tooling + browsers
npx playwright test tests/ui/<file> --project=chromium   # while coding: 1 browser, only what you touch
npm test                          # when done: UI tests in Chromium, Firefox, WebKit (once)
```

The app has no build, no bundler, no lint. Test tooling (Playwright) lives in
`package.json` devDependencies, `playwright.config.js` and `tests/`; nothing in
`index.html`, `src/` or `styles/` may depend on it. A syntax error blanks the
entire page, which is why `node --check` is non-negotiable.

## Tech Stack

- **Runtime**: global `<script>` tags in `index.html` — no modules, load order matters
- **Backend**: BGAPI `/api/cosmic` (local dev only so far); when it does not answer, the page shows a one-line notice and no cards
- **Data & imagery**: NASA images API (`images-api.nasa.gov`) today; ESA and other
  free open catalogs planned as sources (BGAPI imports them; this repo only reads)
- **Testing**: Playwright Test, offline (NASA + CDN served from local files) — see
  `tests/helpers/app.js`
- **Hosting**: GitHub Pages via `.github/workflows/ui-tests.yml` — a push to `master`
  deploys only after the tests pass (needs Pages Source = "GitHub Actions")

## Configuration

No env system and no secrets — everything is committed source. The BGAPI URL lives in
`src/core/api-config.js` (localhost → `https://localhost:44364`; run `npx serve -l 4300 .`, the
only port BGAPI's dev CORS allows). Tests fake BGAPI: `api` option in `tests/helpers/app.js`.

## Database

None yet. `src/models/UniversalAstronomicalObject.js` (UAO) is the shape every source
catalog gets parsed into. The shell (`src/ui/cosmic.js`) loads `GET /catalog` from BGAPI;
`objectFromCatalogItem()` turns each item into the shape the page uses.
Favorites live in localStorage (key `co-favs`); no user accounts for now.

## Module Coupling Map

| Coupling | Why |
|----------|-----|
| `objectFromCatalogItem()` / `addDetails()` in `cosmic.js` ↔ the object shape in the brief | They read BGAPI field names (`slug`, `aliases`, `distanceLy` …); a contract change must change them too |
| `tests/fixtures/bgapi*/` ↔ the object shape in the brief | Fake BGAPI answers for the tests; keep them in the contract shape |
| `styles/cosmic.css` tokens ↔ classes used in `index.html` / `cosmic.js` | `brackets`, `--ion` / `--signal` roles, `--ease-hud` motion — UI code must consume tokens, never raw values |

## Security Model

- No accounts, no login, no forms, no cookies (#4 removed the old visual-only forms).
- Client-only app — nothing in this repo can enforce access control; assume all repo
  code is public. Access control lives in BGAPI.
- No secrets belong in this repo.

## Code Conventions

- Plain browser globals, `<script>`-tag includes — keep new code vanilla; do **not**
  reintroduce jQuery.
- Design system: all tokens at the top of `styles/cosmic.css`. Interactive = ion cyan
  `--ion`; data readouts = signal amber `--signal`. Type roles: Chakra Petch =
  headings/nav, IBM Plex Sans = prose, IBM Plex Mono = every data value, tag, label.
  Motion: always `var(--ease-hud)` with the `--t-*` durations.
- `renderGrid()` stays the single render entry point for the catalog view.
- Write for a junior reader — small functions, plain names, no cleverness that needs
  a comment to survive review.

## Contribution Conventions

Agents never commit (see Co-pilot Contract). Instead, finish the work and provide a
[Conventional Commits](https://www.conventionalcommits.org/) message for the developer:
`type: description` with types `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

No CHANGELOG, no version files, no release workflow — GitHub Pages serves `master`
directly, so review-before-commit is also review-before-deploy.

## Plans

Plans live in the body of their GitHub issue: one issue holds the goal, the plan and the tests. No plan files.
Before you write or run a plan, read `docs/how-to-plan.md` (structure, tests first, model choice).

## Issues

Open work lives in GitHub issues. Each open issue has one number label: `1`, `2`, `3` …

- Lower number goes first. Issues with the same number do not depend on each other.
- An issue that must wait has a `Depends on: #N` line at the top of its body.
- **Creating an issue:** give it a number label and, if needed, a `Depends on` line.
  If it must go between two issues, tell Lyuben which labels to shift; do not renumber alone.
- **Working on an issue:** read its `Depends on` line first. If one of those issues is
  still open, stop and tell Lyuben.
- List in order: `gh issue list --json number,title,labels`.

## Documentation Sync

Only two docs exist; keep them honest:

| Change type | Files to update |
|-------------|-----------------|
| Feature, behavior, or dependency change | `README.md` |
| Progress on or deviation from a roadmap task | `docs/follow-ups.md` (mark DONE, adjust scope) |

**Always confirm with the developer before writing doc updates.** State which files
need changes and why; wait for confirmation. Never silently modify documentation.

## Reference Files

Deep-dive docs live in `docs/` — read on demand, not every turn. `var/` is
gitignored local scratch (raw downloads in `var/data/`); never put docs there.

| Topic | File |
|-------|------|
| Open work (what to do next) | GitHub issues: `gh issue list` (order rules: § Issues) |
| Roadmap: later-stage ideas and history | `docs/follow-ups.md` (reconstructed 2026-07-10 — the original was lost) |
| Brief: move to BGAPI + Keycloak (contract, steps, checks) | `docs/briefs/cosmic-origins-platform.md` |
| Contract changes asked from the platform team (open until the brief is updated) | `docs/change-requests/` |
| Data sources, licenses, image rules | `docs/data-sources.md` |
| Old plan, partly superseded (fetch/normalize steps still apply) | `docs/plans/real-data-pipeline.md` + `-tests.md` |
| Design-system notes (tokens, type roles, motion) | token block at top of `styles/cosmic.css` (the follow-ups copy was lost) |
| How to write a plan (structure, tests first, model choice) | `docs/how-to-plan.md` |
| Data model reference | `README.md` § Data Model, `src/models/UniversalAstronomicalObject.js` |

## Maintaining This File

This file is a marker, not a manual. Any agent reading it: if a claim here no longer
matches the repo, say so — a stale briefing is worse than none. The developer has
granted standing permission to update this file whenever a change helps future
agent sessions — keep updates surgical: fix the pointer, don't grow the prose. When
something new deserves depth, it goes in a reference file and earns one line here.
(Doc-sync confirmation still applies to `README.md` and roadmap status changes.)

The unexamined briefing is not worth loading. *(Apology 38a, adjusted for context windows.)*
