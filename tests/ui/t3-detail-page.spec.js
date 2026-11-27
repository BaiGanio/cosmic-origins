// T3 — Detail page. See docs/plans/ui-polish-tests.md § T3.
// Note T3.1: the full-screen photo (commit 2e9b8cf) replaced the plan's 60vh
// photo. So the name must be on screen at once; the data is one tap below.
const { test, expect, VIEWPORTS, openGallery, openDetail, visibleCards } = require("../helpers/app");

const hashOf = (page) => page.evaluate(() => location.hash);

// Turn on only the given categories
async function onlyCategories(page, keep) {
  for (const pill of await page.locator(".pill[data-cat]").all()) {
    const on = (await pill.getAttribute("aria-pressed")) === "true";
    const wanted = keep.includes(await pill.getAttribute("data-cat"));
    if (on !== wanted) await pill.click();
  }
}

// Open a card from the gallery and wait for the entrance
async function openFromGallery(page, id) {
  await page.locator('.uao-card[data-id="' + id + '"] .uao-name').click();
  await expect(page).toHaveURL(new RegExp("#obj/" + id + "$"));
  await expect(page.locator("#view-detail")).toHaveClass(/is-active/);   // details come from BGAPI first
  await expect(page.locator("#view-detail")).not.toHaveClass(/is-waiting/);
}

async function isInViewport(locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth;
  });
}

for (const width of [1440, 390]) {
  test.describe("width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test("T3.1 name and designation on screen without scrolling; data one tap below", async ({ page }) => {
      await openDetail(page, "messier-16");
      await expect(page.locator("#detailTitle")).toHaveText("Eagle Nebula");
      expect(await isInViewport(page.locator("#detailTitle"))).toBe(true);
      expect(await isInViewport(page.locator("#detailDesig"))).toBe(true);
      await page.locator("#scrollHint").click();
      await expect.poll(() => isInViewport(page.locator("#telemetry > div").first())).toBe(true);
    });

    test("T3.4 the label says 'Catalog record', not LIVE", async ({ page }) => {
      await openDetail(page, "messier-16");
      await expect(page.locator(".detail-live")).toHaveText(/^Catalog record$/i);
      expect(await page.locator("#view-detail").innerText()).not.toMatch(/\bLIVE\b/i);
    });

    test("T3.5 Esc goes back to the gallery; scroll and filters kept", async ({ page }) => {
      await openGallery(page);
      await page.locator('.pill[data-cat="galaxy"]').click();
      const crab = page.locator('.uao-card[data-id="crab"]');
      await crab.scrollIntoViewIfNeeded();
      await crab.focus();
      const scrollBefore = await page.evaluate(() => scrollY);
      expect(scrollBefore).toBeGreaterThan(200);

      // Open with the keyboard, not a mouse click: on a busy machine, a
      // Playwright click can scroll the page a little first (the card still
      // moves from its hover effect), and then scrollBefore is wrong.
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#obj\/crab$/);
      await expect(page.locator("#view-detail")).toHaveClass(/is-active/);
      await expect(page.locator("#view-detail")).not.toHaveClass(/is-waiting/);
      await page.keyboard.press("Escape");

      await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
      expect(await hashOf(page)).not.toContain("obj/");
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore - 3);
      expect(await page.evaluate(() => scrollY)).toBeLessThan(scrollBefore + 3);
      await expect(page.locator("#resultCount")).toHaveText("12 of 14 objects");
      await expect(page.locator('.pill[data-cat="galaxy"]')).toHaveAttribute("aria-pressed", "false");
    });

    test("T3.5 edge: Esc in the gallery does nothing", async ({ page }) => {
      await openGallery(page);
      await page.locator('.uao-card[data-id="crab"]').scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => [location.hash, scrollY]);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => [location.hash, scrollY])).toEqual(before);
      await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
    });

    test("T3.8 related rail: 'More in Galaxies', tiles about phone-card size", async ({ page }) => {
      await openDetail(page, "messier-31");
      await expect(page.locator(".related-label")).toHaveText("More in Galaxies");
      const tiles = page.locator("#relatedRail .related-item");
      await expect(tiles).toHaveCount(1);
      const box = await tiles.first().boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(200);
      expect(box.width).toBeLessThanOrEqual(300);
    });
  });
}

