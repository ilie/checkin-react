import { expect, loginAs, openMe, phone, test } from "./support/test.js";

test.use(phone);

// The Me sheet stands in for every sheet: they share the dialog, its bar and the drag handler.
async function openSheet(page) {
  await loginAs(page, "worker@example.com");
  const sheet = await openMe(page);
  await expect(sheet).toBeVisible();

  return sheet;
}

async function dragTitle(page, sheet, distance) {
  const box = await sheet.getByRole("heading", { name: "Me" }).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + distance, { steps: 8 });
  await page.mouse.up();
}

test("a sheet slides up from the bottom edge and Done closes it", async ({ page }) => {
  const sheet = await openSheet(page);
  await sheet.evaluate((dialog) => Promise.all(dialog.getAnimations().map((animation) => animation.finished)));
  const box = await sheet.boundingBox();
  expect(box.y + box.height).toBeCloseTo(844, 0);
  expect(box.width).toBe(390);

  await sheet.getByRole("button", { name: "Done" }).click();
  await expect(sheet).toBeHidden();
});

test("a tap on the backdrop closes a sheet", async ({ page }) => {
  const sheet = await openSheet(page);

  await page.mouse.click(195, 40);
  await expect(sheet).toBeHidden();
});

test("dragging a sheet down closes it, and a short drag doesn't", async ({ page }) => {
  const sheet = await openSheet(page);

  await dragTitle(page, sheet, 20);
  await expect(sheet).toBeVisible();

  await dragTitle(page, sheet, 300);
  await expect(sheet).toBeHidden();
});
