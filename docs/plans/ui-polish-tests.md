# Tests: UI polish

Companion to `docs/plans/ui-polish.md`. No test runner: each test is exact
browser steps + expected result, plus `node --check` on every touched JS file.
Red first: before a chapter starts, run its group and confirm the tests fail.

> **Automated (2026-11-24):** T0.1, T0.2, T0.4, T1, T2 and T3 run in `tests/ui/`
> (`npm test`, 3 engines). T0.3 and T0.5 stay manual. Helpers: `tests/helpers/app.js`.
> **2026-11-27:** T4 runs in `tests/ui/t4-slim-shell.spec.js` (T4.6 waits for issue #6).
> Do not mix it up with `t4-bgapi.spec.js`: another plan also named its group "T4".

## 1. Coverage map

| Plan step | Test group | Can run |
|---|---|---|
| Ch 1 Mobile fit (1.1–1.7) | T1 | now |
| Ch 2 Gallery controls (2.1–2.5) | T2 | now |
| Ch 3 Detail page (3.1–3.7) | T3 | now |
| Ch 4 Slim shell (4.1–4.4) | T4 | after brief step B2 |
| Ch 5 Sort (5.1–5.2) | T5 | after brief step B3 |
| Every chapter | T0 | always |

## 2. Required setup

- `npx serve -l 4300 .` and open `http://localhost:4300/`.
- Chrome DevTools → device toolbar for 360, 390, 768 px widths.
- Clean start: DevTools console → `localStorage.clear(); location.reload()`.
- Overflow check snippet (console):
  `document.documentElement.scrollWidth === window.innerWidth`
- Data: the app has no mock catalog any more. In the browser, run BGAPI
  (`https://localhost:44364`). The automated tests use a fake BGAPI with the same
  14 objects the mock had (`tests/fixtures/bgapi-gallery/`), so "14 objects" below
  still holds there.

## 3. Test cases

### T0 — Always

| ID | Steps | Expected |
|---|---|---|
| T0.1 | `node --check` on each touched JS file | exit 0 |
| T0.2 | Load the page, open DevTools console | No red errors |
| T0.3 | Search in the diff for raw colors / easings in new CSS | Only tokens (`--ion`, `--signal`, `--ease-hud`, `--t-*`) |
| T0.4 | `grep -n "renderGrid" src/ui/cosmic.js` | One definition; grid is only rendered from it |
| T0.5 | Compare `CATALOG` field names with `git show HEAD:src/ui/cosmic.js` | Same names |

### T1 — Mobile fit

| ID | Setup | Steps | Expected | Edge cases |
|---|---|---|---|---|
| T1.1 | 360, 390, 768 px | Gallery: run overflow snippet | `true` at all 3 widths | Also after scrolling to the bottom |
| T1.2 | 360 px | Open `#obj/m31`, run overflow snippet | `true`; all telemetry cells fully visible, 2 columns | Long value "2MASS J23062928-0502285 e" (`#obj/trappist1e`) wraps, no overflow |
| T1.3 | 390 px | Swipe the pill row to the end | Pill row is 1 line; "Exotic" (and later ★) reachable and tappable | 360 px |
| T1.4 | 360 px | Look at the cards | 1 column, no card clipped, photo square | 768 px shows 2+ columns |
| T1.5 | 390 px | Look at the top bar | Brand name, tagline and Ambience fully visible (the tagline wraps to its own line) | 360 px |
| T1.6 | 390 px | Look at hero | Prev and next buttons both visible; caption readable | — |
| T1.7 | 1440 px | Look at the gallery | Full width: the hero is 1440 px wide; 5 card columns | — *(Changed 2026-11-27: the sidebar is gone, Ch 4.)* |

### T2 — Gallery controls

| ID | Steps | Expected | Edge cases |
|---|---|---|---|
| T2.1 | Load gallery | Count reads "14 objects" in mono amber | — |
| T2.2 | Turn off Galaxies | Count reads "12 of 14 objects"; 12 cards | Type "zzz": "0 of 14", empty state shown |
| T2.3 | Look for a Search button | None. Typing "orion" filters live: Orion Nebula + Betelgeuse ("α Orionis" matches) = 2 cards | Clear field → all back |
| T2.4 | Click "All" (all on) | All pills off; 0 cards; empty state "No category picked". Click a pill → only that category. Click "All" again → all on, 14 cards | Turn 3 off, click All → all on. *(Changed 2026-11-24: Lyuben wants All to clear too.)* |
| T2.5 | Star Andromeda and Europa, click ★ favorites pill | Exactly 2 cards; count "2 of 14 objects" | Un-star one while toggle is on → 1 card |
| T2.6 | Clear all stars, toggle ★ on | Empty state: "No favorites yet — tap ☆ on a card" | — |
| T2.7 | Star a card, reload | Star still filled; ★ toggle is off | — |
| T2.8 | Look at any card's star | No number next to it | — |

### T3 — Detail page

| ID | Steps | Expected | Edge cases |
|---|---|---|---|
| T3.1 | 1440 × 900, open `#obj/m16` | Name + designation visible without scrolling; one tap on the "Telemetry" hint brings the data into view | 390 px: same. *(Changed 2026-11-24: the full-screen photo of commit 2e9b8cf replaced the 60vh cap.)* |
| T3.2 | Click the photo | New tab opens the original image URL on images-assets.nasa.gov | Middle-click works too |
| T3.3 | Look at telemetry | No empty filler cells at 1440, 1024, 390 px | — |
| T3.4 | Look at top-right label | "Catalog record" — the word "LIVE" is gone | — |
| T3.5 | Press Esc | Back to gallery; scroll position and filters kept | Esc in gallery does nothing |
| T3.6 | Gallery: only Nebulae on. Open Eagle Nebula, press → | Orion Nebula opens; → again wraps to Eagle | ← works the other way; buttons do the same as keys |
| T3.7 | Search "pulsar", open Crab Pulsar, press → | Stays on Crab Pulsar (list of 1) | Keys ignored while typing in an input |
| T3.8 | Open `#obj/m31` | Rail label "More in Galaxies"; tile size ≈ phone card | `#obj/sgra` with only 1 other exotic → 1 tile |
| T3.9 | Copy the URL of an open object, paste in new tab | Same object opens | — |

### T4 — Slim shell (after brief step B2)

| ID | Steps | Expected | Edge cases |
|---|---|---|---|
| T4.0 | Look everywhere | No login, sign-up, form or password field; no cookies | Open `#login` and `#register`: the gallery shows |
| T4.1 | Load at 1440 and 390 px | No sidebar, no rail, no collapse tab; top bar with brand + Ambience | Overflow snippet `true` |
| T4.2 | Click brand | Gallery, filters kept | The detail view covers the top bar: its Back button goes to the gallery, filters kept |
| T4.3 | Toggle Ambience, reload | Setting kept (`co-ambience`) | Reduced motion: starfield stays off |
| T4.4 | `localStorage` in DevTools | No `co-sidebar` written | Old value present → ignored |
| T4.5 | Look for UTC clock | Gone | — |
| T4.6 | Scroll to bottom | Brief's footer (credits, privacy) present | Waits for issue #6 (the test is `fixme` until then) |

### T5 — Sort (after brief step B3)

| ID | Steps | Expected | Edge cases |
|---|---|---|---|
| T5.1 | Load | Sort = Name; cards A → Z | Names with Greek letters / digits |
| T5.2 | Sort = Distance | `distanceLy` ascending (Solar System objects first) | Missing value → last |
| T5.3 | Sort = Brightness | `magnitude` ascending (lower = brighter) | Missing / "—" → last |
| T5.4 | Sort = Distance, open first object, press → | Opens the second card in the same order | Wraps at end |
| T5.5 | Sort + filter + search together | Count and order both correct | — |

## 4. Test execution order

T0 runs with every group. T1 → T2 → T3 (Ch 3 uses Ch 2's list for prev/next,
so T3.6–T3.7 need T2 green). Gate: brief Part B. Then T4 → T5 (T5.4 needs T3.6).
Tests inside a group are independent.

## 5. Discoveries

Update this file if a chapter changes an expectation (for example, the real
catalog makes "14 objects" a different number — use the live count).

- 2026-11-27 (Ch 4): the sidebar is gone, so T1.5 checks the top bar and T1.7
  checks full width. T4.0 added (no login, old links). T4.2: the detail view is
  full screen, so its Back button (not the brand) is the way out.
- 2026-11-27: the mock catalog is gone. BGAPI down or empty: a one-line notice,
  no cards, no hero (`t4-bgapi.spec.js` T4.8, T4.9).