test.describe("width 1440", () => {
  test.use({ viewport: VIEWPORTS[1440] });

  test("T3.2 the photo is a link to the original NASA file, in a new tab", async ({ page, context }) => {
    await openDetail(page, "messier-16");
    const link = page.locator("#detailImgLink");
    await expect(link).toHaveAttribute("href", "https://images-assets.nasa.gov/image/PIA03096/PIA03096~orig.jpg");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    // a real <a> link: middle-click and "open in new tab" work by themselves
    expect(await link.evaluate(el => el.tagName)).toBe("A");
    // a click in the upper middle of the photo opens it
    const newTab = context.waitForEvent("page");
    await page.mouse.click(720, 300);
    expect((await newTab).url()).toBe("https://images-assets.nasa.gov/image/PIA03096/PIA03096~orig.jpg");
  });

  test("T3.6 prev/next keys and buttons follow the filtered list and wrap", async ({ page }) => {
    await openGallery(page);
    await onlyCategories(page, ["nebula"]);
    await expect(visibleCards(page)).toHaveCount(2);
    await openFromGallery(page, "messier-16");

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#obj\/messier-42$/);
    await expect(page.locator("#detailTitle")).toHaveText("Orion Nebula");
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#obj\/messier-16$/);           // wraps to the start
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/#obj\/messier-42$/);           // wraps to the end

    await page.locator("#detailNext").click();
    await expect(page).toHaveURL(/#obj\/messier-16$/);
    await page.locator("#detailPrev").click();
    await expect(page).toHaveURL(/#obj\/messier-42$/);
  });

  test("T3.7 a list of 1: next stays on the same object", async ({ page }) => {
    await openGallery(page);
    await page.locator("#searchInput").fill("pulsar");
    await expect(visibleCards(page)).toHaveCount(1);
    await openFromGallery(page, "crab");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    await expect(page).toHaveURL(/#obj\/crab$/);
  });

  test("T3.7 edge: arrow keys while typing in the search do nothing", async ({ page }) => {
    await openGallery(page);
    await page.locator("#searchInput").fill("orion");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    expect(await hashOf(page)).toBe("");
    await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
  });

  test("T3.8 edge: #obj/sgra shows 1 related tile", async ({ page }) => {
    await openDetail(page, "sgra");
    await expect(page.locator(".related-label")).toHaveText("More in Exotic");
    await expect(page.locator("#relatedRail .related-item")).toHaveCount(1);
  });

  test("T3.9 the URL of an open object opens the same object in a new tab", async ({ page, context }) => {
    await openGallery(page);
    await openFromGallery(page, "europa");
    const second = await context.newPage();
    await second.goto(page.url());
    await expect(second.locator("#detailTitle")).toHaveText("Europa");
    await expect(second.locator("#view-detail")).toHaveClass(/is-active/);
    await second.close();
  });
});

// T3.3: full rows only (no empty filler cells) at every width
for (const width of [1440, 1024, 390]) {
  test.describe("width " + width, () => {
    test.use({ viewport: { width, height: 900 } });

    test("T3.3 telemetry has full rows, no empty filler cells", async ({ page }) => {
      await openDetail(page, "messier-31");
      const lefts = await page.locator("#telemetry > div").evaluateAll(els =>
        els.map(el => Math.round(el.getBoundingClientRect().left)));
      const columns = new Set(lefts).size;
      expect(lefts.length % columns).toBe(0);
      const emptyValues = await page.locator("#telemetry dd").evaluateAll(els =>
        els.filter(el => el.textContent.trim() === "").length);
      expect(emptyValues).toBe(0);
    });
  });
}
