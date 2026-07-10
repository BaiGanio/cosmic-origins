# CLAUDE.md — Cosmic Origins

> This file orients AI agents working in this repo: what the project is, where the
> sharp edges are, and how the developer wants to fly. It is a light marker, read at
> the start of every session — keep it short, point to deeper docs, never duplicate them.
>
> *On lineage: this template is the form; every filled CLAUDE.md is a particular
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
with real imagery and real data. It is equally a **learning vehicle for young
developers**: clarity and easy-to-understand code are core values. When trade-offs
collide, real data and readable code win; the immersive full-bleed imagery is the
product surface that makes both worth looking at.

## Co-pilot Contract

- **Never commit.** Do the work, verify it, then hand over a Conventional Commits
  message; the developer reviews and commits themselves if they wish.
- Produce only work that can be looked at and verified — no unreviewable side
  effects (live Firestore writes, deploys, external publishing) without explicit
  instruction.
- **Done means:** `node --check` passes on every touched JS file, the app was
  actually loaded (`npx serve .`) and the changed flow exercised, **and** the
  handoff lists the exact manual steps the developer should click to verify.
- Code must stay legible to a junior developer: obvious over clever.

## Quick Start

```bash
npx serve .                       # serve locally (or just open index.html)
node --check src/ui/cosmic.js     # syntax-check any touched JS file
```

That is the whole toolchain — no build, no bundler, no tests, no lint. A syntax
error blanks the entire page, which is why `node --check` is non-negotiable.

## Tech Stack

- **Runtime**: vanilla ES6+ JavaScript in the browser; global scripts loaded via
  `<script>` tags in `index.html` — no modules, load order matters
- **UI**: Bootstrap 5.3 + Bootstrap Icons (CDN); design system in `styles/cosmic.css`
- **Backend**: Firebase compat SDK — Firestore + email/password Authentication
- **Data & imagery**: NASA images API (`images-api.nasa.gov`) today; ESA and other
  free open catalogs planned as parse-and-import sources
- **Hosting**: GitHub Pages — a push to `master` is a deploy
- **Legacy, slated for removal** (see `var/follow-ups.md` task 7): jQuery, Chart.js,
  `src/ui/food-cost.js`, old stylesheets and handwriting fonts

## Configuration

No env system — configuration is committed source:

- `src/core/firebase-config.js` — Firebase client config. Public by design (it is a
  client-side identifier, not a secret); real access control must live in Firestore
  security rules, which are managed in the Firebase console, not this repo.
- `src/ui/nasa.js` — sends an `Authorization` header to images-api.nasa.gov, but that
  API requires no key; the header (and committed key) is unnecessary — remove it the
  next time this file is touched.

## Database

Firestore. Documents follow `src/models/UniversalAstronomicalObject.js` (UAO) — the
single normalization target every source catalog gets parsed into. Seed data via
`importToFirestore()` in `src/helpers/firestoreImport.js` (run from the browser console).

Current state: the redesigned shell (`src/ui/cosmic.js`) renders a mock `CATALOG`
const whose fields mirror the UAO model; wiring it to Firestore is task 1 in
`var/follow-ups.md`. Favorites live client-side in localStorage (key `co-favs`)
until auth and server-side favorites land (tasks 3–4).

## Module Coupling Map

| Coupling | Why |
|----------|-----|
| `src/ui/cosmic.js` `CATALOG` mock ↔ `src/models/UniversalAstronomicalObject.js` | Mock field names mirror the UAO schema; renaming a UAO field silently breaks the planned Firestore wiring |
| `index.html` `data-stub` forms ↔ `initAuthStubs()` in `cosmic.js` ↔ `src/core/auth.js` | Auth migration must change all three together |
| `styles/cosmic.css` tokens ↔ classes used in `index.html` / `cosmic.js` | `brackets`, `--ion` / `--signal` roles, `--ease-hud` motion — UI code must consume tokens, never raw values |
| Legacy stack (`uao-service.js`, `styles/styles.css`, …) ∥ new shell (`cosmic.js`, `cosmic.css`) | Two parallel implementations; port logic out of legacy, never load both |

## Security Model

