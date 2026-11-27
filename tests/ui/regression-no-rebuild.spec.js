// Regression (bug until 2026-11-24): clicking a star or a filter pill rebuilt
// every card, so every picture loaded again and the grid flickered.
// Proof it is fixed: the <img> elements are the SAME DOM nodes after each
// click, and no visible picture ever drops below opacity 1.
const { test, expect, VIEWPORTS, openGallery, sampleMinOpacity, loadAllCardPictures } = require("../helpers/app");

const VISIBLE_PICTURES = "#uaoGrid .uao-card:not([hidden]) .uao-frame img";

for (const width of [1440, 390]) {
  test.describe("width " + width, () => {
    test.use({ viewport: VIEWPORTS[width] });

    test("card pictures are not rebuilt by star, pill, All or favorites clicks", async ({ page }) => {
      test.setTimeout(90000);   // 14 pictures + 8 clicks; slow when 3 engines run side by side
      await openGallery(page);
      const total = await loadAllCardPictures(page);
      expect(total).toBe(14);

      // Mark every picture element. A rebuilt element would not carry the mark.
      await page.locator("#uaoGrid .uao-frame img").evaluateAll((imgs) =>
        imgs.forEach((img, i) => { img.testMark = i; }));

      const steps = [
        ["star Andromeda", page.locator('[data-fav="messier-31"]')],
        ["un-star Andromeda", page.locator('[data-fav="messier-31"]')],
        ["Galaxies pill off", page.locator('.pill[data-cat="galaxy"]')],
        ["Galaxies pill on", page.locator('.pill[data-cat="galaxy"]')],
        ["All pill: clear all", page.locator("#pillAll")],
        ["All pill: all back on", page.locator("#pillAll")],
        ["star Europa", page.locator('[data-fav="europa"]')],
        ["favorites on", page.locator("#pillFav")],
        ["favorites off", page.locator("#pillFav")],
      ];

      for (const [name, target] of steps) {
        await target.scrollIntoViewIfNeeded();
        // watch opacity while the click happens, not only after it
        const watching = sampleMinOpacity(page, VISIBLE_PICTURES, 600);
        await target.click();
        const minOpacity = await watching;

        const marks = await page.locator("#uaoGrid .uao-frame img").evaluateAll((imgs) =>
          imgs.map(img => img.testMark));
        expect(marks, name + ": same picture elements").toEqual([...Array(total).keys()]);
        expect(minOpacity, name + ": pictures stay fully visible").toBe(1);
      }
    });
  });
}
