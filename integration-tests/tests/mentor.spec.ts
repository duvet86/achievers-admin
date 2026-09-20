import { test, expect } from "@playwright/test";

import {
  seedForWriteReportAsync,
  seedDataAsync,
  seedSessionsFroHomePageAsync,
} from "../test-data";

test.describe("Mentor Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2024-11-24T00:00:00.000Z"));

    await seedDataAsync(true);

    page.on("dialog", (dialog) => dialog.accept());

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await page.getByRole("link", { name: "Mentor View", exact: true }).click();

    await expect(
      page.getByRole("link", { name: "Achievers WA" }),
    ).toBeVisible();
  });

  test("should write report", async ({ page }) => {
    await seedForWriteReportAsync();

    await page
      .getByRole("link", { name: "Write Session Summary", exact: true })
      .click();

    await expect(
      page.getByRole("heading", { name: 'Report of "23/11/2024"' }),
    ).toBeVisible();

    await expect(page.getByTestId("selectedTermYear")).toHaveValue("2024");
    await expect(page.getByTestId("selectedTermId")).toHaveValue("4");
    await expect(page.getByLabel("Session Date")).toHaveValue(
      "2024-11-23T00:00:00.000Z",
    );
    await expect(page.getByLabel("Student")).toHaveValue("1");

    await expect(page.getByText("You might like to reflect on…")).toBeVisible();
    await expect(page.getByTestId("questions")).toHaveText(
      "What work did you cover this week?What went well?What could be improved on?Any notes for next week for your partner mentor?Any notes for your Chapter Coordinator?",
    );

    await page.locator('.lexical div[contenteditable="true"]').first().focus();
    await page.keyboard.type("Hello this is my first report!");

    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(
      page.locator('.lexical span[data-lexical-text="true"]').first(),
    ).toHaveText("Hello this is my first report!");

    await page.getByRole("button", { name: "Save & Submit" }).click();

    await expect(
      page.locator('.lexical div[contenteditable="false"]').first(),
    ).toBeVisible();
  });

  test("should show home page sessions", async ({ page }) => {
    await seedSessionsFroHomePageAsync();

    await page.getByRole("link", { name: "Home", exact: true }).click();

    const sessionsTable = page.getByTestId("sessions");

    await expect(sessionsTable).toBeVisible();

    for (const header of [
      "#",
      "Session date",
      "Student",
      "Report completed",
      "Signed off",
      "Action",
    ]) {
      await expect(sessionsTable.locator("th").getByText(header)).toBeVisible();
    }

    const sessions = [
      {
        number: "1",
        studentName: "student_0 student_lastname_0",
        sessionDate: "November 30, 2024",
        reportCompletedOn: null,
        signOffOn: null,
      },
      {
        number: "2",
        studentName: "student_1 student_lastname_1",
        sessionDate: "November 16, 2024",
        reportCompletedOn: "November 16, 2024",
        signOffOn: "November 18, 2024",
      },
    ];

    for (const session of sessions) {
      await expect(
        sessionsTable.getByRole("cell").getByText(session.number, {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        sessionsTable.getByRole("cell", { name: session.sessionDate }).first(),
      ).toBeVisible();
      await expect(
        sessionsTable.getByRole("cell", { name: session.studentName }),
      ).toBeVisible();

      if (session.reportCompletedOn !== null) {
        await expect(sessionsTable.getByTestId("completedOn")).toHaveText(
          session.reportCompletedOn,
        );
      } else {
        await expect(
          sessionsTable.getByTestId("not-completedOn"),
        ).toBeVisible();
      }

      if (session.signOffOn !== null) {
        await expect(sessionsTable.getByTestId("signedOffOn")).toHaveText(
          session.signOffOn,
        );
      } else {
        await expect(
          sessionsTable.getByTestId("not-signedOffOn"),
        ).toBeVisible();
      }

      expect(
        await sessionsTable.getByRole("link", { name: "Report" }).count(),
      ).toBe(1);
    }

    await page.getByRole("link", { name: "View Report" }).first().click();

    await expect(
      page.getByRole("heading", { name: 'Report of "23/11/2024"' }),
    ).toBeVisible();
  });
});
