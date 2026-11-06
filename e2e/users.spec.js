import { expect, loginAs, test } from "./support/test.js";

function usersTable(page) {
  return page.getByRole("table", { name: "Users" });
}

test("an admin adds and edits a user, with no social security number anywhere", async ({ page }) => {
  const registrations = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/users/register")) registrations.push(request.postDataJSON());
  });

  await loginAs(page, "admin@example.com", "/users");
  await expect(usersTable(page).getByRole("columnheader")).toHaveText(["Name", "NIF", "Email", "Contract", "Admin"]);

  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByLabel(/social/i)).toHaveCount(0);
  await page.getByLabel("Name").fill("Nadia New");
  await page.getByLabel("NIF").fill("12345678Z");
  await page.getByLabel("Email").fill("nadia@example.com");
  await page.getByLabel(/hours/i).fill("30");
  await page.getByLabel("User is admin").selectOption("0");
  await passwordField(page).fill("Password1!");
  await page.getByLabel(/Password confirmation/).fill("Password1!");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(usersTable(page).getByRole("row").filter({ hasText: "Nadia New" })).toBeVisible();
  expect(registrations).toHaveLength(1);
  expect(Object.keys(registrations[0]).some((key) => key.includes("social"))).toBe(false);

  await usersTable(page).getByRole("row").filter({ hasText: "Nadia New" }).click();
  await page.getByRole("button", { name: "Modify" }).click();
  await page.getByLabel(/hours/i).fill("25");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(usersTable(page).getByRole("row").filter({ hasText: "Nadia New" })).toContainText("25 h");
});

// The label's hidden "*" keeps getByLabel from matching "Password" exactly; the accessible name is just "Password".
function passwordField(page) {
  return page.getByRole("textbox", { name: "Password", exact: true });
}

async function openAddForm(page) {
  await page.getByRole("button", { name: "Add" }).click();
}

async function blurAfterFilling(page, label, value) {
  await page.getByLabel(label).fill(value);
  await page.getByLabel(label).blur();
}

test("the user form explains each mistake and keeps Save disabled", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/users");
  await openAddForm(page);
  const save = page.getByRole("button", { name: "Save" });
  await expect(save).toBeDisabled();

  await blurAfterFilling(page, "Name", " ");
  await expect(page.getByText("Name is required")).toBeVisible();
  await blurAfterFilling(page, "NIF", "1234");
  await expect(page.getByText("NIF must be exactly 9 characters")).toBeVisible();
  await blurAfterFilling(page, /hours/i, "41");
  await expect(page.getByText("Hours must be between 1 and 40")).toBeVisible();
  await passwordField(page).fill("short");
  await passwordField(page).blur();
  await expect(page.getByText("Password must be at least 8 characters long")).toBeVisible();
  await blurAfterFilling(page, /Password confirmation/, "other");
  await expect(page.getByText("Passwords do not match")).toBeVisible();
  await blurAfterFilling(page, "Email", "admin@example.com");
  await expect(page.getByText("This email has already been taken")).toBeVisible();
  await expect(save).toBeDisabled();
});

test("an email with a plus counts as taken once a user has it", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/users");
  await openAddForm(page);
  await page.getByLabel("Name").fill("Pablo Plus");
  await page.getByLabel("NIF").fill("87654321X");
  await page.getByLabel("Email").fill("pablo+work@example.com");
  await page.getByLabel(/hours/i).fill("20");
  await page.getByLabel("User is admin").selectOption("0");
  await passwordField(page).fill("Password1");
  await page.getByLabel(/Password confirmation/).fill("Password1");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(usersTable(page).getByRole("row").filter({ hasText: "Pablo Plus" })).toBeVisible();

  await openAddForm(page);
  await blurAfterFilling(page, "Email", "pablo+work@example.com");

  await expect(page.getByText("This email has already been taken")).toBeVisible();
});

test("deleting a user asks first", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/users");
  const olga = usersTable(page).getByRole("row").filter({ hasText: "Olga Other" });
  await olga.click();
  const questions = [];

  page.once("dialog", (dialog) => questions.push(dialog.message()) && dialog.dismiss());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(olga).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(olga).toHaveCount(0);
  expect(questions).toEqual(["Delete Olga Other? They'll be signed out straight away."]);
});
