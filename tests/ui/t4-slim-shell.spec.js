// T4 — Slim shell: no login, no sidebar. A slim top bar holds the brand
// (= link to the gallery) and the Ambience switch. Issue #4.
// See docs/plans/ui-polish-tests.md § T4.
// Note: t4-bgapi.spec.js also says "T4" (another plan used the same name).
// The tests here all start with "slim shell" in their group name.
const { test, expect, VIEWPORTS, openGallery, openDetail, hasNoSideScroll, visibleCards } = require("../helpers/app");

// Words that would mean a login or sign-up is still on the page
const ACCOUNT_WORDS = /\b(log ?in|log ?out|sign ?up|sign ?in|register|password)\b/i;

for (const width of [1440, 390, 360]) {
  test.describe("slim shell, width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test("T4.1 no sidebar; top bar with brand left and Ambience right; full width", async ({ page }) => {
      await openGallery(page);
      await expect(page.locator("#sidebar, .sidebar, #collapseBtn")).toHaveCount(0);

      const brand = await page.locator(".topbar .brand").boundingBox();
      const ambience = await page.locator(".topbar #ambienceBtn").boundingBox();
      expect(brand).not.toBeNull();
      expect(ambience).not.toBeNull();
      expect(brand.x + brand.width).toBeLessThan(ambience.x);              // brand left, Ambience right
      expect(ambience.x + ambience.width).toBeLessThanOrEqual(width);       // nothing cut at the right
      const middle = (box) => box.y + box.height / 2;
      expect(Math.abs(middle(brand) - middle(ambience))).toBeLessThan(4);   // on one line

      // the content uses the whole width: the hero goes from edge to edge
      const hero = await page.locator("#hero").boundingBox();
      expect(Math.round(hero.x)).toBe(0);
      expect(Math.round(hero.width)).toBe(width);
      expect(await hasNoSideScroll(page)).toBe(true);
    });
  });
}

test.describe("slim shell", () => {
  test("T4.0 no login or sign-up anywhere, no forms, no cookies", async ({ page, context }) => {
    await openGallery(page);
    await expect(page.locator("form, input[type=password]")).toHaveCount(0);
    await expect(page.locator('a[href="#login"], a[href="#register"], [data-route]')).toHaveCount(0);
    const bodyText = await page.locator("body").evaluate(el => el.textContent);
    expect(bodyText).not.toMatch(ACCOUNT_WORDS);
    expect(await context.cookies()).toEqual([]);
  });

  for (const hash of ["#login", "#register"]) {
    test("T4.0 old link " + hash + " opens the gallery", async ({ page }) => {
      await page.goto("/" + hash);
      await expect(page.locator("#resultCount")).toHaveText(/objects/);
      await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
      await expect(page.locator("#view-login, #view-register")).toHaveCount(0);
    });
  }

  test("T4.2 brand click goes to the gallery and keeps the filters", async ({ page }) => {
    await openGallery(page);
    await page.locator('.pill[data-cat="galaxy"]').click();
    await expect(page.locator("#resultCount")).toHaveText("12 of 14 objects");

    // from the gallery, scrolled down
    await visibleCards(page).last().scrollIntoViewIfNeeded();
    await page.locator(".topbar .brand").click();
    await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
    await expect(page.locator("#resultCount")).toHaveText("12 of 14 objects");
    await expect(visibleCards(page)).toHaveCount(12);
  });

  test("T4.2 from a detail page, Back opens the gallery with the filters kept", async ({ page }) => {
    // The detail view covers the whole screen (top bar too), so its
    // Back button is the way out. The filters must still be there.
    await openGallery(page);
    await page.locator('.pill[data-cat="galaxy"]').click();
    await visibleCards(page).first().click();
    await expect(page.locator("#view-detail")).toHaveClass(/is-active/);
    await page.locator("#detailBack").click();
    await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
    await expect(page.locator("#resultCount")).toHaveText("12 of 14 objects");
    await page.locator(".topbar .brand").click();
    await expect(page.locator("#resultCount")).toHaveText("12 of 14 objects");
  });

  test("T4.3 Ambience off is kept after a reload", async ({ page }) => {
    await openGallery(page);
    const button = page.locator("#ambienceBtn");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("body")).toHaveClass(/low-ambience/);
    expect(await page.evaluate(() => localStorage.getItem("co-ambience"))).toBe("0");

    await page.reload();
    await expect(page.locator("#resultCount")).toHaveText(/objects/);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("body")).toHaveClass(/low-ambience/);
    await expect(page.locator("#starfield")).toBeHidden();
  });

  test("T4.3 with reduced motion, the starfield stays off even with Ambience on", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openGallery(page);
    await expect(page.locator("#ambienceBtn")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#starfield")).toBeHidden();
  });

  test("T4.4 the app never writes co-sidebar", async ({ page }) => {
    await openGallery(page);
    await page.locator("#ambienceBtn").click();
    await page.locator("#ambienceBtn").click();
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).not.toContain("co-sidebar");
  });

  test("T4.4 an old co-sidebar value is ignored", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[1440]);
    await openGallery(page);
    await page.evaluate(() => localStorage.setItem("co-sidebar", "1"));
    await page.reload();
    await expect(page.locator("#resultCount")).toHaveText(/objects/);
    const hero = await page.locator("#hero").boundingBox();
    expect(Math.round(hero.width)).toBe(1440);
  });

  test("T4.5 the UTC clock is gone", async ({ page }) => {
    await openGallery(page);
    await expect(page.locator("#systemClock")).toHaveCount(0);
    const bodyText = await page.locator("body").evaluate(el => el.textContent);
    expect(bodyText).not.toMatch(/UTC\s*(--|\d\d):/);
  });

  // The footer (credits + privacy links) comes with issue #6.
  // This issue only keeps room for it. Turn this test on in #6.
  test.fixme("T4.6 footer with credits and privacy links at the bottom", async () => {});
});
