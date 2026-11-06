import { expect, loginAs, phone, test } from "./support/test.js";

test.use(phone);

function todayCard(page) {
  return page.getByRole("region", { name: "Today" });
}

test("Walter, clocked in, sees his day, his week and the check-out he forgot", async ({ page }) => {
  await loginAs(page, "worker@example.com");

  await expect(page.getByRole("heading", { name: "Good morning, Walter" })).toBeVisible();
  await expect(page.getByText("Wednesday 4 November")).toBeVisible();
  await expect(page.getByText("Missing check-out on Fri 23 Oct (in at 09:00). Ask an admin to fix it.")).toBeVisible();
  await expect(todayCard(page)).toContainText("Clocked in since 09:05");
  await expect(todayCard(page)).toContainText("55m so far today");
  await expect(todayCard(page)).toContainText("16h 55m of 25h");
  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
});

test("Olga, not clocked in, sees her last check-out and no warning, until she clocks in", async ({ page }) => {
  await loginAs(page, "olga@example.com");

  await expect(todayCard(page)).toContainText("Not clocked in today");
  // Her later check-out on Tuesday is before its check-in, so it doesn't count.
  await expect(todayCard(page)).toContainText("Last check-out Tue 3 Nov at 15:30");
  await expect(todayCard(page)).toContainText("14h 00m of 30h");
  await expect(page.getByText("Missing check-out")).toHaveCount(0);

  await page.getByRole("button", { name: "Checkin" }).click();
  await expect(todayCard(page)).toContainText("Clocked in since 10:00");
});

test("an admin's own Home shows only their own day", async ({ page }) => {
  await loginAs(page, "admin@example.com");

  await expect(todayCard(page)).toContainText("Not clocked in today");
  await expect(todayCard(page)).toContainText("0m of 40h");
  await expect(page.getByText("Missing check-out")).toHaveCount(0);
});

for (const viewport of [{ width: 375, height: 667 }, { width: 440, height: 956 }]) {
  test(`nothing overlaps on a ${viewport.width}×${viewport.height} screen`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await loginAs(page, "worker@example.com");
    await expect(todayCard(page)).toContainText("16h 55m");

    const warning = await page.getByText("Missing check-out").boundingBox();
    const button = await page.getByRole("button", { name: "Checkout" }).boundingBox();
    const card = await todayCard(page).boundingBox();
    const tabs = await page.getByRole("navigation", { name: "Tabs" }).boundingBox();
    expect(warning.y + warning.height).toBeLessThanOrEqual(button.y);
    expect(button.y + button.height).toBeLessThanOrEqual(card.y);
    expect(card.y + card.height).toBeLessThanOrEqual(tabs.y);
    expect(tabs.y + tabs.height).toBeLessThanOrEqual(viewport.height);
    // The status bar shows the time on short screens, so the big clock goes.
    await expect(page.getByText("10:00", { exact: true })).toBeVisible({ visible: viewport.height >= 720 });
  });
}

// The status can arrive before the week's rows, which still show today's check-in open. That used to blank the page.
test("clocking out shows the time on the card", async ({ page }) => {
  await loginAs(page, "olga@example.com");
  await page.getByRole("button", { name: "Checkin" }).click();
  await expect(todayCard(page).getByText("Clocked in since 10:00")).toBeVisible();

  await page.getByRole("button", { name: "Checkout" }).click();

  await expect(todayCard(page).getByText("Clocked out at 10:00")).toBeVisible();
  await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
});