- Auth: Firebase email/password (`src/core/auth.js`); the new shell's login/register
  forms are still stubs (`data-stub`).
- Client-only app — the trust boundary is Firestore security rules in the Firebase
  console. Nothing in this repo can enforce access control; assume all repo code is
  public.
- No secrets belong in this repo (see Configuration re: the unnecessary NASA key).

## Code Conventions

- Plain browser globals, `<script>`-tag includes — keep new code vanilla; do **not**
  reintroduce jQuery (only legacy files use it).
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
strategy, refactor roadmap — produce a plan document at `var/plans/<slug>.md`
(kebab-case slugs; `var/` is gitignored — plans are working documents, not shipped code).

### Plan structure
Every plan must include:

1. **Objective** — one sentence: the problem being solved and why it matters
2. **Diagram** — a [Mermaid](https://mermaid.js.org/) diagram of key components and
   relationships. For UI mockups, generate a PNG alongside as `<slug>.png`.
3. **Model recommendation** — which model to use for execution, with estimated
   tokens/cost and a one-sentence rationale (see Model selection below)
4. **Steps** — ordered, each with a concrete acceptance criterion ("works when…") and
   a reference to the companion test file where its tests are defined
5. **Risks** — what can go wrong, mitigation for each
6. **Doc updates** — which files need changes after implementation (see Documentation Sync)

### TDD — Tests First

Every plan MUST have a companion test file at `var/plans/<slug>-tests.md`, produced
alongside the plan. When the plan is executed, its verification criteria are validated
**before** the implementation is considered complete — verify-first, not verify-after.
In this repo a "test" is usually a provable browser behavior (exact steps + expected
result) plus `node --check` on touched files, since there is no test runner.

**Test file structure** (`var/plans/<slug>-tests.md`):

1. **Coverage map** — table mapping each plan step to a test group, so nothing falls
   through the cracks
2. **Test cases** — each with: name, input/setup, expected behavior (concrete and
   measurable), assertions, edge cases
3. **Test execution order** — dependencies between groups; tests within a group are
   independent
4. **Diagrams** (optional) — Mermaid, when a flow is easier to see than read
5. **Required setup** — fixtures, seed data (`importToFirestore()`), config

Execution loop: read the test file first → confirm the current state fails the
criteria (red) → implement until green → update the test file if discoveries change
expectations → confirm the coverage map still holds.

### Model selection

Right-size the model to the task. The developer is on a fixed monthly plan — batch
questions, prefer one-shot execution over iterative back-and-forth.

1. **Cheap capable model** — the routine wiring/cleanup tasks in `var/follow-ups.md`
   are deliberately scoped as small, self-contained sessions for inexpensive models.
2. **Frontier model** — design one-shots, architecture, and anything touching the
   design system's look and feel, batched into a single session.

## Documentation Sync

Only two docs exist; keep them honest:

| Change type | Files to update |
|-------------|-----------------|
| Feature, behavior, or dependency change | `README.md` |
| Progress on or deviation from a roadmap task | `var/follow-ups.md` (mark DONE, adjust scope) |

**Always confirm with the developer before writing doc updates.** State which files
need changes and why; wait for confirmation. Never silently modify documentation.

## Reference Files

Deep-dive docs live here — read on demand, not every turn. Note: `var/` is
gitignored, so these exist locally only.

| Topic | File |
|-------|------|
| Roadmap: wiring the redesign to real services | `var/follow-ups.md` |
| Design-system notes (tokens, type roles, motion) | end of `var/follow-ups.md`; token block at top of `styles/cosmic.css` |
| Data model reference | `README.md` § Data Model, `src/models/UniversalAstronomicalObject.js` |
| Legacy landing pages (do not extend) | `var/index-legacy.html`, `var/index-old.html` |

## Maintaining This File

This file is a marker, not a manual. Any agent reading it: if a claim here no longer
matches the repo, say so — a stale briefing is worse than none. Keep updates surgical:
fix the pointer, don't grow the prose. When something new deserves depth, it goes in a
reference file and earns one line here.

The unexamined briefing is not worth loading. *(Apology 38a, adjusted for context windows.)*
