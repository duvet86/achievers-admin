import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { expectFields, fillFields, goToSidebarPage } from "../helpers";
import { CHAPTER_DATA, seedDataAsync, seedStudentEoiAsync } from "../test-data";

const EOI_STUDENT = "Eoi Student";

async function seedAsync() {
  await seedDataAsync();
  await seedStudentEoiAsync();
}

async function goToEois(page: Page) {
  await goToSidebarPage(page, "Students");

  await page.getByTitle("actions").click();
  await page.getByRole("link", { name: "EOIs" }).click();
  await page.waitForURL(/\/admin\/students\/eois$/);
}

async function goToEoi(page: Page) {
  await goToEois(page);

  await page.getByRole("row", { name: EOI_STUDENT }).click();
  await page.waitForURL(/\/admin\/students\/eois\/\d+/);

  await expect(
    page.getByRole("heading", { name: "Student Expression Of Interest" }),
  ).toBeVisible();
}

test.describe("Admin students expressions of interest (read only)", () => {
  test.beforeAll(async () => {
    await seedAsync();
  });

  test("should display list of expressions of interest", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToEois(page);

    await expect(
      page.getByRole("heading", { name: "Student Expression of Interests" }),
    ).toBeVisible();

    for (const name of [
      "Full name",
      "Year Level",
      "Preferred chapter",
      "Action",
    ]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }

    await expect(rows).toHaveCount(2);

    const row = page.getByRole("row", { name: EOI_STUDENT });

    await expect(row).toContainText("Girrawheen");
    await expect(row).toContainText("5");

    // Search and filters.
    await page.getByPlaceholder("Search").fill("nobody");
    await page.keyboard.press("Enter");

    await expect(page.getByText("No students")).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();

    await expect(row).toBeVisible();

    await page.getByLabel("Chapters").selectOption({ label: "Butler" });

    await expect(page.getByText("No students")).toBeVisible();

    await page.getByLabel("Chapters").selectOption({ label: "Girrawheen" });

    await expect(row).toBeVisible();
  });

  test("should display an expression of interest", async ({ page }) => {
    await goToEoi(page);

    await expectFields(
      page,
      {
        "First name": "Eoi",
        "Preferred Name": "Eoi pref",
        "Last name": "Student",
        Email: "eoi@test.com",
        Mobile: "0400111222",
        Address: "1 Eoi street",
        "Dietary Requirements": "None",
        "Other Languages Spoken": "Italian",
        "Best Person To Contact": "Mum",
        "Best Person To Contact For Emergency": "Dad",
        "Favourite School Subject": "Maths",
        "Least Favourite School Subject": "Art",
        "Reason for Support": "Needs help with reading",
        "Other Support": "None",
        "Already In Achievers": "No",
        "Heard About Us": "A friend",
      },
      { exact: true },
    );

    await expect(page.getByLabel("Chapter", { exact: true })).toHaveValue(
      CHAPTER_DATA.Girrawheen,
    );

    await expect(
      page.getByRole("link", { name: "Promote student" }),
    ).toBeVisible();
    await expect(
      page.getByText("This student is already part of the Achievers!"),
    ).not.toBeVisible();

    await expect(
      page.getByRole("row", { name: /Eoi Guardian mother/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Eoi Teacher Eoi school/ }),
    ).toBeVisible();
  });
});

test.describe("Admin students expressions of interest (edit)", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 60 * 1000 });

  test.beforeEach(async () => {
    await seedAsync();
  });

  test("should edit an expression of interest", async ({ page }) => {
    await goToEoi(page);

    const updatedValues = {
      "First name": "Updated",
      Address: "2 Updated street",
      "Reason for Support": "Updated reason",
    };

    await fillFields(page, updatedValues, { exact: true });
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "updated successfully",
    );

    await page.reload();

    await expectFields(page, updatedValues, { exact: true });
  });

  test("should promote an expression of interest to a student", async ({
    page,
  }) => {
    await goToEoi(page);

    await page.getByRole("link", { name: "Promote student" }).click();
    await page.waitForURL(/promote/);

    await expect(
      page.getByRole("heading", { name: `Promote student "${EOI_STUDENT}"` }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Promote" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Student EOI updated successfully",
    );

    // Promoted expressions of interest are hidden unless requested.
    await goToEois(page);

    await expect(page.getByText("No students")).toBeVisible();

    await page.getByLabel("Include approved students").check();

    await page.getByRole("row", { name: EOI_STUDENT }).click();
    await page.waitForURL(/\/admin\/students\/eois\/\d+/);

    await expect(
      page.getByText("This student is already part of the Achievers!"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Promote student" }),
    ).toHaveCount(0);

    // The student is now part of the students.
    await goToSidebarPage(page, "Students");

    await page.getByPlaceholder("Search").fill("Eoi");
    await page.keyboard.press("Enter");

    // The preferred name is part of the full name of a student.
    await expect(
      page
        .getByRole("row", { name: "Eoi (Eoi pref) Student" })
        .getByRole("cell", { name: "Girrawheen" }),
    ).toBeVisible();
  });
});
