import { expect, loginAs, openMe, phone, test } from "./support/test.js";

test.use(phone);

function tabs(page) {
  return page.getByRole("navigation", { name: "Tabs" }).getByRole("listitem");
}

test("a worker's tab bar has Home, Check-ins and Me, and an admin's adds Users", async ({ page }) => {
  await loginAs(page, "worker@example.com");
  await expect(tabs(page)).toHaveText(["Home", "Check-ins", "Me"]);
  // The burger menu and the logo bar are gone on phones.
  await expect(page.getByRole("button", { name: "Menu" })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Checkin" })).toBeHidden();

  await loginAs(page, "admin@example.com");
  await expect(tabs(page)).toHaveText(["Home", "Check-ins", "Users", "Me"]);
});

test("Me shows who is signed in", async ({ page }) => {
  await loginAs(page, "worker@example.com");
  const sheet = await openMe(page);

  await expect(sheet.getByText("Walter Worker")).toBeVisible();
  await expect(sheet.getByText("worker@example.com")).toBeVisible();
});

test("Dark appearance applies at once and survives a reload", async ({ page }) => {
  await loginAs(page, "worker@example.com");
  await openMe(page);
  const appearance = page.getByRole("radiogroup", { name: "Appearance" });
  await expect(appearance.getByRole("radio", { name: "System" })).toBeChecked();

  // The radios are hidden behind their segment labels, which take the tap.
  await appearance.getByText("Dark").click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await openMe(page);
  await expect(appearance.getByRole("radio", { name: "Dark" })).toBeChecked();
});

test("Sign out goes to the login page and forgets the profile", async ({ page }) => {
  await loginAs(page, "worker@example.com");
  await openMe(page);
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("user"))).toBeNull();
});

test("Sign out works offline too, so the next person on the phone isn't signed in as the last", async ({ page, context }) => {
  await loginAs(page, "worker@example.com");
  await openMe(page);
  await context.setOffline(true);
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
});
