// No console errors on load (T0.2). Image-decode warnings are ignored,
// because they come from real NASA files on the network, not from our code.
// Note: every UI test already fails on a console error (tests/helpers/app.js);
// these tests also wait for the slow parts (pictures, starfield) to finish.
const { test, expect, VIEWPORTS, isIgnoredConsoleError, openGallery, openDetail } = require("../helpers/app");

for (const width of [1440, 390]) {
  test.describe("width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test("gallery loads with no console errors", async ({ page, consoleErrors }) => {
      await openGallery(page);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);               // a few starfield frames
      expect(consoleErrors).toEqual([]);
    });

    test("detail #obj/m31 loads with no console errors", async ({ page, consoleErrors }) => {
      await openDetail(page, "m31");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      expect(consoleErrors).toEqual([]);
    });
  });
}

test("the ignore list only skips image-decode messages", () => {
  expect(isIgnoredConsoleError("Image corrupt or truncated.")).toBe(true);
  expect(isIgnoredConsoleError("The image could not be decoded.")).toBe(true);
  expect(isIgnoredConsoleError("THREE.WebGLRenderer: Error creating WebGL context.")).toBe(true);
  expect(isIgnoredConsoleError("TypeError: x is undefined")).toBe(false);
  expect(isIgnoredConsoleError("THREE.WebGLRenderer: some other problem")).toBe(false);
});

test("the watcher catches a real console error", async ({ page, consoleErrors }) => {
  await openGallery(page);
  await page.evaluate(() => console.error("test error on purpose"));
  await expect.poll(() => consoleErrors.length).toBe(1);
  consoleErrors.length = 0;                           // clean up, so this test passes
});

test("an outside request is blocked and reported", async ({ page, outsideRequests, consoleErrors }) => {
  await openGallery(page);
  await page.evaluate(() => fetch("https://example.com/new-cdn.js").catch(() => {}));
  await expect.poll(() => outsideRequests).toEqual(["https://example.com/new-cdn.js"]);
  outsideRequests.length = 0;                         // clean up, so this test passes
  consoleErrors.length = 0;                           // the browser logs the blocked request
});
