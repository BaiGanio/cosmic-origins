# Follow-ups — roadmap for wiring the redesign to real services

> ⚠️ Reconstructed 2026-07-10: the original file was lost (it lived in `var/`, which git ignored, and
> was empty in this checkout). Task numbers below are recovered from CLAUDE.md
> references; details of the original wording are gone. Design-system notes that
> used to live at the end of this file are also lost — the token block at the top
> of `styles/cosmic.css` remains the source of truth.

1. **Wire `CATALOG` mock to real data — SUPERSEDED.** Replaced by the self-hosted pipeline in
   [`plans/real-data-pipeline.md`](plans/real-data-pipeline.md) (free open
   catalogs → PostgreSQL → API on the Pi 5 k3s cluster).
2. *(unknown — lost in reconstruction)*
3. **Auth — LATER STAGE.** No user accounts for now (decided 2026-11-24). The
   brief removes the `data-stub` forms. Accounts may come back
   later with Keycloak (baiganio-platform `plans/cosmic-origins/README.md` §14).
4. **Server-side favorites — LATER STAGE.** Favorites stay in `localStorage` `co-favs`
   (storing slugs). Server sync needs accounts (task 3).
5. *(unknown — lost in reconstruction)*
6. *(unknown — lost in reconstruction)*
7. **Legacy removal — DONE 2026-11-24.** Deleted every file `index.html` does not
   load (old scripts, stylesheets, fonts, images). `uao-service.js` held nothing
   `cosmic.js` needs.
8. **UI polish — plan in `plans/ui-polish.md`, chapters 1–5.** Ch 1 (mobile fit) and
   Ch 2 (gallery controls) DONE 2026-11-24 — tests T1, T2 green in `tests/ui/`.
   Ch 3 (detail page) DONE 2026-11-24 — tests T3 green. Ch 4–5 wait for brief Part B.
9. **Automated UI tests — DONE 2026-11-24.** Plan: [`plans/ui-tests.md`](plans/ui-tests.md).
   Playwright, 3 engines, groups T0–T2 + no-rebuild regression + detail entrance.
   Open: switch Pages Source to "GitHub Actions" so the deploy waits for the tests.
   Later: automate T3–T5 of `plans/ui-polish-tests.md` as those chapters land.

## New follow-ups (from real-data-pipeline plan, out of its scope)

- **API rate limiter** on the Pi-hosted API.
- **Data & imagery credits**: attribution section in README + app footer
  (CC-BY-SA sources: OpenNGC, HYG).
- **Hosting: Cloudflare Pages later?** Stays on GitHub Pages for now. Decide later: own
  address, own headers (CSP, cache). Touches Keycloak redirect URI, BGAPI CORS, DNS.
  See baiganio-platform `plans/cosmic-origins/README.md` Q7.
- **Self-host fonts and CDN scripts (privacy).** Google Fonts and jsDelivr get the visitor IP.
  Part of the brief, Part B step 7. When it lands, update `CDN_COPIES` in
  `tests/helpers/app.js` (tests fail on any unknown outside request).
- **Scale trigger (search on the server).** The site loads one catalog snapshot
  (`GET /api/cosmic/catalog`) and searches in the browser. When the catalog passes
  20,000 objects, or the snapshot passes 1 MB after gzip, move search to BGAPI: paged
  `GET /objects?q=`, keyset paging, PostgreSQL `pg_trgm` + full-text, SQL Server full-text.
  The import script warns at 80%. Details: baiganio-platform `plans/cosmic-origins/README.md` §11.
