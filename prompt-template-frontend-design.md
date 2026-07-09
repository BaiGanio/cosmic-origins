# Front-End Design Prompt Template

Copy this file, fill every section (write "n/a" rather than deleting — an
explicit n/a tells the model not to ask), and paste it as the prompt.
Sections marked ★ are the ones whose absence forces the model to stop and
ask questions, or worse, guess wrong. Lessons baked in from the 2026-07
cosmic-origins redesign are noted as ⚠.

---

## 1. Project & single job ★
- **App/page name:**
- **One sentence — what the user does on this page:**
  (e.g. "filter, search, browse and read telemetry on cosmic objects")
- **Audience:**

## 2. Scope ★
- **Views IN scope:** (list them: gallery, detail, login, …)
- **Views OUT of scope:** (name them explicitly so nothing gets stubbed
  "just in case" — ⚠ unwanted stubs cost cleanup later, like Food Cost)
- **Components to REMOVE from the current app:** (be explicit)

## 3. Target & deployment ★
- **Repo / working directory:**
- **File(s) to replace vs. create new:** (e.g. "replace index.html; keep a
  legacy copy" or "new redesign.html, live site untouched")
- **Where it's hosted:** (GitHub Pages / local only / other)

## 4. Data & assets ★
- **Data source for this deliverable:** mock data / live API / database
  (⚠ if the real app has a backend — Firebase, REST — say whether to wire
  it now or mock it and defer; mocks should mirror the real model's fields)
- **Imagery:** real images required / placeholders acceptable
  (⚠ "placeholder frames" reads as *no images at all*. If seeing real
  photos matters to you, say "use real, verified, hotlinkable image URLs"
  and name a source, e.g. images-assets.nasa.gov)
- **Auth state:** none / visual stubs / fully wired

## 5. Non-negotiable features ★
List the things the current app does that MUST survive the redesign, even
if they seem obvious. (⚠ "the full-screen image effect was one of the main
features" was lost in the first pass because it wasn't written down.)
- 1.
- 2.
- 3.

## 6. Visual direction
- **Mood in 3–6 words:** (e.g. "astronomical telemetry cockpit, immersive")
- **Imagery-first or UI-first?** (⚠ decide: is the imagery the hero and the
  UI a thin frame around it, or is the UI the product? Default the model
  picks may not be yours)
- **Keep from current design:** (structure, features)
- **Discard from current design:** (fonts, materials, specific components)
- **Reference screenshots attached:** yes/no — attach them, they're worth
  more than any adjective
- **Anti-goals:** what it must NOT look like (e.g. "generic AI dashboard,
  flat neon-on-black, cream+serif template")

## 7. Motion & atmosphere
- **Ambient background:** none / CSS-only / **WebGL (three.js)** — if you
  write three.js you mean it literally, say so (⚠ first pass "interpreted"
  it as a 2D canvas)
- **Intensity:** barely-there / noticeable / cinematic
- **Must respect prefers-reduced-motion:** yes (keep this yes)

## 8. Tech constraints
- **Stack:** (e.g. pure HTML/CSS/JS + Bootstrap 5, CDN-only, no build step)
- **Allowed CDN libraries:** (three.js, chart.js, …)
- **Browser support / performance notes:**

## 9. Known bugs to fix
List concrete defects in the current version so they aren't re-created:
- A:
- B:

## 10. Workflow & budget ★
- **Mode:** ONE-SHOT (model plans + self-critiques internally, delivers
  code same turn, summarizes decisions at the end) — this is the cheap
  mode and the default. Only ask for staged stop-and-approve if the
  design risk is high.
- **Questions:** "Ask everything you need in ONE batch of questions before
  writing any code. After that, do not stop until done."
- **Verification:** "Verify visually before declaring done — headless
  browser screenshots of every view you built." (⚠ this caught real
  issues; require it)
- **Follow-ups:** "Write anything deferred (backend wiring, extra views,
  cleanup) into follow-ups.md with exact files and entry points, so a
  cheaper model can continue in a later session."
- **Git:** do not commit/push unless I say so. / commit when done.

---

### Minimal example (filled)

> **Job:** dashboard to browse cosmic objects. **Scope in:** gallery,
> detail, login, register. **Out:** food-cost (remove it). **Target:**
> replace index.html on GitHub Pages, keep legacy copy. **Data:** mock,
> mirroring UniversalAstronomicalObject; real NASA image URLs, verified.
> **Non-negotiable:** full-screen image hero + full-screen detail view.
> **Direction:** telemetry cockpit, imagery-first, no comic fonts.
> **Motion:** three.js starfield, literal WebGL, subtle. **Stack:** HTML/
> CSS/JS + Bootstrap 5 CDN. **Workflow:** one-shot, one question batch,
> screenshot-verify, follow-ups.md, no commits.
