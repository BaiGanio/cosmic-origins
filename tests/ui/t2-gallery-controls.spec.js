// T2 — Gallery controls: count, search, "All", favorites.
// See docs/plans/ui-polish-tests.md § T2. Runs at desktop and phone width.
const { test, expect, VIEWPORTS, openGallery, visibleCards } = require("../helpers/app");

const count = (page) => page.locator("#resultCount");
const pill = (page, category) => page.locator('.pill[data-cat="' + category + '"]');
const star = (page, id) => page.locator('[data-fav="' + id + '"]');

async function visibleNames(page) {
  return (await visibleCards(page).locator(".uao-name").allTextContents()).sort();
}

for (const width of [1440, 390]) {
  test.describe("width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test.beforeEach(async ({ page }) => { await openGallery(page); });

    test("T2.1 count reads '14 objects' in mono amber", async ({ page }) => {
      await expect(count(page)).toHaveText("14 objects");
      const look = await count(page).evaluate((el) => {
        const probe = document.createElement("span");
        probe.style.color = "var(--signal)";          // the design token, resolved by the browser
        document.body.append(probe);
        const signal = getComputedStyle(probe).color;
        probe.remove();
        return { color: getComputedStyle(el).color, signal, font: getComputedStyle(el).fontFamily };
      });
      expect(look.color).toBe(look.signal);
      expect(look.font).toContain("IBM Plex Mono");
    });

    test("T2.2 turning off Galaxies shows 12 of 14", async ({ page }) => {
      await pill(page, "galaxy").click();
      await expect(count(page)).toHaveText("12 of 14 objects");
      await expect(visibleCards(page)).toHaveCount(12);
      await expect(page.locator("#emptyState")).toBeHidden();
    });

    test("T2.2 edge: search 'zzz' shows 0 of 14 and the empty state", async ({ page }) => {
      await page.locator("#searchInput").fill("zzz");
      await expect(count(page)).toHaveText("0 of 14 objects");
      await expect(visibleCards(page)).toHaveCount(0);
      await expect(page.locator("#emptyState")).toBeVisible();
    });

    test("T2.3 no Search button; typing 'orion' filters live", async ({ page }) => {
      await expect(page.locator(".search-row button")).toHaveCount(0);
      await page.locator("#searchInput").fill("orion");
      expect(await visibleNames(page)).toEqual(["Betelgeuse", "Orion Nebula"]);
      await page.locator("#searchInput").fill("");
      await expect(visibleCards(page)).toHaveCount(14);
    });

    test("T2.4 'All' is a switch: clears every category, then turns all back on", async ({ page }) => {
      const categoryPills = page.locator(".pill[data-cat]");
      // 1st click (all were on): everything off, a helpful empty state
      await page.locator("#pillAll").click();
      for (const p of await categoryPills.all()) await expect(p).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#pillAll")).toHaveAttribute("aria-pressed", "false");
      await expect(visibleCards(page)).toHaveCount(0);
      await expect(count(page)).toHaveText("0 of 14 objects");
      await expect(page.locator("#emptyState")).toContainText("No category picked");
      // pick just one after clearing
      await pill(page, "nebula").click();
      await expect(visibleCards(page)).toHaveCount(2);
      // 2nd click (not all on): everything on again
      await page.locator("#pillAll").click();
      for (const p of await categoryPills.all()) await expect(p).toHaveAttribute("aria-pressed", "true");
      await expect(visibleCards(page)).toHaveCount(14);
    });

    test("T2.4 edge: 3 off, then 'All' turns all back on", async ({ page }) => {
      for (const c of ["galaxy", "nebula", "star"]) await pill(page, c).click();
      await expect(visibleCards(page)).toHaveCount(8);
      await page.locator("#pillAll").click();
      await expect(visibleCards(page)).toHaveCount(14);
      await expect(count(page)).toHaveText("14 objects");
    });

    test("T2.5 favorites toggle shows exactly the starred cards", async ({ page }) => {
      await star(page, "m31").click();
      await star(page, "europa").click();
      await page.locator("#pillFav").click();
      await expect(visibleCards(page)).toHaveCount(2);
      expect(await visibleNames(page)).toEqual(["Andromeda", "Europa"]);
      await expect(count(page)).toHaveText("2 of 14 objects");
      // edge: un-star one while the toggle is on
      await star(page, "europa").click();
      await expect(visibleCards(page)).toHaveCount(1);
    });

    test("T2.6 favorites toggle with no stars shows a friendly empty state", async ({ page }) => {
      await page.locator("#pillFav").click();
      await expect(visibleCards(page)).toHaveCount(0);
      await expect(page.locator("#emptyState")).toBeVisible();
      await expect(page.locator("#emptyState")).toContainText("No favorites yet");
    });

    test("T2.7 a star survives a reload; the toggle starts off", async ({ page }) => {
      await star(page, "m42").click();
      await expect(star(page, "m42")).toHaveAttribute("aria-pressed", "true");
      await page.reload();
      await expect(count(page)).toHaveText("14 objects");
      await expect(star(page, "m42")).toHaveAttribute("aria-pressed", "true");
      await expect(star(page, "m42").locator("i")).toHaveClass(/bi-star-fill/);
      await expect(page.locator("#pillFav")).toHaveAttribute("aria-pressed", "false");
    });

    test("T2.8 no number next to any star", async ({ page }) => {
      const texts = await page.locator("#uaoGrid [data-fav]").allInnerTexts();
      expect(texts).toHaveLength(14);
      expect(texts.every(t => t.trim() === "")).toBe(true);
    });
  });
}
