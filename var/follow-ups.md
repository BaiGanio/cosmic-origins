# Follow-ups — roadmap for wiring the redesign to real services

> ⚠️ Reconstructed 2026-07-10: the original file was lost (`var/` is gitignored and
> was empty in this checkout). Task numbers below are recovered from CLAUDE.md
> references; details of the original wording are gone. Design-system notes that
> used to live at the end of this file are also lost — the token block at the top
> of `styles/cosmic.css` remains the source of truth.

1. **Wire `CATALOG` mock to real data — SUPERSEDED.** Originally "wire to
   Firestore"; replaced by the self-hosted pipeline in
   [`plans/real-data-pipeline.md`](plans/real-data-pipeline.md) (free open
   catalogs → PostgreSQL → API on the Pi 5 k3s cluster).
2. *(unknown — lost in reconstruction)*
3. **Auth**: replace the `data-stub` login/register forms with real auth. Note:
   long-term direction is Keycloak on the developer's own infrastructure, not
   Firebase (see plan above).
4. **Server-side favorites**: migrate localStorage `co-favs` to per-user storage
   behind auth (task 3 first).
5. *(unknown — lost in reconstruction)*
6. *(unknown — lost in reconstruction)*
7. **Legacy removal**: drop jQuery, Chart.js, `src/ui/food-cost.js`, old
   stylesheets and handwriting fonts; port anything still needed out of
   `uao-service.js` first. Never load legacy and new shell together.

## New follow-ups (from real-data-pipeline plan, out of its scope)

- **API rate limiter** on the Pi-hosted API.
- **Keycloak** in front of the API / app auth (replaces tasks 3's Firebase route).
- **Data & imagery credits**: attribution section in README + app footer
  (CC-BY-SA sources: OpenNGC, HYG).
- **Remove the unnecessary Authorization header + committed key in `src/ui/nasa.js`**
  next time that file is touched (images-api.nasa.gov needs no key).
