import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { goToMentorPage, selectSearchOption, setMentorClock } from "../helpers";
import {
  seedDataAsync,
  seedSessionsForAdminAsync,
  seedSessionsOfStudentAsync,
} from "../test-data";

// seedDataAsync(true) renames the mentor test_0.
const MENTOR = "Luca Mara";

const OUTSTANDING_SESSION = {
  student: "student_0 student_lastname_0",
  attendedOn: "November 23, 2024",
};
const TO_SIGN_OFF_SESSION = {
  student: "student_1 student_lastname_1",
  attendedOn: "November 16, 2024",
  completedOn: "November 17, 2024",
};
const SIGNED_OFF_SESSION = {
  student: "student_2 student_lastname_2",
  attendedOn: "November 9, 2024",
  completedOn: "November 10, 2024",
  signedOffOn: "November 12, 2024",
};

async function seedAsync() {
  await seedDataAsync(true);
  await seedSessionsForAdminAsync();
}

async function typeInEditor(page: Page, text: string) {
  await page.locator('.lexical div[contenteditable="true"]').first().focus();
  await page.keyboard.type(text);
}

test.describe("Mentor session summaries (read only)", () => {
  test.beforeAll(async () => {
    await seedAsync();
  });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
  });

  test("should display list of session summaries", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToMentorPage(page, "View Session Summaries");

    await expect(
      page.getByRole("heading", { name: "Session Summaries", exact: true }),
    ).toBeVisible();

    for (const name of [
      "Mentor",
      "Student",
      "Session of",
      "Completed on",
      "Signed off on",
      "Action",
    ]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }

    // Only the sessions with a submitted report are listed.
    await expect(rows).toHaveCount(3);
    await expect(
      page.getByRole("row", { name: OUTSTANDING_SESSION.student }),
    ).toHaveCount(0);

    const toSignOffRow = page.getByRole("row", {
      name: TO_SIGN_OFF_SESSION.student,
    });

    await expect(toSignOffRow).toContainText(`${MENTOR} (Me)`);
    await expect(
      toSignOffRow.getByRole("link", { name: "View report" }),
    ).toBeVisible();
    await expect(toSignOffRow).toContainText(TO_SIGN_OFF_SESSION.attendedOn);
    await expect(toSignOffRow).toContainText(TO_SIGN_OFF_SESSION.completedOn);

    await expect(
      page.getByRole("row", { name: SIGNED_OFF_SESSION.student }),
    ).toContainText(SIGNED_OFF_SESSION.signedOffOn);
  });

  test("should filter session summaries by student", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToMentorPage(page, "View Session Summaries");

    await expect(rows).toHaveCount(3);

    // The students of the mentor are marked as assigned.
    await selectSearchOption(
      page,
      "Student",
      `** ${TO_SIGN_OFF_SESSION.student} (Assigned) **`,
    );

    await expect(rows).toHaveCount(2);
    await expect(
      page.getByRole("row", { name: TO_SIGN_OFF_SESSION.student }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(rows).toHaveCount(3);
  });

  test("should display a report", async ({ page }) => {
    await goToMentorPage(page, "View Session Summaries");

    await page
      .getByRole("row", { name: TO_SIGN_OFF_SESSION.student })
      .getByRole("link", { name: "View report" })
      .click();
    await page.waitForURL(/\/mentor\/view-reports\/\d+/);

    await expect(
      page.getByRole("heading", { name: 'Report of "16/11/2024"' }),
    ).toBeVisible();
    await expect(
      page.getByText(TO_SIGN_OFF_SESSION.student, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(MENTOR, { exact: true })).toBeVisible();
    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Hello this is my first report!");

    await expect(page.getByRole("heading", { name: "Feedback" })).toBeVisible();
    await expect(page.getByText("Signed by:")).not.toBeVisible();

    // Browsing is between the sessions of the same student.
    await expect(page.getByRole("link", { name: "Previous" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Next" })).toHaveCount(0);
  });
});

test.describe("Mentor session summaries of a student", () => {
  test.beforeAll(async () => {
    await seedDataAsync(true);
    await seedSessionsOfStudentAsync();
  });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
  });

  test("should browse the reports of a student", async ({ page }) => {
    await goToMentorPage(page, "View Session Summaries");

    await page
      .getByRole("row", { name: /November 9, 2024/ })
      .getByRole("link", { name: "View report" })
      .click();
    await page.waitForURL(/\/mentor\/view-reports\/\d+/);

    await expect(
      page.getByRole("heading", { name: 'Report of "09/11/2024"' }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Previous" }).click();

    await expect(
      page.getByRole("heading", { name: 'Report of "02/11/2024"' }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous" })).toHaveCount(0);

    await page.getByRole("link", { name: "Next" }).click();
    await page.getByRole("link", { name: "Next" }).click();

    await expect(
      page.getByRole("heading", { name: 'Report of "16/11/2024"' }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Next" })).toHaveCount(0);
  });
});

test.describe("Mentor sessions (edit)", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 90 * 1000 });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
    await seedAsync();
  });

  test("should mark a student absent", async ({ page }) => {
    await goToMentorPage(page, "Home");

    const sessionRow = page.getByTestId("sessions").getByRole("row", {
      name: OUTSTANDING_SESSION.student,
    });

    await sessionRow.getByRole("link", { name: "Mark student absent" }).click();
    await page.waitForURL(/\/student-absent/);

    await expect(
      page.getByRole("heading", {
        name: `Mark "${OUTSTANDING_SESSION.student}" as absent for the "${OUTSTANDING_SESSION.attendedOn}"`,
      }),
    ).toBeVisible();

    await page
      .getByRole("combobox")
      .selectOption({ label: "Absent WITH notice" });
    await typeInEditor(page, "The student was sick");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Student mark as absent successfully",
    );

    // Marking a student absent completes the session, so the home page has
    // nothing left to do for it.
    await goToMentorPage(page, "Home");

    const homeRow = page
      .getByTestId("sessions")
      .getByRole("row", { name: OUTSTANDING_SESSION.student });

    await expect(homeRow).toBeVisible();
    await expect(
      homeRow.getByRole("link", { name: "Mark student absent" }),
    ).toHaveCount(0);

    // The absence is listed with the session summaries.
    await goToMentorPage(page, "View Session Summaries");

    const absentRow = page.getByRole("row", {
      name: OUTSTANDING_SESSION.student,
    });

    await expect(absentRow).toContainText("(ABSENT)");

    await absentRow.getByRole("link", { name: "View report" }).click();
    await page.waitForURL(/\/mentor\/view-reports\/\d+/);

    await expect(page.getByText("Session has been cancelled")).toBeVisible();
    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("The student was sick");
  });

  test("should manage the availability in the roster planner", async ({
    page,
  }) => {
    await goToMentorPage(page, "Roster");

    await expect(
      page.getByRole("heading", { name: "Roster planner" }),
    ).toBeVisible();

    const dates = page.locator(".join > div");
    const firstDate = dates.first();
    const secondDate = dates.nth(1);

    await expect(firstDate).toContainText(/\d{2}\/\d{2}\/2024/);

    // Unavailable, then restore.
    await firstDate.getByText("Manage").click();
    await firstDate.getByRole("button", { name: "Unavailable" }).click();

    await expect(
      firstDate.getByText("Unavailable", { exact: true }),
    ).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await firstDate.getByRole("button", { name: "Restore" }).click();

    await expect(firstDate.getByText("Manage")).toBeVisible();

    // Available, then cancel.
    await secondDate.getByText("Manage").click();
    await secondDate
      .getByRole("button", { name: "Available", exact: true })
      .click();

    await expect(
      secondDate.getByText("Available", { exact: true }),
    ).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await secondDate.getByRole("button", { name: "Cancel" }).click();

    await expect(secondDate.getByText("Manage")).toBeVisible();
  });
});
