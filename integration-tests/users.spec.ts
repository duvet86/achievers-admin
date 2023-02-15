import { test, expect } from "@playwright/test";

test.describe("when you ARE logged in", () => {
  test("Home page should have the correct title", async ({ page }) => {
    await page.goto("/");

    const table = page.locator("table.table");

    expect(await page.title()).toBe("Achievers WA");
    expect(table).toBeDefined();
  });
});
