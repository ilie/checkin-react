import { checkinRows, expect, expectTotal, loginAs, test } from "./support/test.js";

test("a worker sees only their own check-ins and no admin controls", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");

  await expect(page.getByRole("heading", { name: "My checkins" })).toBeVisible();
  await expectTotal(page, 9);
  await expect(checkinRows(page).filter({ hasNotText: "Walter Worker" })).toHaveCount(0);

  for (const name of ["New", "Remove", "Edit"]) {
    await expect(page.getByRole("button", { name })).toHaveCount(0);
  }
  await expect(page.getByLabel("Employee")).toHaveCount(0);
  await expect(page.getByLabel("Show deleted")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
});

// On the home page nothing asks the API for users, so a wrong admin flag isn't corrected by a 403.
test("a worker stays a worker after reloading the page", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/");
  await page.reload();

  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
});
