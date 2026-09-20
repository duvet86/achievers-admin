import { test, expect } from "@playwright/test";

import { goToSidebarPage } from "../helpers";

test.describe("Admin permissions", () => {
  test("should display user permissions", async ({ page }) => {
    await goToSidebarPage(page, "Permissions");

    await expect(
      page.getByRole("heading", { name: "User permissions" }),
    ).toBeVisible();

    for (const name of ["#", "Name", "Email", "Permissions"]) {
      await expect(
        page.getByRole("columnheader", { name, exact: true }),
      ).toBeVisible();
    }

    // The users come from the Azure directory, so only check that the admins
    // have been listed with their permissions.
    await expect(page.getByText("No users")).not.toBeVisible();
    await expect(
      page.getByRole("cell", { name: /Admin/ }).first(),
    ).toBeVisible();
  });
});
