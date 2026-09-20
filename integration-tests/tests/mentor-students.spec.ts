import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { goToMentorPage, setMentorClock, waitForHydration } from "../helpers";
import { seedDataAsync, seedGoalsAsync } from "../test-data";

const STUDENT = "student_0 student_lastname_0";

async function goToStudentLink(page: Page, link: string) {
  await goToMentorPage(page, "My Students");

  await page
    .getByRole("row", { name: STUDENT })
    .getByRole("link", { name: link, exact: true })
    .click();
  await waitForHydration(page);
}

async function typeInEditor(page: Page, text: string) {
  await page.locator('.lexical div[contenteditable="true"]').first().focus();
  await page.keyboard.type(text);
}

test.describe("Mentor students (read only)", () => {
  test.beforeAll(async () => {
    await seedDataAsync(true);
  });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
  });

  test("should display my students", async ({ page }) => {
    await goToMentorPage(page, "My Students");

    await expect(
      page.getByRole("heading", { name: "My students" }),
    ).toBeVisible();

    for (const name of ["#", "Full name", "Year Level", "Action"]) {
      await expect(
        page.getByRole("columnheader", { name, exact: true }),
      ).toBeVisible();
    }

    // test_0 is a mentor of student_0, student_1 and student_2.
    await expect(page.getByRole("row")).toHaveCount(4);

    for (const student of [
      "student_0 student_lastname_0",
      "student_1 student_lastname_1",
      "student_2 student_lastname_2",
    ]) {
      const row = page.getByRole("row", { name: student });

      await expect(row).toBeVisible();

      for (const link of [
        "Report to Admin",
        "Session Summaries",
        "School reports",
        "Goals",
      ]) {
        await expect(
          row.getByRole("link", { name: link, exact: true }),
        ).toBeVisible();
      }
    }
  });

  test("should display school reports of a student", async ({ page }) => {
    await goToStudentLink(page, "School reports");

    await expect(
      page.getByRole("heading", {
        name: `School reports for "${STUDENT}"`,
      }),
    ).toBeVisible();

    for (const name of ["#", "School term", "Name"]) {
      await expect(
        page.getByRole("columnheader", { name, exact: true }),
      ).toBeVisible();
    }

    await expect(page.getByText("No reports uploaded")).toBeVisible();
  });

  test("should report a student to the admin", async ({ page }) => {
    await goToStudentLink(page, "Report to Admin");

    await expect(
      page.getByRole("heading", { name: "Report to Admin" }),
    ).toBeVisible();
    await expect(page.getByText(`Student: ${STUDENT}`)).toBeVisible();

    await page.getByRole("textbox").fill("I am worried about this student");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Your report was sent to admin@achieversclubwa.org.au",
    );
  });

  test("should display the session summaries of a student", async ({
    page,
  }) => {
    await goToStudentLink(page, "Session Summaries");

    await page.waitForURL(/\/mentor\/view-reports\?studentId=\d+/);

    await expect(
      page.getByRole("heading", { name: "Session Summaries", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("No sessions available")).toBeVisible();
  });
});

// The goals list of a student cannot be opened, so the goals are reached
// through their own url.
async function goToNewGoal(page: Page) {
  await goToMentorPage(page, "My Students");

  const goalsUrl = await page
    .getByRole("row", { name: STUDENT })
    .getByRole("link", { name: "Goals", exact: true })
    .getAttribute("href");

  await page.goto(`${goalsUrl}/new`);
  await waitForHydration(page);

  await expect(
    page.getByRole("heading", { name: `Goal for "${STUDENT}"` }),
  ).toBeVisible();
}

async function saveGoal(page: Page, button: string) {
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/goals\/(new|\d+)/.test(response.url()),
    ),
    page.getByRole("button", { name: button, exact: true }).click(),
  ]);
}

test.describe("Mentor goals", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 90 * 1000 });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
    await seedDataAsync(true);
  });

  test("should create, edit and complete a goal", async ({ page }) => {
    await goToNewGoal(page);

    // A new goal cannot be completed yet.
    await expect(
      page.getByRole("button", { name: "Mark completed" }),
    ).toHaveCount(0);

    // Create.
    await page.getByLabel("Goal title").fill("Read one book");
    await page.getByLabel("To be completed on").fill("2025-01-31");
    await typeInEditor(page, "Read a whole book by the end of January");

    await saveGoal(page, "Save");
    await page.waitForURL(/\/goals\/\d+$/);
    await waitForHydration(page);

    await expect(page.getByLabel("Goal title")).toHaveValue("Read one book");
    await expect(page.getByLabel("To be completed on")).toHaveValue(
      "2025-01-31",
    );
    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Read a whole book by the end of January");

    // Edit.
    await page.getByLabel("Goal title").fill("Read two books");
    await saveGoal(page, "Save");

    await page.reload();
    await waitForHydration(page);

    await expect(page.getByLabel("Goal title")).toHaveValue("Read two books");

    // Complete.
    await saveGoal(page, "Mark completed");

    await expect(page.getByText("Goal completed")).toBeVisible();
    await expect(page.getByLabel("Goal title")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Mark completed" }),
    ).toHaveCount(0);
  });

  test("should not save a goal without a description", async ({ page }) => {
    await goToNewGoal(page);

    await page.getByLabel("Goal title").fill("Empty goal");
    await page.getByLabel("To be completed on").fill("2025-01-31");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page.getByText("Goal cannot be blank.")).toBeVisible();
    await expect(page).toHaveURL(/\/goals\/new/);
  });

  test("should keep the result of a goal", async ({ page }) => {
    await goToNewGoal(page);

    await page.getByLabel("Goal title").fill("Read one book");
    await page.getByLabel("To be completed on").fill("2025-01-31");
    await typeInEditor(page, "Read a whole book by the end of January");
    await page.getByLabel("Result").fill("Still reading");

    await saveGoal(page, "Save");
    await page.waitForURL(/\/goals\/\d+$/);

    // The form keeps what has been typed, read what has been saved.
    await page.reload();
    await waitForHydration(page);

    await expect(page.getByLabel("Result")).toHaveValue("Still reading");
  });

  test("should display the goals of a student", async ({ page }) => {
    await seedGoalsAsync();
    await goToStudentLink(page, "Goals");

    await expect(
      page.getByRole("heading", { name: `Goals for "${STUDENT}"` }),
    ).toBeVisible();

    const goalRow = page.getByRole("row", { name: "Read one book" });

    await expect(goalRow).toContainText("2024-12-01");
    await expect(goalRow.getByRole("link", { name: "Edit" })).toBeVisible();
  });
});
