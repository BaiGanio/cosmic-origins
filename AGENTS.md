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
NASA/ESA/ESO/NOIRLab servers. The catalog already loads from BGAPI; keep the
`CATALOG` mock shape as the fallback. Open work is tracked as GitHub issues (see Issues below). Data import is BGAPI's job, not this repo's (#3 closed).

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
npm test                          # UI tests: Chromium, Firefox, WebKit
```

The app has no build, no bundler, no lint. Test tooling (Playwright) lives in
`package.json` devDependencies, `playwright.config.js` and `tests/`; nothing in
`index.html`, `src/` or `styles/` may depend on it. A syntax error blanks the
entire page, which is why `node --check` is non-negotiable.

## Tech Stack

- **Runtime**: vanilla ES6+ JavaScript in the browser; global scripts loaded via
  `<script>` tags in `index.html` — no modules, load order matters
- **UI**: Bootstrap 5.3 + Bootstrap Icons (CDN); design system in `styles/cosmic.css`
- **3D**: three.js (CDN) — the starfield in `cosmic.js`
- **Backend**: BGAPI `/api/cosmic` (local dev only so far); the mock `CATALOG` is the fallback when it does not answer
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
catalog gets parsed into. The shell (`src/ui/cosmic.js`) loads `GET /catalog` from BGAPI
and falls back to the mock `CATALOG` const, whose fields mirror the UAO model.
Favorites live in localStorage (key `co-favs`); no user accounts for now.

## Module Coupling Map

| Coupling | Why |
|----------|-----|
| `src/ui/cosmic.js` `CATALOG` mock ↔ `src/models/UniversalAstronomicalObject.js` | Mock field names mirror the UAO schema; renaming a UAO field silently breaks the planned BGAPI wiring |
| `index.html` `data-stub` forms ↔ `initAuthStubs()` in `cosmic.js` | The brief removes both together |
| `styles/cosmic.css` tokens ↔ classes used in `index.html` / `cosmic.js` | `brackets`, `--ion` / `--signal` roles, `--ease-hud` motion — UI code must consume tokens, never raw values |

## Security Model

- No accounts, no login: the `data-stub` forms are visual only.
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

When asked to write or design a plan — architecture, feature design, data-import
strategy, refactor roadmap — write it in the body of its GitHub issue: one issue holds
the goal, the plan and the tests. No plan files. (Old plans in `docs/plans/` stay until done.)

### Plan structure
Every plan must include:

1. **Objective** — one sentence: the problem being solved and why it matters
2. **Diagram** — a [Mermaid](https://mermaid.js.org/) diagram of key components and
   relationships. For UI mockups, attach a PNG to the issue.
3. **Model recommendation** — which model to use for execution, with estimated
   tokens/cost and a one-sentence rationale (see Model selection below)
4. **Steps** — ordered, each with a concrete acceptance criterion ("works when…") and
   the test group in the issue's Tests section
5. **Risks** — what can go wrong, mitigation for each
6. **Doc updates** — which files need changes after implementation (see Documentation Sync)

### TDD — Tests First

Every plan MUST have a **Tests** section in the same issue, written with the plan. When the plan is executed, its verification criteria are validated
**before** the implementation is considered complete — verify-first, not verify-after.
In this repo a "test" is usually a provable browser behavior (exact steps + expected
result) plus `node --check` on touched files; automate it in `tests/ui/` (Playwright)
when it can be measured.

**Tests section structure:**

1. **Coverage map** — table mapping each plan step to a test group, so nothing falls
   through the cracks
2. **Test cases** — each with: name, input/setup, expected behavior (concrete and
   measurable), assertions, edge cases
3. **Test execution order** — dependencies between groups; tests within a group are
   independent
4. **Diagrams** (optional) — Mermaid, when a flow is easier to see than read
5. **Required setup** — fixtures, seed data, config

Execution loop: read the Tests section first → confirm the current state fails the
criteria (red) → implement until green → update the issue if discoveries change
expectations → confirm the coverage map still holds.

### Model selection

Right-size the model to the task. The developer is on a fixed monthly plan — batch
questions, prefer one-shot execution over iterative back-and-forth.

1. **Cheap capable model** — the routine wiring/cleanup tasks in `docs/follow-ups.md`
   are deliberately scoped as small, self-contained sessions for inexpensive models.
2. **Frontier model** — design one-shots, architecture, and anything touching the
   design system's look and feel, batched into a single session.

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
| Data sources, licenses, image rules | `docs/data-sources.md` |
| Old plan, partly superseded (fetch/normalize steps still apply) | `docs/plans/real-data-pipeline.md` + `-tests.md` |
| Design-system notes (tokens, type roles, motion) | token block at top of `styles/cosmic.css` (the follow-ups copy was lost) |
| Data model reference | `README.md` § Data Model, `src/models/UniversalAstronomicalObject.js` |

## Maintaining This File

This file is a marker, not a manual. Any agent reading it: if a claim here no longer
matches the repo, say so — a stale briefing is worse than none. The developer has
granted standing permission to update this file whenever a change helps future
agent sessions — keep updates surgical: fix the pointer, don't grow the prose. When
something new deserves depth, it goes in a reference file and earns one line here.
(Doc-sync confirmation still applies to `README.md` and roadmap status changes.)

The unexamined briefing is not worth loading. *(Apology 38a, adjusted for context windows.)*
