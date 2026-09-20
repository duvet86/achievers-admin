import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { goToSidebarPage, selectSearchOption } from "../helpers";
import { CHAPTER_DATA, seedDataAsync, seedGoalsAsync } from "../test-data";

const MENTOR = "test_0 user_0";

const OPEN_GOAL = {
  title: "Read one book",
  student: "student_0 student_lastname_0",
  endDate: "December 1, 2024",
};
const ACHIEVED_GOAL = {
  title: "Learn the times tables",
  student: "student_1 student_lastname_1",
  endDate: "November 15, 2024",
};

// There is no "all chapters" option, the list starts with the first chapter.
async function goToGoals(page: Page) {
  await goToSidebarPage(page, "Goals");

  await page
    .getByLabel("Select a Chapter")
    .selectOption({ label: "Girrawheen" });
  await expect(page.getByRole("row", { name: OPEN_GOAL.title })).toBeVisible();
}

test.describe("Admin goals", () => {
  test.beforeAll(async () => {
    await seedDataAsync();
    await seedGoalsAsync();
  });

  test("should display list of goals", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToGoals(page);

    await expect(
      page.getByRole("heading", { name: "Goals", exact: true }),
    ).toBeVisible();

    for (const name of [
      "Title",
      "Chapter",
      "Student",
      "Mentor",
      "End date",
      "Is completed",
      "Action",
    ]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }

    await expect(rows).toHaveCount(3);

    const openRow = page.getByRole("row", { name: OPEN_GOAL.title });

    await expect(openRow).toContainText("Girrawheen");
    await expect(openRow).toContainText(OPEN_GOAL.student);
    await expect(openRow).toContainText(MENTOR);
    await expect(openRow).toContainText(OPEN_GOAL.endDate);
    await expect(openRow.getByRole("link", { name: "View" })).toBeVisible();

    const achievedRow = page.getByRole("row", { name: ACHIEVED_GOAL.title });

    await expect(achievedRow).toContainText(ACHIEVED_GOAL.student);
    await expect(achievedRow).toContainText(ACHIEVED_GOAL.endDate);
  });

  test("should filter goals", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToSidebarPage(page, "Goals");

    await expect(page.getByLabel("Select a Chapter")).toHaveValue(
      CHAPTER_DATA.Armadale,
    );
    await expect(page.getByText("No goals available")).toBeVisible();

    await page
      .getByLabel("Select a Chapter")
      .selectOption({ label: "Girrawheen" });

    await expect(rows).toHaveCount(3);

    // Only the goals of the selected student.
    await selectSearchOption(page, "Student", ACHIEVED_GOAL.student);

    await expect(rows).toHaveCount(2);
    await expect(
      page.getByRole("row", { name: ACHIEVED_GOAL.title }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(page.getByText("No goals available")).toBeVisible();
  });

  test("should display an open goal", async ({ page }) => {
    await goToGoals(page);

    await page
      .getByRole("row", { name: OPEN_GOAL.title })
      .getByRole("link", { name: "View" })
      .click();
    await page.waitForURL(/\/admin\/goals\/\d+/);

    await expect(
      page.getByRole("heading", { name: `Goal for "${OPEN_GOAL.student}"` }),
    ).toBeVisible();

    const details = page.locator(".content-main");

    await expect(details).toContainText(OPEN_GOAL.title);
    await expect(details).toContainText("1 December 2024");
    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Hello this is my first report!");

    await expect(page.getByText("Goal completed")).not.toBeVisible();
  });

  test("should display an achieved goal", async ({ page }) => {
    await goToGoals(page);

    await page
      .getByRole("row", { name: ACHIEVED_GOAL.title })
      .getByRole("link", { name: "View" })
      .click();
    await page.waitForURL(/\/admin\/goals\/\d+/);

    await expect(
      page.getByRole("heading", {
        name: `Goal for "${ACHIEVED_GOAL.student}"`,
      }),
    ).toBeVisible();

    await expect(page.getByText("Goal completed")).toBeVisible();
    await expect(page.getByLabel("Result")).toHaveValue("All done, well done!");
  });
});
