# Follow-ups — Cosmic Origins redesign

The 2026-07 redesign (index.html + styles/cosmic.css + src/ui/cosmic.js) is a
static shell with mock data. These tasks wire it back to real services and can
each be done in a separate, cheap session. They are ordered by value.

## 1. Wire the catalog to Firestore
- Replace the `CATALOG` const in `src/ui/cosmic.js` with a Firestore query.
- The mock objects already mirror `src/models/UniversalAstronomicalObject.js`
  field names (name, category, subcategory, description, imageUrl, favorites),
  plus new display fields: `designation, constellation, ra, dec, distance,
  magnitude, discovered`. Either add these to the Firestore documents or
  render "—" when absent.
- Reuse the fetch logic in `src/ui/uao-service.js` (legacy, jQuery-flavored);
  port it to vanilla fetch/compat SDK, don't reintroduce jQuery.
- Keep `renderGrid()` as the single render entry point — only the data source
  changes.

## 2. Real imagery via the NASA media service — PARTIALLY DONE
- The 14 mock objects now have verified images-assets.nasa.gov URLs (see the
  `IMAGES` map in `src/ui/cosmic.js`). Cards auto-downgrade `~large.jpg` to
  `~medium.jpg`; hero/detail use full size.
- Remaining: when the catalog moves to Firestore (task 1), populate
  `imageUrl` per document — either at save time via `src/ui/nasa.js` or a
  one-off backfill. Frames still degrade to the styled placeholder if a URL
  dies, so this is safe to do incrementally.

## 3. Firebase auth on the login/register views
- Forms in `index.html` are marked `data-stub`; remove the stub handler in
  `initAuthStubs()` (src/ui/cosmic.js) and call the existing
  `src/core/auth.js` functions.
- On success: hide Login/Register nav items, show the user's call sign and a
  logout button in the sidebar footer, and enable favorite persistence to
  Firestore (currently localStorage-only, key `co-favs`).

## 4. Favorites server-side
- Favorite counts currently render `obj.favorites + localStorage delta`.
- After auth works: write favorites to Firestore per-user and aggregate the
  count on the object document (the legacy code had this shape already).

## 5. Food Cost module — REMOVED (2026-07-09)
- Cut from the app by owner decision along with the "Systems" menu rail;
  modules may never return. `src/ui/food-cost.js` still exists but nothing
  references it — delete it during task 7 cleanup unless plans change.

## 6. Add-object form (admin)
- The legacy add-object UI (saveUniversalObject in uao-service.js) needs a
  home in the new shell — an authenticated-only view styled like the auth
  panels.

## 7. Cleanup after everything is migrated
- Delete `index-legacy.html`, `index-old.html`, the legacy stylesheets
  (styles/styles.css, uao-styles.css, index.css, navigation.css, fonts.css)
  and the handwriting fonts in `fonts/` if nothing references them.
- Remove jQuery and Chart.js CDN tags if their consumers are gone.

## Design-system notes for whoever continues
- All tokens live at the top of `styles/cosmic.css` (colors, type, motion).
  Interactive = ion cyan `--ion`; data readouts = signal amber `--signal`.
- Corner brackets: add class `brackets` to any panel; they grow on hover.
- Type roles: Chakra Petch = headings/nav, IBM Plex Sans = prose,
  IBM Plex Mono = every data value, tag, and label.
- Motion: always use `var(--ease-hud)` and the `--t-*` durations.
