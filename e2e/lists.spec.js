import { expect, loginAs, phone, test } from "./support/test.js";

test.use(phone);

function week(page, name) {
  return page.getByRole("region", { name });
}

function weekHeading(page, name) {
  return page.getByRole("heading", { name });
}

test("a worker's check-ins group into weeks with their totals", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");

  await expect(page.getByRole("heading", { name: "Check-ins", level: 1 })).toBeVisible();
  await expect(weekHeading(page, /^This week · 2–8 Nov/)).toContainText("16h 55m of 25h");
  await expect(week(page, /^This week/).getByRole("button")).toHaveText([/^Wed 4 Nov.*Open/, /^Tue 3 Nov/, /^Mon 2 Nov/]);
  await expect(weekHeading(page, /^Last week · 26 Oct–1 Nov/)).toContainText("37h 30m of 25h");
  await expect(week(page, /^Last week/).getByRole("button")).toHaveCount(5);
  await expect(week(page, /^Last week/).getByRole("button", { name: /Tue 27 Oct/ })).toContainText("Edited");
  await expect(week(page, /^19–25 Oct/).getByRole("button")).toHaveText([/^Fri 23 Oct.*no check-out.*Open/]);
});

test("Show more loads the next rows, and a week's total waits until it's whole", async ({ page }) => {
  // The app asks for 50 rows; four make several pages out of Walter's nine.
  await page.route(/\/api\/checkins\?/, (route) =>
    route.continue({ url: route.request().url().replace(/page(\[|%5B)size(\]|%5D)=50/, "page$1size$2=4") }),
  );
  await loginAs(page, "worker@example.com", "/checkins");
  const showMore = page.getByRole("button", { name: "Show more" });

  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(4);
  await expect(weekHeading(page, /^This week/)).toContainText("16h 55m of 25h");
  await expect(weekHeading(page, /^Last week/)).not.toContainText("of 25h");

  await showMore.click();
  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(8);
  await expect(weekHeading(page, /^Last week/)).not.toContainText("of 25h");

  await showMore.click();
  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(9);
  await expect(weekHeading(page, /^Last week/)).toContainText("37h 30m of 25h");
  await expect(showMore).toHaveCount(0);
});

test("a row opens its details and change history", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");
  await page.getByRole("button", { name: /Tue 27 Oct/ }).click();
  const sheet = page.getByRole("dialog", { name: "Tue 27 Oct" });

  await expect(sheet.getByRole("definition")).toHaveText(["09:00", "14:30", "5h 30m", "Added by hand"]);
  await expect(sheet).toContainText("Changed by Ana Admin");
  await expect(sheet).toContainText("Out 17:00 → 14:30");
  await expect(sheet).toContainText("“Left early for a school visit”");
});

test("an admin's rows name the employee and show no week totals for everyone together", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");

  await expect(page.getByRole("heading", { name: "All check-ins", level: 1 })).toBeVisible();
  await expect(week(page, /^This week/).getByRole("button").first()).toHaveText(/^Walter Worker.*Wed 4 Nov · 09:05 – now/);
  await expect(week(page, /^This week/).getByRole("button", { name: /18:00 – 17:00/ })).toContainText("Invalid");
  await expect(weekHeading(page, /^This week/)).toHaveText(/^This week · 2–8 Nov$/);
});

test("an admin sees every user and a read-only sheet for each", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/users");
  const users = page.getByRole("list", { name: "Users" });

  await expect(users.getByRole("button")).toHaveText([/^Ana Admin.*Admin/, /^Olga Other/, /^Walter Worker/]);
  await users.getByRole("button", { name: /Olga Other/ }).click();

  const sheet = page.getByRole("dialog", { name: "Olga Other" });
  await expect(sheet).toContainText("30h a week");
  await expect(sheet.getByRole("button")).toHaveText(["Done"]);
});
