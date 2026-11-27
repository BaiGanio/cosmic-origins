// Detail view: a #obj/<id> link opens with no gallery flash, and the
// entrance waits for the picture (with a 1.5 s safety net).
const { test, expect, VIEWPORTS, openGallery } = require("../helpers/app");

// Runs in the page before any app code: write down whether the gallery could
// be seen, on every animation frame AND on every class change in the page.
// (Some browsers, like WebKit on Linux, run very few frames while the page is
// hidden, so frames alone are not enough.)
function installFrameRecorder() {
  window.testFrames = [];
  function galleryCanBeSeen() {
    const gallery = document.getElementById("view-gallery");
    if (!gallery || !document.body) return false;
    if (document.documentElement.classList.contains("opening-detail")) return false;
    const style = getComputedStyle(gallery);
    return style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity) > 0;
  }
  function recordFrame() {
    window.testFrames.push(galleryCanBeSeen());
    if (window.testFrames.length < 2000) requestAnimationFrame(recordFrame);
  }
  requestAnimationFrame(recordFrame);
  new MutationObserver(() => window.testFrames.push(galleryCanBeSeen()))
    .observe(document, { attributes: true, attributeFilter: ["class"], subtree: true });   // "document" exists even before <html> does
}

test.use({ viewport: VIEWPORTS[1440] });

for (const id of ["messier-31", "crab"]) {
  test("deep link #obj/" + id + " opens with no gallery flash", async ({ page }) => {
    await page.addInitScript(installFrameRecorder);
    await page.goto("/#obj/" + id);
    await expect(page.locator("#view-detail")).toHaveClass(/is-entering/);
    await expect(page.locator("#detailTitle")).toBeVisible();
    const frames = await page.evaluate(() => window.testFrames);
    expect(frames.length).toBeGreaterThanOrEqual(2);
    expect(frames.filter(Boolean).length, "moments where the gallery could be seen").toBe(0);
  });
}

// Runs in the page before any app code: writes down every class change of
// the detail panel, with the time, and how visible the caption was then.
function installClassRecorder() {
  window.testPanelLog = [];
  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("view-detail");
    const caption = panel.querySelector(".detail-caption");
    new MutationObserver(() => {
      window.testPanelLog.push({
        at: Date.now(),
        waiting: panel.classList.contains("is-waiting"),
        entering: panel.classList.contains("is-entering"),
        captionOpacity: getComputedStyle(caption).opacity,
      });
    }).observe(panel, { attributes: true, attributeFilter: ["class"] });
  });
}

const M31_PICTURE = "https://images-assets.nasa.gov/image/PIA04921/PIA04921~large.jpg";

test.describe("slow picture (1 s)", () => {
  test.use({ imageDelayMs: 1000 });

  test("deep link: the entrance waits for the picture", async ({ page, imageResponses }) => {
    await page.addInitScript(installClassRecorder);
    await page.goto("/#obj/messier-31");
    const panel = page.locator("#view-detail");
    await expect(panel).toHaveClass(/is-entering/);
    await expect(panel).not.toHaveClass(/is-waiting/);
    expect(await page.locator("#detailImg").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);

    const log = await page.evaluate(() => window.testPanelLog);
    const firstWaiting = log.find(entry => entry.waiting);
    const firstEntering = log.find(entry => entry.entering);
    const picture = imageResponses.find(r => r.url === M31_PICTURE);

    // 1. it waited first, with the caption hidden
    expect(firstWaiting, "panel had is-waiting").toBeTruthy();
    expect(firstWaiting.captionOpacity).toBe("0");
    // 2. the entrance started only after the picture was sent
    expect(picture, "messier-31 picture was requested").toBeTruthy();
    expect(firstEntering.at).toBeGreaterThanOrEqual(picture.at);
    expect(firstEntering.at - firstWaiting.at).toBeGreaterThanOrEqual(900);
  });

  test("card click: the entrance waits for the picture", async ({ page }) => {
    await page.addInitScript(installClassRecorder);
    await openGallery(page);
    await page.locator('.uao-card[data-id="messier-42"] .uao-name').click();
    const panel = page.locator("#view-detail");
    await expect(panel).toHaveClass(/is-entering/);
    expect(await page.locator("#detailImg").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const log = await page.evaluate(() => window.testPanelLog);
    const firstWaiting = log.find(entry => entry.waiting);
    const firstEntering = log.find(entry => entry.entering);
    expect(firstWaiting.captionOpacity).toBe("0");
    expect(firstEntering.at - firstWaiting.at).toBeGreaterThanOrEqual(900);
  });
});

test.describe("very slow picture (4 s)", () => {
  test.use({ imageDelayMs: 4000 });

  test("safety net: the entrance starts after about 1.5 s anyway", async ({ page }) => {
    await page.addInitScript(installClassRecorder);
    await page.goto("/#obj/messier-31", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#view-detail")).toHaveClass(/is-entering/, { timeout: 5000 });
    const log = await page.evaluate(() => window.testPanelLog);
    const waited = log.find(e => e.entering).at - log.find(e => e.waiting).at;
    expect(waited).toBeGreaterThan(1300);
    expect(waited).toBeLessThan(2500);
    await expect(page.locator("#detailTitle")).toBeVisible();
  });
});
