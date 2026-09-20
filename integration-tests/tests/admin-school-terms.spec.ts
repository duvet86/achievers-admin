import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { goToSidebarPage, waitForHydration } from "../helpers";
import { deleteSchoolTermsAsync } from "../test-data";

// School terms of 2024 come from the database seed.
const TERMS_2024 = [
  { start: "2024-01-31", end: "2024-03-28" },
  { start: "2024-04-15", end: "2024-06-28" },
  { start: "2024-07-15", end: "2024-09-20" },
  { start: "2024-10-07", end: "2024-12-12" },
];

// A year that is not used by any other test.
const NEW_YEAR = 2031;
const NEW_TERMS = [
  { start: "2031-01-30", end: "2031-03-28" },
  { start: "2031-04-14", end: "2031-06-27" },
  { start: "2031-07-14", end: "2031-09-19" },
  { start: "2031-10-06", end: "2031-12-12" },
];

async function fillTerms(page: Page, terms: { start: string; end: string }[]) {
  for (const [index, { start, end }] of terms.entries()) {
    await page.locator(`#startDate${index}`).fill(start);
    await page.locator(`#endDate${index}`).fill(end);
  }
}

async function expectTerms(
  page: Page,
  terms: { start: string; end: string }[],
) {
  for (const [index, { start, end }] of terms.entries()) {
    await expect(
      page.getByRole("heading", { name: `Term ${index + 1}` }),
    ).toBeVisible();
    await expect(page.locator(`#startDate${index}`)).toHaveValue(start);
    await expect(page.locator(`#endDate${index}`)).toHaveValue(end);
  }
}

// The report error modal of the layout has a message container too.
function getMessage(page: Page) {
  return page.getByTestId("container").getByTestId("message");
}

async function save(page: Page) {
  await page.getByRole("button", { name: "Save" }).click();
}

test.describe("Admin school terms", () => {
  test("should display school terms", async ({ page }) => {
    await goToSidebarPage(page, "School Terms");

    await expect(
      page.getByRole("heading", { name: "School terms" }),
    ).toBeVisible();

    const yearSelect = page.getByLabel("Select a year");

    await expect(yearSelect).toHaveValue("2024");
    await expect(
      yearSelect.getByRole("option", { name: "2024 - current" }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Add new term" }),
    ).toBeVisible();

    await expectTerms(page, TERMS_2024);
  });

  test("should not save terms with wrong dates", async ({ page }) => {
    await goToSidebarPage(page, "School Terms");

    // Dates in different years.
    await page.locator("#endDate0").fill("2025-03-28");
    await save(page);

    await expect(getMessage(page)).toContainText("Dates have different years");

    // End date before start date.
    await page.reload();
    await waitForHydration(page);

    await page.locator("#endDate0").fill("2024-01-01");
    await save(page);

    await expect(getMessage(page)).toContainText(
      "End date before start date or overlapping terms",
    );

    // Nothing has been saved.
    await page.reload();
    await waitForHydration(page);

    await expectTerms(page, TERMS_2024);
  });

  test("should edit school terms", async ({ page }) => {
    await goToSidebarPage(page, "School Terms");

    // Terms are not part of the seed data, always put them back.
    try {
      await page.locator("#endDate0").fill("2024-03-27");
      await save(page);

      await expect(getMessage(page)).toContainText("Success");

      await page.reload();
      await waitForHydration(page);

      await expectTerms(page, [
        { start: "2024-01-31", end: "2024-03-27" },
        ...TERMS_2024.slice(1),
      ]);
    } finally {
      await page.goto("/admin/school-terms");
      await waitForHydration(page);

      await fillTerms(page, TERMS_2024);
      await save(page);

      await expect(getMessage(page)).toContainText("Success");
    }

    await page.reload();
    await waitForHydration(page);

    await expectTerms(page, TERMS_2024);
  });

  test("should not add terms of an existing year", async ({ page }) => {
    await goToSidebarPage(page, "School Terms");

    await page.getByRole("link", { name: "Add new term" }).click();
    await page.waitForURL(/\/admin\/school-terms\/new/);
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Add new school term" }),
    ).toBeVisible();

    await fillTerms(page, TERMS_2024);
    await save(page);

    await expect(getMessage(page)).toContainText("Year 2024 already exists");
  });

  test("should add terms of a new year", async ({ page }) => {
    await deleteSchoolTermsAsync(NEW_YEAR);

    try {
      await goToSidebarPage(page, "School Terms");

      await page.getByRole("link", { name: "Add new term" }).click();
      await page.waitForURL(/\/admin\/school-terms\/new/);
      await waitForHydration(page);

      await fillTerms(page, NEW_TERMS);
      await save(page);

      await expect(getMessage(page)).toContainText("Terms added successfully");

      await page.goto("/admin/school-terms");
      await waitForHydration(page);

      await page
        .getByLabel("Select a year")
        .selectOption({ label: `${NEW_YEAR}` });
      await page.waitForURL(new RegExp(`/admin/school-terms/${NEW_YEAR}`));
      await waitForHydration(page);

      await expectTerms(page, NEW_TERMS);
    } finally {
      await deleteSchoolTermsAsync(NEW_YEAR);
    }
  });
});
