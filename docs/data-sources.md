# Data sources

> Status: APPROVED 2026-11-24. Revised 2026-11-27 (BaiGanio/baiganio-platform#2), 2026-11-28 (BaiGanio/baiganio-platform#4, #6). Copied from baiganio-platform `plans/cosmic-origins/data-sources.md`. Do not edit it here.
> To change it, open an issue in `BaiGanio/baiganio-platform` (template "Change request").
> This file is the source of truth for where Cosmic Origins data comes from, and for the credits we show.
> Licenses checked 2026-07-10 (old plan). Image credits checked live 2026-11-24. Check again before the first real import.

## Rule

Real data and real images only. No AI-made content. No "artist's concept" images.
We store facts and **links**. Images stay on the owner's servers (CDNs).
A source whose terms are not known is not used.

## First import

The filters below give about 10k candidates. Only those with a real photo are
uploaded, so expect about 1-3k objects. The importer lists the rest (objects with no photo).

| Source | What we take | Filter | Format | License | Category | Credit text |
|---|---|---|---|---|---|---|
| [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html) | Confirmed planets, table `pscomppars` | all (about 6k candidates; only directly imaged planets keep, a few dozen) | CSV via TAP | public domain | `exoplanet` | "This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet Exploration Program." |
| [OpenNGC](https://github.com/mattiaverga/OpenNGC) | NGC/IC + Messier | Messier, or common name, or magnitude ≤ 10 (about 1.5k) | CSV | CC-BY-SA-4.0 | `galaxy`, `nebula`, `cluster` | "OpenNGC by Mattia Verga, https://github.com/mattiaverga/OpenNGC (CC BY-SA 4.0)" |
| [HYG 4.2](https://codeberg.org/astronexus/hyg) | Stars | proper name only (about 450) | CSV | CC-BY-SA-4.0 | `star` | "HYG Database, astronexus (CC BY-SA 4.0)" |
| [JPL SBDB Query API](https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html) | Asteroids, comets | diameter > 100 km, and named periodic comets (about 500) | JSON/CSV API | public domain | `solar_system` | "NASA/JPL Solar System Dynamics" |
| [JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/) | Planets, dwarf planets, big moons | a hand list in the importer (about 50) | hand-made | public domain | `solar_system` | "NASA/JPL Solar System Dynamics" |
| [Wikidata](https://www.wikidata.org) | Distance, aliases, discovery date | the objects above, one JSON per object | JSON per entity | CC0 | all | None required. We show "Wikidata" as a courtesy. |

## Images (links only)

| Source | How | License | Credit | Allowed host in BGAPI |
|---|---|---|---|---|
| [NASA Image and Video Library](https://images.nasa.gov) | search `images-api.nasa.gov` by name + aliases, no key | mostly public domain; "NASA should be acknowledged as the source". Items with third-party copyright are not used | per item: `XMP:Credit` in `https://images-assets.nasa.gov/image/<nasa_id>/metadata.json` | `images-assets.nasa.gov` |
| [ESA/Hubble](https://esahubble.org/images/) | hand-picked hero images | CC BY 4.0 | the "Credit:" line on the image page, unaltered | `cdn.esahubble.org` |
| [ESA/Webb](https://esawebb.org/images/) | hand-picked hero images | CC BY 4.0 | the "Credit:" line on the image page, unaltered | `cdn.esawebb.org` |
| [ESO](https://www.eso.org/public/images/) | hand-picked photos, many deep-sky objects | CC BY 4.0 | the "Credit:" line on the image page, unaltered | `cdn.eso.org` |
| [NOIRLab](https://noirlab.edu/public/images/) | hand-picked photos, many deep-sky objects | CC BY 4.0 | the "Credit:" line on the image page, unaltered | `storage.noirlab.edu` |

Image hosts checked 2026-11-24: ESO serves from `cdn.eso.org`. NOIRLab serves from `storage.noirlab.edu`, not `noirlab.edu` (BaiGanio/baiganio-platform#2). The `sourcePage` links stay on `noirlab.edu`.

Example credits read live on 2026-11-24:
- ESA/Hubble `heic1502a` (M31): "NASA, ESA, J. Dalcanton (University of Washington, USA), B. F. Williams (University of Washington, USA), L. C. Johnson (University of Washington, USA), the PHAT team, and R. Gendler."
- ESA/Webb `weic2205a`: "NASA, ESA, CSA, and STScI"
- NASA `PIA04921` (M31): "NASA/JPL/California Institute of Technology"

Drop a NASA result when its title or keywords contain: `artist`, `illustration`,
`concept`, `rendering`, `animation`. Also drop every URL in the importer's block list.

**No photo, no listing.** An object with no real photo left is not uploaded. It goes
on the importer's no-photo list. When we find a photo later, the next import adds it.

## Later (not in the first import)

| Source | Use |
|---|---|
| [Wikidata](https://www.wikidata.org) | more fields: short descriptions, cross IDs. CC0. |
| [Wikimedia Commons](https://commons.wikimedia.org) | more real photos. License per file, so check each one. |
| [SIMBAD / VizieR](https://cds.unistra.fr) | check names and IDs, one object at a time (TAP) |
| [NASA/IPAC NED](https://ned.ipac.caltech.edu) | more galaxy facts |
| [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | positions of planets and moons |

## Not used

| Source | Why |
|---|---|
| ESA Gaia | 1.8 billion stars. Too big for the Pi and for a gallery. |
| MAST (STScI) | raw science files, not catalog facts |
| Yale Bright Star Catalog (NASA HEASARC) | terms not checked yet |
| IAU Minor Planet Center (MPCORB) | terms not checked yet |
| ATNF Pulsar Catalogue | no license found in its README |

## Credits we must show

1. **For each image:** the `credit` text exactly as BGAPI sends it. Do not shorten or change it.
   Show it next to the image, and link it to `sourcePage`. ESA/Hubble, ESA/Webb, ESO and
   NOIRLab require this (CC BY 4.0: the credit must be visible, unaltered and linked).
2. **For each object:** the `sources` list (`catalog`, `license`, `url`).
3. **On one credits section of the website:** every source in the tables above that the
   catalog uses, with its credit text and license link.
4. **Share-alike:** data from OpenNGC and HYG is CC BY-SA 4.0. The website may show it, but
   that data stays CC BY-SA 4.0. Anyone who copies it must share it under CC BY-SA 4.0 too.
   This covers the data only, not the website code.

The importer stores the credit on every image (`credit`, `license`, `sourcePage`) and
every source (`catalog`, `catalogId`, `license`, `url`).
An image `description` is the text of the image page. It has the same terms as the image,
so the image `credit` and `sourcePage` cover it.

## Refresh

Run the import again when a source publishes new data (about once a year).
Upsert by `slug` means a re-run updates objects and makes no copies.
