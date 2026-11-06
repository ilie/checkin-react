import { checkinRows, expect, expectTotal, loginAs, test } from "./support/test.js";

// Seeded for the admin: 17 visible check-ins (9 Walter, 8 Olga) and 1 deleted one.
test.beforeEach(async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");
  await expectTotal(page, 17);
});

test("filters by status", async ({ page }) => {
  await page.getByLabel("Status").selectOption("open");
  await expectTotal(page, 1);
  await expect(checkinRows(page)).toContainText(["Walter Worker"]);
  await expect(checkinRows(page)).toContainText(["23/10/2026"]);

  await page.getByLabel("Status").selectOption("invalid");
  await expectTotal(page, 1);
  await expect(checkinRows(page)).toContainText(["Olga Other"]);
  await expect(checkinRows(page).first()).toContainText("Invalid");

  await page.getByLabel("Status").selectOption("complete");
  await expectTotal(page, 14);
});

test("filters by source and edited", async ({ page }) => {
  await page.getByLabel("Source").selectOption("manual");
  await expectTotal(page, 2);
  await expect(checkinRows(page).filter({ hasText: "Manual" })).toHaveCount(2);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Edited only").check();
  await expectTotal(page, 1);
  await expect(checkinRows(page).first()).toContainText("Edited ×1");
});

test("filters by employee and date range", async ({ page }) => {
  await page.getByLabel("Employee").selectOption({ label: "Olga Other" });
  await expectTotal(page, 8);
  await expect(checkinRows(page).filter({ hasText: "Walter Worker" })).toHaveCount(0);

  await page.getByLabel("Employee").selectOption("");
  await page.getByLabel("From").fill("2026-11-02");
  await page.getByLabel("To").fill("2026-11-03");
  await expectTotal(page, 5);
});

test("combines filters, including deleted check-ins", async ({ page }) => {
  await page.getByLabel("Employee").selectOption({ label: "Walter Worker" });
  await page.getByLabel("Source").selectOption("manual");
  await expectTotal(page, 1);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Show deleted").check();
  await expectTotal(page, 18);

  await page.getByLabel("Employee").selectOption({ label: "Olga Other" });
  await page.getByLabel("Edited only").check();
  await expectTotal(page, 1);
  await expect(checkinRows(page).first()).toContainText("Deleted");
});
