import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { goToSidebarPage, waitForHydration } from "../helpers";
import { seedDataAsync, seedSessionsForAdminAsync } from "../test-data";

const MENTOR = "test_0 user_0";

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
  await seedDataAsync();
  await seedSessionsForAdminAsync();
}

async function filterSessions(page: Page, filter: string) {
  await page.getByLabel(filter, { exact: true }).check();
  await waitForHydration(page);
}

async function typeInEditor(page: Page, text: string) {
  await page.locator('.lexical div[contenteditable="true"]').first().focus();
  await page.keyboard.type(text);
}

test.describe("Admin sessions (read only)", () => {
  test.beforeAll(async () => {
    await seedAsync();
  });

  test("should display list of session summaries", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToSidebarPage(page, "Session Summaries");

    await expect(
      page.getByRole("heading", { name: "Session Summaries", exact: true }),
    ).toBeVisible();

    for (const name of [
      "Chapter",
      "Mentor",
      "Student",
      "Session of",
      "Completed on",
      "Signed off on",
      "Action",
    ]) {
      await expect(page.getByRole("columnheader", { name })).toBeVisible();
    }

    // Legend.
    await expect(
      page.getByText("Require Sign off", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Session Cancelled", { exact: true }),
    ).toBeVisible();

    // Outstanding is the default filter.
    await expect(page.getByLabel("Outstanding", { exact: true })).toBeChecked();
    await expect(rows).toHaveCount(2);

    const outstandingRow = page.getByRole("row", {
      name: OUTSTANDING_SESSION.student,
    });

    await expect(outstandingRow).toContainText("Girrawheen");
    await expect(outstandingRow).toContainText(MENTOR);
    await expect(outstandingRow).toContainText(OUTSTANDING_SESSION.attendedOn);
    await expect(
      outstandingRow.getByRole("link", { name: "Session" }),
    ).toBeVisible();

    await filterSessions(page, "Require sign off");

    const toSignOffRow = page.getByRole("row", {
      name: TO_SIGN_OFF_SESSION.student,
    });

    await expect(rows).toHaveCount(2);
    await expect(toSignOffRow).toContainText(TO_SIGN_OFF_SESSION.attendedOn);
    await expect(toSignOffRow).toContainText(TO_SIGN_OFF_SESSION.completedOn);
    await expect(
      toSignOffRow.getByRole("link", { name: "Report" }),
    ).toBeVisible();

    await filterSessions(page, "Cancelled");

    await expect(
      page.getByText("No session summaries available"),
    ).toBeVisible();

    await filterSessions(page, "All");

    await expect(rows).toHaveCount(4);
    await expect(
      page.getByRole("row", { name: SIGNED_OFF_SESSION.student }),
    ).toContainText(SIGNED_OFF_SESSION.signedOffOn);
  });

  test("should filter session summaries by chapter and student", async ({
    page,
  }) => {
    const rows = page.getByRole("row");

    await goToSidebarPage(page, "Session Summaries");
    await filterSessions(page, "All");

    await expect(rows).toHaveCount(4);

    await page.getByLabel("Select a Chapter").selectOption({ label: "Butler" });

    await expect(
      page.getByText("No session summaries available"),
    ).toBeVisible();

    await page
      .getByLabel("Select a Chapter")
      .selectOption({ label: "Girrawheen" });

    await expect(rows).toHaveCount(4);
  });

  test("should display a session without a report", async ({ page }) => {
    await goToSidebarPage(page, "Session Summaries");

    await page
      .getByRole("row", { name: OUTSTANDING_SESSION.student })
      .getByRole("link", { name: "Session" })
      .click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: /Session of/ }),
    ).toContainText(OUTSTANDING_SESSION.attendedOn);

    const details = page.locator(".content-main");

    await expect(details).toContainText("Girrawheen");
    await expect(details).toContainText(MENTOR);
    await expect(details).toContainText(OUTSTANDING_SESSION.student);

    await expect(page.getByRole("link", { name: "Mark absent" })).toHaveCount(
      2,
    );
    await expect(
      page.getByRole("link", { name: "Add students" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Add mentors" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send notification" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Report on behalf" }),
    ).toBeVisible();

    await expect(
      page.getByText("Session cancelled", { exact: true }),
    ).not.toBeVisible();
  });

  test("should display a report waiting for sign off", async ({ page }) => {
    await goToSidebarPage(page, "Session Summaries");
    await filterSessions(page, "Require sign off");

    await page
      .getByRole("row", { name: TO_SIGN_OFF_SESSION.student })
      .getByRole("link", { name: "Report" })
      .click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", {
        name: `${TO_SIGN_OFF_SESSION.attendedOn} - volunteer: "${MENTOR}" student: "${TO_SIGN_OFF_SESSION.student}"`,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Report has NOT been submitted for review yet."),
    ).not.toBeVisible();
    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Hello this is my first report!");

    await expect(
      page.getByRole("heading", { name: "Admin Feedback" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign off", exact: true }),
    ).toBeVisible();
  });

  test("should display a signed off report", async ({ page }) => {
    await goToSidebarPage(page, "Session Summaries");
    await filterSessions(page, "All");

    await page
      .getByRole("row", { name: SIGNED_OFF_SESSION.student })
      .getByRole("link", { name: "Report" })
      .click();
    await waitForHydration(page);

    await expect(
      page.getByText(
        `Report has been signed off on ${SIGNED_OFF_SESSION.signedOffOn}`,
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Remove sign off" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign off", exact: true }),
    ).toHaveCount(0);
  });
});

