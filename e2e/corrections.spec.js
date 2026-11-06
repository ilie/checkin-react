import { checkinRows, expect, expectTotal, loginAs, test } from "./support/test.js";

// The form helpers are the only place that knows how the date and time fields are filled in,
// so the native inputs of plan task 9 only change them.
async function fillDate(page, isoDate) {
  await page.getByLabel("Checkin Date").fill(isoDate);
}

async function fillTime(page, label, time) {
  await page.getByLabel(label).fill(time);
}

function saveButton(page) {
  return page.getByRole("button", { name: "Save" });
}

test.beforeEach(async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");
  await expectTotal(page, 17);
});

test("adding a check-in needs a reason", async ({ page }) => {
  await page.getByRole("button", { name: "New" }).click();
  await page.getByLabel("Select a user").selectOption({ label: "Olga Other" });
  await fillDate(page, "2026-10-21");
  await fillTime(page, "Checkin Time", "09:00:00");
  await fillTime(page, "Checkout Time", "13:00:00");
  await expect(saveButton(page)).toBeDisabled();

  await page.getByLabel("Reason").fill("Paper sign-in sheet from the school visit");
  await expect(saveButton(page)).toBeEnabled();
  await saveButton(page).click();

  await expect(page.getByText("Checkin added successfully")).toBeVisible();
  await expectTotal(page, 18);
  await page.getByLabel("From").fill("2026-10-21");
  await page.getByLabel("To").fill("2026-10-21");
  await expectTotal(page, 1);
  await expect(checkinRows(page).first()).toContainText("Olga Other");
  await expect(checkinRows(page).first()).toContainText("Manual");
});

test("the check-in form says what's missing", async ({ page }) => {
  await page.getByRole("button", { name: "New" }).click();
  await page.getByLabel("Select a user").focus();
  await page.getByLabel("Select a user").blur();
  await expect(page.getByText("Please select a user", { exact: true })).toBeVisible();

  await page.getByLabel("Reason").fill("   ");
  await page.getByLabel("Reason").blur();
  await expect(page.getByText("Please explain why this check-in is added or changed")).toBeVisible();
  await expect(saveButton(page)).toBeDisabled();
});

test("editing a check-in needs a reason, which the history shows", async ({ page }) => {
  await checkinRows(page).filter({ hasText: "Walter Worker" }).filter({ hasText: "26/10/2026" }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await fillTime(page, "Checkout Time", "16:00:00");
  await expect(saveButton(page)).toBeDisabled();

  await page.getByLabel("Reason").fill("Teacher meeting ended early");
  await saveButton(page).click();
  await expect(page.getByText("Checkin modified successfully!")).toBeVisible();

  const row = checkinRows(page).filter({ hasText: "Walter Worker" }).filter({ hasText: "26/10/2026" });
  await expect(row).toContainText("16:00:00");
  await expect(row).toContainText("Edited ×1");

  await row.click();
  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByRole("heading", { name: "Change history" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Teacher meeting ended early" })).toBeVisible();
});

test("deleting a check-in needs a reason and keeps it, locked, under Show deleted", async ({ page }) => {
  const row = checkinRows(page).filter({ hasText: "Olga Other" }).filter({ hasText: "02/11/2026" });
  await row.click();

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Remove" }).click();
  await expectTotal(page, 17);

  page.once("dialog", (dialog) => dialog.accept("Recorded twice by mistake"));
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Checkin deleted!")).toBeVisible();
  await expectTotal(page, 16);

  await page.getByLabel("Show deleted").check();
  await row.click();
  await expect(row).toContainText("Deleted");
  await expect(page.getByRole("button", { name: "Remove" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Edit" })).toBeDisabled();
});

test("the history shows who changed a check-in and why", async ({ page }) => {
  await checkinRows(page).filter({ hasText: "Walter Worker" }).filter({ hasText: "27/10/2026" }).click();
  await page.getByRole("button", { name: "History" }).click();

  await expect(page.getByRole("cell", { name: "Left early for a school visit" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Changed" })).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("heading", { name: "Change history" })).toBeHidden();
});
