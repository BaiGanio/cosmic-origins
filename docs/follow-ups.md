# Follow-ups — roadmap for wiring the redesign to real services

> Open work now lives in GitHub issues (`gh issue list`). This file keeps the
> history and the later-stage ideas that are not issues yet.

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
8. **UI polish — plan in `plans/ui-polish.md`, chapters 1–5.** Ch 1–3 DONE 2026-11-24
   (tests T1–T3 green in `tests/ui/`). Ch 4 → issue #4. Ch 5 → issue #7.
9. **Automated UI tests — DONE 2026-11-24.** Code: `tests/`,
   `playwright.config.js`. Playwright, 3 engines. Pages Source switch → issue #8.

## New follow-ups (from real-data-pipeline plan, out of its scope)

- **API rate limiter** on the Pi-hosted API.
- **Hosting: Cloudflare Pages later?** Stays on GitHub Pages for now. Decide later: own
  address, own headers (CSP, cache). Touches Keycloak redirect URI, BGAPI CORS, DNS.
  See baiganio-platform `plans/cosmic-origins/README.md` Q7.
- **Scale trigger (search on the server).** The site loads one catalog snapshot
  (`GET /api/cosmic/catalog`) and searches in the browser. When the catalog passes
  20,000 objects, or the snapshot passes 1 MB after gzip, move search to BGAPI: paged
  `GET /objects?q=`, keyset paging, PostgreSQL `pg_trgm` + full-text, SQL Server full-text.
  The import script warns at 80%. Details: baiganio-platform `plans/cosmic-origins/README.md` §11.
