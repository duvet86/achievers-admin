import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.locator("input[type='email']").fill(process.env.TEST_USERNAME!);
  await page.locator("input[type='submit']").click();

  await page.getByPlaceholder("Password").fill(process.env.TEST_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await page.getByRole("button", { name: "No" }).click();

  await page.waitForURL("http://localhost:3000/admin/home");

  await page.context().storageState({ path: "storageState.json" });
});
