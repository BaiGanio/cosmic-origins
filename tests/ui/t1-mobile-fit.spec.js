// T1 — Mobile fit. Measures sizes and positions; no screenshots.
// See docs/plans/ui-polish-tests.md § T1.
const { test, expect, VIEWPORTS, openGallery, openDetail, hasNoSideScroll, visibleCards } = require("../helpers/app");

// Distinct left edges, rounded: 1 value = 1 column, 2 values = 2 columns
async function columnCount(locator) {
  const boxes = await locator.evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().left)));
  return new Set(boxes).size;
}

// Every element's box lies inside the viewport width (0.5 px for rounding)
async function allInsideViewportWidth(locator) {
  return locator.evaluateAll(els => els.every((el) => {
    const r = el.getBoundingClientRect();
    return r.left >= -0.5 && r.right <= window.innerWidth + 0.5;
  }));
}

for (const width of [360, 390, 768]) {
  test.describe("width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test("T1.1 gallery has no sideways scroll, at the top and at the bottom", async ({ page }) => {
      await openGallery(page);
      expect(await hasNoSideScroll(page)).toBe(true);
      await visibleCards(page).last().scrollIntoViewIfNeeded();
      expect(await hasNoSideScroll(page)).toBe(true);
    });
  });
}

test.describe("width 360", () => {
  test.use({ viewport: VIEWPORTS[360] });

  for (const id of ["messier-31", "trappist1e"]) {
    test("T1.2 detail #obj/" + id + ": telemetry fits, 2 columns", async ({ page }) => {
      await openDetail(page, id);
      expect(await hasNoSideScroll(page)).toBe(true);
      const cells = page.locator("#telemetry > div");
      await expect(cells).toHaveCount(8);
      expect(await allInsideViewportWidth(cells)).toBe(true);
      expect(await columnCount(cells)).toBe(2);
      // the text inside each value is not cut (long designation must wrap)
      const valuesCut = await page.locator("#telemetry dd").evaluateAll(els =>
        els.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
      expect(valuesCut).toEqual([]);
    });
  }

  test("T1.4 cards: 1 column, none clipped, square photo", async ({ page }) => {
    await openGallery(page);
    const cards = visibleCards(page);
    await expect(cards).toHaveCount(14);
    expect(await columnCount(cards)).toBe(1);
    expect(await allInsideViewportWidth(cards)).toBe(true);
    const notSquare = await page.locator("#uaoGrid .uao-frame").evaluateAll(els =>
      els.filter((el) => {
        const r = el.getBoundingClientRect();
        return Math.abs(r.width - r.height) > 1;
      }).length);
    expect(notSquare).toBe(0);
  });
});

for (const width of [360, 390]) {
  test.describe("width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test("T1.3 pill row is one line; last pills reachable and clickable", async ({ page }) => {
      await openGallery(page);
      const pills = page.locator(".pill-row .pill");
      const tops = await pills.evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
      for (const last of [page.locator('.pill[data-cat="exotic"]'), page.locator("#pillFav")]) {
        await last.scrollIntoViewIfNeeded();
        expect(await allInsideViewportWidth(last)).toBe(true);
        await last.click({ trial: true });            // fails if covered or not clickable
      }
    });

    test("T1.5 top bar: brand name, tagline and Ambience are not cut", async ({ page }) => {
      await openGallery(page);
      for (const selector of [".brand-name", ".topbar-eyebrow", "#ambienceBtn"]) {
        const cut = await page.locator(selector).evaluate(el => el.scrollWidth > el.clientWidth);
        expect(cut, selector).toBe(false);
        expect(await allInsideViewportWidth(page.locator(selector))).toBe(true);
      }
    });
  });
}

test.describe("width 390", () => {
  test.use({ viewport: VIEWPORTS[390] });

  test("T1.6 hero prev and next buttons are both fully visible", async ({ page }) => {
    await openGallery(page);
    for (const id of ["#heroPrev", "#heroNext"]) {
      const box = await page.locator(id).boundingBox();
      expect(box, id).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }
  });
});

test.describe("width 768", () => {
  test.use({ viewport: VIEWPORTS[768] });

  test("T1.4 cards: 2 or more columns at 768", async ({ page }) => {
    await openGallery(page);
    expect(await columnCount(visibleCards(page))).toBeGreaterThanOrEqual(2);
  });
});

test.describe("width 1440", () => {
  test.use({ viewport: VIEWPORTS[1440] });

  // Desktop numbers measured from the app on 2026-11-27, after the sidebar
  // became a top bar (issue #4). If a planned design change moves them,
  // update them here on purpose.
  const DESKTOP = { gridColumns: 5, heroWidth: 1440 };

  async function measureDesktop(page) {
    return {
      gridColumns: await columnCount(visibleCards(page)),
      heroWidth: Math.round((await page.locator("#hero").boundingBox()).width),
    };
  }

  test("T1.7 desktop layout: full width, 5 card columns", async ({ page }) => {
    await openGallery(page);
    expect(await hasNoSideScroll(page)).toBe(true);
    await expect.poll(() => measureDesktop(page)).toEqual(DESKTOP);
  });
});
