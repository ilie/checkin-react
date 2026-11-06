import { apiUrl } from "./support/api.js";
import { expect, loginAs, phone, test, toasts } from "./support/test.js";

test("an admin logs in, sees the admin menu and logs out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();

  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("Password1");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
});

test("a wrong password shows an error and doesn't log in", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("worker@example.com");
  await page.getByLabel("Password").fill("Wrong-password1");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Invalid credentials")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
});

test("an expired session goes back to the login page", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.setItem("token", "1|revoked-token");
    localStorage.setItem("isAdmin", "1");
  });
  await page.goto("/checkins");

  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
});

test("the login form explains what's wrong and only enables Login when it's valid", async ({ page }) => {
  await page.goto("/login");
  const login = page.getByRole("button", { name: "Login" });
  await expect(login).toBeDisabled();

  await page.getByLabel("Email").fill("worker@");
  await page.getByLabel("Email").blur();
  await expect(page.getByText("Please enter a valid email")).toBeVisible();

  await page.getByLabel("Email").fill("worker@example.com");
  await page.getByLabel("Password").fill("Password1");
  await expect(page.getByText("Please enter a valid email")).toBeHidden();
  await expect(login).toBeEnabled();
});

test("logging in while the API is down says so", async ({ page }) => {
  await page.route(`${apiUrl}/login`, (route) => route.abort("connectionrefused"));
  await page.goto("/login");
  await page.getByLabel("Email").fill("worker@example.com");
  await page.getByLabel("Password").fill("Password1");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(toasts(page).filter({ hasText: "Network Error" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
});

test("the forgot-password form checks the email", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill("worker");
  await page.getByLabel("Email").blur();

  await expect(page.getByText("Please enter a valid email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
});

test("the reset-password form checks the new password", async ({ page }) => {
  await page.goto("/reset-password?token=abc");
  await page.getByLabel("Email").fill("worker@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password1");
  await page.getByLabel("Password", { exact: true }).blur();
  await expect(page.getByText("Password needs a capital letter, a lowercase letter and a number")).toBeVisible();

  await page.getByLabel("Password", { exact: true }).fill("Password1");
  await page.getByLabel("Confirm").fill("Password2");
  await page.getByLabel("Confirm").blur();
  await expect(page.getByText("Passwords do not match")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();

  await page.getByLabel("Confirm").fill("Password1");
  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
});

test.describe("on a phone", () => {
  test.use(phone);

  test("signs in from a grouped list with a large title and no logo", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "Checkin App" })).toBeHidden();

    await page.getByLabel("Email").fill("worker@example.com");
    await page.getByLabel("Password").fill("Password1");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("button", { name: "Me", exact: true })).toBeVisible();
  });

  test("the forgot-password form shows its error in the row", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot your password?" }).click();
    await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();

    await page.getByLabel("Email").fill("worker");
    await page.getByLabel("Email").blur();
    await expect(page.getByLabel("Email")).toHaveAccessibleDescription("Please enter a valid email");
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  test("the reset-password form shows its errors", async ({ page }) => {
    await page.goto("/reset-password?token=abc");
    await expect(page.getByRole("heading", { name: "Reset password" })).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill("password1");
    await page.getByLabel("Password", { exact: true }).blur();
    await expect(page.getByText("Password needs a capital letter, a lowercase letter and a number")).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByLabel("Confirm").fill("Password2");
    await page.getByLabel("Confirm").blur();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});

test("a session the old app saved keeps its admin rights", async ({ page }) => {
  // The old app stored the API's boolean as "true" or "false".
  for (const [email, saved, isAdmin] of [["admin@example.com", "true", true], ["worker@example.com", "false", false]]) {
    await loginAs(page, email);
    await page.evaluate((saved) => localStorage.setItem("isAdmin", saved), saved);
    await page.reload();

    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toHaveCount(isAdmin ? 1 : 0);
  }
});
