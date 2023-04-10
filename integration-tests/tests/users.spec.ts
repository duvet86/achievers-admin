/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

import { createUserAsync } from "../dbData";

test.describe("when you ARE logged in", () => {
  test.beforeAll(async () => {
    await createUserAsync();
  });

  test("should display table with users table", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);
    await expect(page.getByRole("row")).toHaveCount(2);

    // Table headings
    await expect(page.getByRole("cell", { name: "FULL NAME" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "EMAIL" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "ASSIGNED CHAPTER" })
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "ACTION" })).toBeVisible();

    // Table row
    await expect(page.getByRole("cell", { name: "test user" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test@test.com" })
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Girrawheen" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "EDIT" })).toBeVisible();

    await expect(page.getByRole("link", { name: "EDIT" })).toBeVisible();

    page.getByRole("link", { name: "Import users from file" }).click();
  });
});
