# Data sources

> Status: APPROVED 2026-11-24. Copied from baiganio-platform `plans/cosmic-origins/data-sources.md`.
> This file is the source of truth for where Cosmic Origins data comes from.
> Licenses checked 2026-07-10 (old plan). Check again before the first real import.

## Rule

Real data and real images only. No AI-made content. No "artist's concept" images.
We store facts and **links**. Images stay on the owner's servers (CDNs).

## First import

The filters below give about 10k candidates. Only those with a real photo are
uploaded, so expect about 1-3k objects. The rest go to `var/data/no-image.json`.

| Source | What we take | Filter | Format | License | Category |
|---|---|---|---|---|---|
| [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html) | Confirmed planets, table `pscomppars` | all (about 6k candidates; only directly imaged planets keep, a few dozen) | CSV via TAP | public domain | `exoplanet` |
| [OpenNGC](https://github.com/mattiaverga/OpenNGC) | NGC/IC + Messier | Messier, or common name, or magnitude ≤ 10 (about 1.5k) | CSV | CC-BY-SA-4.0 | `galaxy`, `nebula`, `cluster` |
| [HYG 4.2](https://codeberg.org/astronexus/hyg) | Stars | proper name only (about 450) | CSV | CC-BY-SA-4.0 | `star` |
| [JPL SBDB Query API](https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html) | Asteroids, comets | diameter > 100 km, and named periodic comets (about 500) | JSON/CSV API | public domain | `solar_system` |
| [JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/) | Planets, dwarf planets, big moons | hand list in `tools/import/solar-system.json` (about 50) | hand-made | public domain | `solar_system` |

## Images (links only)

| Source | How | License | Allowed host in BGAPI |
|---|---|---|---|
| [NASA Image and Video Library](https://images.nasa.gov) | search `images-api.nasa.gov` by name + aliases, no key | mostly public domain, check each item's `credit` | `images-assets.nasa.gov` |
| [ESA/Hubble](https://esahubble.org/images/) | hand-picked hero images | CC BY 4.0 | `cdn.esahubble.org` |
| [ESA/Webb](https://esawebb.org/images/) | hand-picked hero images | CC BY 4.0 | `cdn.esawebb.org` |
| [ESO](https://www.eso.org/public/images/) | hand-picked photos, many deep-sky objects | CC BY 4.0 | `cdn.eso.org` |
| [NOIRLab](https://noirlab.edu/public/images/) | hand-picked photos, many deep-sky objects | CC BY 4.0 | `noirlab.edu` |

Check the real image hosts of ESO and NOIRLab before the first import. Change the BGAPI allow list if they differ.

Drop a NASA result when its title or keywords contain: `artist`, `illustration`,
`concept`, `rendering`, `animation`. Also drop every URL in `tools/import/image-blocklist.json`.

**No photo, no listing.** An object with no real photo left is not uploaded. It goes
to `var/data/no-image.json`. When we find a photo later, the next import adds it.

## Later (not in the first import)

| Source | Use |
|---|---|
| [Wikidata](https://www.wikidata.org) | short descriptions, cross IDs. CC0. |
| [Wikimedia Commons](https://commons.wikimedia.org) | more real photos. License per file, so check each one. |
| [SIMBAD / VizieR](https://cds.unistra.fr) | check names and IDs, one object at a time (TAP) |
| [NASA/IPAC NED](https://ned.ipac.caltech.edu) | more galaxy facts |
| [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | positions of planets and moons |

## Not used

| Source | Why |
|---|---|
| ESA Gaia | 1.8 billion stars. Too big for the Pi and for a gallery. |
| MAST (STScI) | raw science files, not catalog facts |

## Credits we must show

- Every object keeps `sources` (catalog, ID, license, URL).
- Every image keeps `credit`, `license`, `sourcePage`.
- The website has a credits section that names OpenNGC and HYG (CC-BY-SA needs credit).

## Refresh

Run the import again when a source publishes new data (about once a year).
Upsert by `slug` means a re-run updates objects and makes no copies.
