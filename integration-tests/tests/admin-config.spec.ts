import { test, expect } from "@playwright/test";

import { goToSidebarPage, waitForHydration } from "../helpers";

test.describe("Admin config", () => {
  test("should display config settings", async ({ page }) => {
    await goToSidebarPage(page, "Config");

    await expect(
      page.getByRole("heading", { name: "Configuration settings" }),
    ).toBeVisible();

    await expect(page.getByText("App version:")).toBeVisible();
    await expect(page.locator(".content-main")).toContainText(/\d+\.\d+\.\d+/);

    await expect(page.getByText("Email reminders enabled:")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View Police check" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "View WWC" })).toBeVisible();

    await expect(page.getByText("Mentor resources:")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Configure mentor resources" }),
    ).toBeVisible();
  });

  test("should display police check email reminders", async ({ page }) => {
    await goToSidebarPage(page, "Config");

    await page.getByRole("link", { name: "View Police check" }).click();
    await page.waitForURL(/email-reminders-police-check/);
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Police check email reminders" }),
    ).toBeVisible();

    for (const name of [
      "Full name",
      "Check expiry date",
      "Reminder sent at",
      "Action",
    ]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }
  });

  test("should display WWC email reminders", async ({ page }) => {
    await goToSidebarPage(page, "Config");

    await page.getByRole("link", { name: "View WWC" }).click();
    await page.waitForURL(/email-reminders-wwc/);
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "WWC email reminders" }),
    ).toBeVisible();

    for (const name of [
      "Full name",
      "Check expiry date",
      "Reminder sent at",
      "Action",
    ]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }
  });

  test("should display mentor resources", async ({ page }) => {
    await goToSidebarPage(page, "Config");

    await page
      .getByRole("link", { name: "Configure mentor resources" })
      .click();
    await page.waitForURL(/mentor-resources/);
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Configure mentor resources" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Drag and drop the table rows to reorder mentor resources.",
      ),
    ).toBeVisible();

    for (const name of ["Order", "Title", "Count Resources"]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }
  });
});
