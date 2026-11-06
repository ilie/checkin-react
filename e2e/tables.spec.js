import { checkinRows, checkinsTable, expect, expectTotal, loginAs, test } from "./support/test.js";

test("sorting by date reverses the order", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");
  const dateHeader = checkinsTable(page).getByRole("columnheader", { name: "Date" });

  await expect(dateHeader).toHaveAttribute("aria-sort", "descending");
  await expect(checkinRows(page).first()).toContainText("04/11/2026");

  await dateHeader.getByRole("button", { name: "Date", exact: true }).click();
  await expect(dateHeader).toHaveAttribute("aria-sort", "ascending");
  await expect(checkinRows(page).first()).toContainText("23/10/2026");
  await expect(checkinRows(page).last()).not.toContainText("04/11/2026");
});

test("paging moves through every seeded row", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");
  await expectTotal(page, 17);
  await page.getByLabel("Rows per page").selectOption("5");

  const previous = page.getByRole("button", { name: "Previous" });
  const next = page.getByRole("button", { name: "Next" });
  const seen = [];
  for (const [pageNumber, rowCount] of [[1, 5], [2, 5], [3, 5], [4, 2]]) {
    await expect(page.getByText(`Page ${pageNumber} / 4`)).toBeVisible();
    await expect(checkinRows(page)).toHaveCount(rowCount);
    seen.push(...(await checkinRows(page).allInnerTexts()));
    if (pageNumber === 4) break;
    // The pager's label changes before the rows do, so wait for the new rows.
    const firstRow = await checkinRows(page).first().innerText();
    await next.click();
    await expect(checkinRows(page).first()).not.toHaveText(firstRow);
  }

  expect(new Set(seen).size).toBe(17);
  // The pager hides a button that has nowhere to go.
  await expect(next).toBeHidden();
  await previous.click();
  await expect(page.getByText("Page 3 / 4")).toBeVisible();
});

test("users sort by name both ways", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/users");
  const users = page.getByRole("table", { name: "Users" });
  const firstRow = users.getByRole("row").nth(1);

  await expect(firstRow).toContainText("Ana Admin");
  await users.getByRole("button", { name: "Name" }).click();
  await expect(firstRow).toContainText("Walter Worker");
});
