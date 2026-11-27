/* ============================================================
   API CONFIG — where the Cosmic API (BGAPI) lives.
   Loaded before src/ui/cosmic.js (see index.html).
   ============================================================ */
"use strict";

const API_DEV_URL = "https://localhost:44364/api/cosmic";   // BGAPI on your own machine
const API_LIVE_URL = "https://api.baiganio.io/api/cosmic";  // the public BGAPI (not live yet)

/* On localhost we talk to the local BGAPI. Run the site with
   "npx serve -l 4300 ." — BGAPI only allows that port in Development.
   Tests set window.COSMIC_API_BASE first, to choose a fake API or none ("" = none). */
function pickApiBase() {
  if (typeof window.COSMIC_API_BASE === "string") return window.COSMIC_API_BASE;
  return location.hostname === "localhost" ? API_DEV_URL : API_LIVE_URL;
}

const API_BASE = pickApiBase();
