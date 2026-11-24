// Shared test setup for every UI test.
//
// What it does for each test:
// 1. Offline: NASA pictures come from one local JPEG; Bootstrap, three.js and
//    Bootstrap Icons come from node_modules (same versions as index.html);
//    Google Fonts get an empty stylesheet. Any other outside request is
//    blocked AND makes the test fail, so a new CDN cannot sneak in.
// 2. Clean localStorage before the app runs (once per test; a reload keeps
//    what the test itself saved).
// 3. Console watch: any console error or page error fails the test, except
//    image-decode warnings (those come from real NASA files, not our code).
const fs = require("fs");
const path = require("path");
const base = require("@playwright/test");

const ROOT = path.join(__dirname, "..", "..");
const TEST_IMAGE = fs.readFileSync(path.join(__dirname, "..", "fixtures", "space.jpg"));

// CDN address prefix → local folder with the same files
const CDN_COPIES = {
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/": "node_modules/bootstrap/",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/": "node_modules/bootstrap-icons/",
  "https://cdn.jsdelivr.net/npm/three@0.147.0/": "node_modules/three/",
};
const NASA_HOSTS = ["images-assets.nasa.gov", "images-api.nasa.gov"];

// Console messages we do not count as our bugs. Keep this list short.
const IGNORED_CONSOLE_ERRORS = [
  /decod/i,                          // "Image could not be decoded", "decode error"
  /Image corrupt or truncated/i,     // Firefox wording for a bad image file
];

function isIgnoredConsoleError(text) {
  return IGNORED_CONSOLE_ERRORS.some(pattern => pattern.test(text));
}

const VIEWPORTS = {
  360: { width: 360, height: 780 },
  390: { width: 390, height: 844 },
  768: { width: 768, height: 1024 },
  1440: { width: 1440, height: 900 },
};

const test = base.test.extend({
  // Delay for NASA picture responses, in ms. Change it with test.use({ imageDelayMs: 1000 }).
  imageDelayMs: [0, { option: true }],

  // Each NASA picture response sent to the page: { url, at: Date.now() }
  imageResponses: async ({}, use) => { await use([]); },

  // Outside addresses that were blocked. Must stay empty.
  outsideRequests: async ({}, use) => { await use([]); },

  // Console errors and page errors (already without the ignored ones). Must stay empty.
  consoleErrors: async ({}, use) => { await use([]); },

  context: async ({ context, imageDelayMs, imageResponses, outsideRequests }, use) => {
    await context.route("**/*", async (route) => {
      const url = route.request().url();
      const host = new URL(url).hostname;

      if (host === "localhost" || url.startsWith("data:")) return route.continue();

      if (NASA_HOSTS.includes(host)) {
        if (imageDelayMs) await new Promise(r => setTimeout(r, imageDelayMs));
        imageResponses.push({ url, at: Date.now() });
        // the page may be closed already when a slow picture arrives
        return route.fulfill({ status: 200, contentType: "image/jpeg", body: TEST_IMAGE }).catch(() => {});
      }

      const prefix = Object.keys(CDN_COPIES).find(p => url.startsWith(p));
      if (prefix) {
        const file = url.slice(prefix.length).split("?")[0].split("#")[0];
        return route.fulfill({ path: path.join(ROOT, CDN_COPIES[prefix], file) });
      }

      if (host === "fonts.googleapis.com") {
        return route.fulfill({ status: 200, contentType: "text/css", body: "/* fonts off in tests */" });
      }

      outsideRequests.push(url);
      return route.abort();
    });

    await context.addInitScript(() => {
      if (!sessionStorage.getItem("test-storage-cleaned")) {
        localStorage.clear();
        sessionStorage.setItem("test-storage-cleaned", "1");
      }
    });

    await use(context);
  },

  page: async ({ page, consoleErrors, outsideRequests }, use) => {
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isIgnoredConsoleError(msg.text())) consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push("pageerror: " + err.message));

    await use(page);

    // Checked after every test:
    base.expect(outsideRequests, "requests to the outside network (add a local copy)").toEqual([]);
    base.expect(consoleErrors, "console errors").toEqual([]);
  },
});

/* ---------- small measuring helpers ---------- */

// Open the gallery and wait until the cards are there
async function openGallery(page) {
  await page.goto("/");
  await base.expect(page.locator("#resultCount")).toHaveText(/objects/);
}

// Open one object's detail view and wait until the entrance has started
async function openDetail(page, id) {
  await page.goto("/#obj/" + id);
  await base.expect(page.locator("#view-detail")).not.toHaveClass(/is-waiting/);
}

// true when the page has no sideways scrolling
async function hasNoSideScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth === window.innerWidth);
}

// The cards that are not hidden
function visibleCards(page) {
  return page.locator("#uaoGrid .uao-card:not([hidden])");
}

// Read the lowest opacity of the matching elements, every animation frame, for ms
function sampleMinOpacity(page, selector, ms) {
  return page.evaluate(({ selector, ms }) => new Promise((resolve) => {
    let min = 1;
    const end = performance.now() + ms;
    function tick() {
      for (const el of document.querySelectorAll(selector)) {
        min = Math.min(min, parseFloat(getComputedStyle(el).opacity));
      }
      if (performance.now() < end) requestAnimationFrame(tick);
      else resolve(min);
    }
    tick();
  }), { selector, ms });
}

// Scroll every card picture into view (they use loading="lazy"), then wait
// until each one has loaded (class is-loaded)
async function loadAllCardPictures(page) {
  const imgs = page.locator("#uaoGrid .uao-frame img");
  const count = await imgs.count();
  for (let i = 0; i < count; i++) await imgs.nth(i).scrollIntoViewIfNeeded();
  await base.expect.poll(() =>
    page.locator("#uaoGrid .uao-frame img.is-loaded").count()).toBe(count);
  // is-loaded starts a short fade-in; wait until every picture is fully shown
  await base.expect.poll(() => imgs.evaluateAll(els =>
    els.every(el => getComputedStyle(el).opacity === "1"))).toBe(true);
  return count;
}

module.exports = {
  test, expect: base.expect, VIEWPORTS, isIgnoredConsoleError,
  openGallery, openDetail, hasNoSideScroll, visibleCards, sampleMinOpacity, loadAllCardPictures,
};