test.describe("Admin sessions (edit)", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 60 * 1000 });

  test.beforeEach(async () => {
    await seedAsync();
  });

  test("should mark a mentor absent", async ({ page }) => {
    await goToSidebarPage(page, "Session Summaries");

    await page
      .getByRole("row", { name: OUTSTANDING_SESSION.student })
      .getByRole("link", { name: "Session" })
      .click();
    await waitForHydration(page);

    await page.getByRole("link", { name: "Mark absent" }).first().click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", {
        name: `Mark absent mentor "${MENTOR}" for session of "${OUTSTANDING_SESSION.attendedOn}"`,
      }),
    ).toBeVisible();

    await page
      .getByRole("combobox")
      .selectOption({ label: "Absent WITH notice" });
    await typeInEditor(page, "Mentor called in sick");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Session cancelled successfully",
    );

    // The session is not outstanding anymore.
    await goToSidebarPage(page, "Session Summaries");

    await expect(
      page.getByRole("row", { name: OUTSTANDING_SESSION.student }),
    ).toHaveCount(0);

    await filterSessions(page, "Cancelled");

    // Cancelling completes the session, so it links to its report.
    await page
      .getByRole("row", { name: OUTSTANDING_SESSION.student })
      .getByRole("link", { name: "Report" })
      .click();
    await page.waitForURL(/\/report/);
    await waitForHydration(page);

    await expect(
      page.getByText("Session cancelled", { exact: true }),
    ).toBeVisible();

    // The reason is kept as the report of the session.
    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Mentor called in sick");
  });

  test("should write a report on behalf of a mentor", async ({ page }) => {
    await goToSidebarPage(page, "Session Summaries");

    await page
      .getByRole("row", { name: OUTSTANDING_SESSION.student })
      .getByRole("link", { name: "Session" })
      .click();
    await waitForHydration(page);

    await page.getByRole("link", { name: "Report on behalf" }).click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", {
        name: `Report of "23/11/2024" on behalf of "${MENTOR}"`,
      }),
    ).toBeVisible();

    await typeInEditor(page, "Report written by an admin");

    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Report saved successfully",
    );

    await page.reload();
    await waitForHydration(page);

    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Report written by an admin");
  });
});
