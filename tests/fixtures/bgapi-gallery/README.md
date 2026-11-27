# Fake BGAPI data for the UI tests

The UI tests use this folder as the BGAPI answer (`api: "gallery"`, the default in
`tests/helpers/app.js`): `catalog.json` for `GET /catalog`, `objects/<slug>.json`
for `GET /objects/{slug}`.

14 objects, one per photo from NASA. The first 6 in `catalog.json` are the
hero slides (the app shows the first 6 of the catalog there). Made on 2026-11-27 from the old sample
catalog that the app had in `src/ui/cosmic.js` (the app has no sample data now).
Edit these files by hand. The app itself never reads them.

`tests/fixtures/bgapi/` is different: a copy of 6 real Messier objects from BGAPI
(`api: "fixture"`).
