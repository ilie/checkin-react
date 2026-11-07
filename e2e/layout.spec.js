import { expect, loginAs, phone, test } from "./support/test.js";

const meButton = (page) => page.getByRole("button", { name: "Me", exact: true });
const layoutChoice = (page, name) =>
  page.getByRole("radiogroup", { name: "Layout" }).getByRole("radio", { name, exact: true });

test("on desktop, Me switches between the toolbar and a sidebar, and the choice survives a reload", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAs(page, "admin@example.com");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("complementary")).toHaveCount(0);

  await meButton(page).click();
  await expect(layoutChoice(page, "Toolbar")).toBeChecked();
  await layoutChoice(page, "Sidebar").check({ force: true });
  await page.getByRole("button", { name: "Done" }).click();

  const sidebar = page.getByRole("complementary");
  await expect(sidebar.getByRole("navigation", { name: "Main" }).getByRole("link")).toHaveText([
    "Home",
    "Check-ins",
    "Users",
  ]);
  await expect(sidebar).toContainText("Ana Admin");
  await expect(page.getByRole("banner")).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("complementary")).toBeVisible();
  await sidebar.getByRole("link", { name: "Check-ins" }).click();
  await expect(page.getByRole("heading", { name: "All Checkins" })).toBeVisible();

  await meButton(page).click();
  await layoutChoice(page, "Toolbar").check({ force: true });
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("complementary")).toHaveCount(0);
});

test.describe("on a phone", () => {
  test.use(phone);

  test("Me has no layout choice, and a saved sidebar doesn't show", async ({ page }) => {
    await loginAs(page, "worker@example.com");
    await page.evaluate(() => localStorage.setItem("layout", "sidebar"));
    await page.reload();

    await expect(page.getByRole("complementary")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Tabs" })).toBeVisible();
    await page.getByRole("button", { name: "Me", exact: true }).click();
    await expect(page.getByRole("radiogroup", { name: "Appearance" })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Layout" })).toHaveCount(0);
  });
});
