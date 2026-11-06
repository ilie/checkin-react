import { download, expect, loginAs, phone, test } from "./support/test.js";

test.use(phone);

function rows(page) {
  return page.getByRole("main").getByRole("listitem");
}

async function openFilters(page) {
  await page.getByRole("button", { name: /^Filters/ }).click();

  return page.getByRole("dialog", { name: "Filters" });
}

test("a date range set in the sheet applies on Done, and Reset filters clears it", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");
  await expect(rows(page)).toHaveCount(9);

  let sheet = await openFilters(page);
  await sheet.getByLabel("From").fill("2026-10-26");
  await sheet.getByLabel("To").fill("2026-11-01");
  await sheet.getByRole("button", { name: "Done" }).click();

  await expect(page.getByRole("button", { name: "Filters 1 on" })).toBeVisible();
  await expect(rows(page)).toHaveCount(5);
  await expect(page.getByRole("heading", { name: /^Last week/ })).toContainText("37h 30m of 25h");

  // From Thursday leaves half the week out, so its total would look short.
  sheet = await openFilters(page);
  await sheet.getByLabel("From").fill("2026-10-29");
  await sheet.getByRole("button", { name: "Done" }).click();
  await expect(rows(page)).toHaveCount(2);
  await expect(page.getByRole("heading", { name: /^Last week/ })).toHaveText(/^Last week · 26 Oct–1 Nov$/);

  sheet = await openFilters(page);
  await sheet.getByRole("button", { name: "Reset filters" }).click();
  await expect(sheet.getByLabel("From")).toHaveValue("");
  await sheet.getByRole("button", { name: "Done" }).click();

  await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  await expect(rows(page)).toHaveCount(9);
});

test("Cancel leaves the filters as they were", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");
  const sheet = await openFilters(page);
  await sheet.getByRole("switch", { name: "Edited only" }).check();
  await sheet.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  await expect(rows(page)).toHaveCount(9);
});

test("an admin filters to one employee and gets their week totals, but not for a partial selection", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");
  let sheet = await openFilters(page);
  await sheet.getByLabel("Employee").selectOption({ label: "Olga Other" });
  await sheet.getByRole("button", { name: "Done" }).click();

  await expect(rows(page)).toHaveCount(8);
  await expect(page.getByRole("heading", { name: /^This week/ })).toContainText("14h 00m of 30h");

  sheet = await openFilters(page);
  await sheet.getByLabel("Status").selectOption("complete");
  await sheet.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("button", { name: "Filters 2 on" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^This week/ })).not.toContainText("of 30h");
});

test("both exports download from the Export sheet", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");
  await page.getByRole("button", { name: "Export" }).click();
  const sheet = page.getByRole("dialog", { name: "Export" });

  for (const [button, name] of [["Export check-ins", "fichajes_inicio_2026-11-04.csv"], ["Export change log", "cambios-fichajes_inicio_2026-11-04.csv"]]) {
    const file = await download(sheet.getByRole("button", { name: button }));
    expect(file.name).toBe(name);
    expect(file.content).not.toContain("Olga Other");
    if (button === "Export check-ins") expect(file.lines).toHaveLength(1 + 9);
  }
});
