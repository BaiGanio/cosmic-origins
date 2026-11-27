// T4 — Data from BGAPI. A fake BGAPI answers with the files in
// tests/fixtures/bgapi/ (a copy of the first 6 Messier objects, 2026-11-25).
const { test, expect, openGallery, openDetail, visibleCards } = require("../helpers/app");

// The browser logs a failed request (404, no connection) as a console error.
// In the tests that ask for one on purpose, that one is not a bug.
function dropExpectedRequestErrors(consoleErrors) {
  const others = consoleErrors.filter(text => !/Failed to load resource|bgapi\.test/.test(text));
  consoleErrors.splice(0, consoleErrors.length, ...others);
}

test.describe("BGAPI answers", () => {
  test.use({ api: "fixture" });

  test("T4.1 the grid shows the 6 objects from /catalog, each with its thumbnail", async ({ page }) => {
    await openGallery(page);
    await expect(page.locator("#resultCount")).toHaveText("6 objects");
    await expect(page.locator("#dataNotice")).toBeHidden();
    const sources = await page.locator("#uaoGrid .uao-frame img").evaluateAll(els => els.map(el => el.getAttribute("src")));
    expect(sources).toHaveLength(6);
    for (const src of sources) expect(src).toMatch(/\/thumb300y\//);
    await expect(page.locator('.uao-card[data-id="messier-31"] .uao-name')).toHaveText("Andromeda Galaxy");
  });

  test("T4.2 search finds name and aliases, with or without spaces, and asks BGAPI nothing", async ({ page, apiRequests }) => {
    await openGallery(page);
    const before = apiRequests.length;
    const search = page.locator("#searchInput");
    for (const query of ["M31", "m 31", "NGC 224", "andromeda"]) {
      await search.fill(query);
      await expect(visibleCards(page)).toHaveCount(1);
      await expect(visibleCards(page).first()).toHaveAttribute("data-id", "messier-31");
    }
    await search.fill("");
    await page.locator('.pill[data-cat="galaxy"]').click();
    await expect(page.locator("#resultCount")).toHaveText("4 of 6 objects");
    expect(apiRequests.length).toBe(before);
  });

  test("T4.3 detail: every photo is listed with credit and license; credit line breaks kept", async ({ page }) => {
    await openDetail(page, "messier-31");
    await expect(page.locator("#detailTitle")).toHaveText("Andromeda Galaxy");
    const photos = page.locator("#photoList .photo-item");
    await expect(photos).toHaveCount(183);
    await expect(page.locator("#photoLabel")).toHaveText("183 photos");
    const missing = await photos.evaluateAll(items => items.filter(item =>
      !item.querySelector(".photo-credit").textContent.trim() ||
      !item.querySelector(".photo-license").textContent.trim()).length);
    expect(missing).toBe(0);
    const twoLines = page.locator(".photo-credit", { hasText: "Acknowledgment: R. Gendler" }).first();
    expect(await twoLines.evaluate(el => el.innerText)).toContain("\n");
    await expect(page.locator("#detailCredit")).toContainText("Hubble Heritage Team");
    await expect(page.locator("#sourceList li")).toHaveCount(2);
  });

  test("T4.4 a click on a small photo makes it the big picture", async ({ page }) => {
    await openDetail(page, "messier-31");
    const second = page.locator("#photoList .photo-thumb").nth(1);
    await second.scrollIntoViewIfNeeded();
    await second.click();
    await expect(page.locator("#detailImg")).toHaveAttribute("src", /heic1112a/);
    await expect(page.locator("#detailImgLink")).toHaveAttribute("href", "https://esahubble.org/images/heic1112a/");
  });

  test("T4.5 missing fields get no empty label", async ({ page }) => {
    await openDetail(page, "messier-40");   // no subcategory, no facts, no description
    const labels = await page.locator("#telemetry dt").allInnerTexts();
    expect(labels.map(l => l.toLowerCase())).not.toContain("class");
    const empty = await page.locator("#telemetry dd").evaluateAll(els => els.filter(el => !el.textContent.trim()).length);
    expect(empty).toBe(0);
    await expect(page.locator("#detailDesc")).toBeHidden();
  });

  test("T4.6 an unknown slug shows the not-found page", async ({ page, consoleErrors }) => {
    await page.goto("/#obj/messier-999");
    await expect(page.locator("#view-notfound")).toHaveClass(/is-active/);
    await expect(page.locator("#notFoundSlug")).toHaveText("messier-999");
    await page.locator("#view-notfound .search-btn").click();
    await expect(page.locator("#view-gallery")).toHaveClass(/is-active/);
    dropExpectedRequestErrors(consoleErrors);
  });

  test("T4.7 old favorite ids are moved to slugs", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("co-favs", JSON.stringify(["m31"])));
    await page.reload();
    await expect(page.locator('[data-fav="messier-31"]')).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => localStorage.getItem("co-favs"))).toBe('["messier-31"]');
  });
});

test.describe("BGAPI does not answer", () => {
  test.use({ api: "down" });

  test("T4.8 the mock catalog shows with a notice; the page is not blank", async ({ page, consoleErrors }) => {
    await openGallery(page);
    await expect(page.locator("#resultCount")).toHaveText("14 objects");
    await expect(page.locator("#dataNotice")).toBeVisible();
    await expect(page.locator("#dataNotice")).toContainText(/not reachable/i);
    dropExpectedRequestErrors(consoleErrors);
  });
});

test.describe("BGAPI answers with an empty catalog", () => {
  test.use({ api: "empty" });

  test("T4.9 an empty catalog shows the sample data and a notice, no crash", async ({ page }) => {
    await openGallery(page);
    await expect(page.locator("#resultCount")).toHaveText("14 objects");
    await expect(page.locator("#dataNotice")).toHaveText(/catalog is empty/i);
    await expect(page.locator("#heroName")).not.toBeEmpty();
    // the hero changes slide every 7 s; it must not crash when it does
    await page.locator("#heroNext").click();
    await expect(page.locator("#heroName")).not.toBeEmpty();
  });
});
