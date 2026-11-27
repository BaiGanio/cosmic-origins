# Change request: remove the mock catalog fallback

- **From:** cosmic-origins (website)
- **To:** the platform team (baiganio-platform plan, `plans/cosmic-origins/`)
- **Date:** 2026-11-27
- **Asked by:** Lyuben
- **Status:** waiting for the platform plan. The website change is done on branch
  `refactor/remove-sample-data`. It is not merged yet.

## What changes

The website no longer has a mock (sample) catalog. All data comes from BGAPI.

| | Before | After |
|---|---|---|
| BGAPI does not answer | The page shows the 14-object mock `CATALOG` and a notice | The page shows the top bar, a one-line notice ("Catalog not reachable · try again later") and no cards |
| BGAPI answers with 0 objects | The page crashed (hero), later: mock + notice | One-line notice ("The catalog is empty · nothing imported yet"), no cards |
| Hero (big photo carousel) | Mock: 6 hand-picked objects | The first 6 objects of `GET /catalog`; hidden when there are none |
| Old favorite ids (`m31` → `messier-31`) | Mapped once | Dropped (brief step 4 allows this) |

## Why

Only real data from BGAPI is shown. The mock was a stand-in from before BGAPI;
BGAPI now serves the catalog.

## What the brief says now, and the new text we ask for

`docs/briefs/cosmic-origins-platform.md` in this repo is a copy of the contract. We do
not edit it until the platform plan changes.

1. Part B, step 3 (line 61):
   - **Now:** "If BGAPI does not answer, show the mock `CATALOG` and a small notice,
     so the page never goes blank."
   - **New:** "If BGAPI does not answer, or has no objects, show a one-line notice
     and no cards. There is no mock catalog."
2. Part B, step 4 (line 64):
   - **Now:** "Map the old mock IDs (`m31` → `messier-31`) once, or drop them."
   - **New:** "Old mock IDs are dropped."
3. Checks (line 121):
   - **Now:** "Stop BGAPI. Reload. The mock catalog shows with a notice. The page is not blank."
   - **New:** "Stop BGAPI. Reload. The top bar and the notice 'Catalog not reachable'
     show. No cards, no hero, no errors in the console."
4. The intro (line 9) says "Replace Firebase and the mock `CATALOG` with BGAPI". It
   stays true as history. No change needed.

## What this means for the platform

- **No endpoint, data shape, role, client ID, URL or CORS change.** BGAPI does not
  need to change.
- **BGAPI uptime matters more.** When BGAPI is down, the website shows no objects.
  Before, it showed the mock.
- **An empty catalog is visible to users.** Import data into BGAPI before the
  website goes live on `api.baiganio.io`.

## After the platform plan changes

1. Copy the new text into `docs/briefs/cosmic-origins-platform.md` here.
2. Mark this file as done (or delete it).
