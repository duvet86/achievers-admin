import { test, expect } from "@playwright/test";

import { seedBookSessionAsync, seedDataAsync } from "../test-data";

import { AdminLayoutPage } from "integration-tests/pages/admin-layout.page";
import { MentorLayoutPage } from "integration-tests/pages/mentor-layout.page";
import { MentorHomePage } from "integration-tests/pages/mentor.home";
import { MentorRosterPage } from "integration-tests/pages/mentor.roster";
import { MentorWriteReportPage } from "integration-tests/pages/mentor.wite-report";

test.describe("Mentor Home Page", () => {
  let adminLayoutPage: AdminLayoutPage;
  let mentorLayoutPage: MentorLayoutPage;
  let mentorHomePage: MentorHomePage;
  let mentorRosterPage: MentorRosterPage;
  let mentorWriteReportPage: MentorWriteReportPage;

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2024-11-24T00:00:00.000Z"));

    await seedDataAsync(true);

    adminLayoutPage = new AdminLayoutPage(page);
    mentorLayoutPage = new MentorLayoutPage(page);
    mentorHomePage = new MentorHomePage(page);
    mentorRosterPage = new MentorRosterPage(page);
    mentorWriteReportPage = new MentorWriteReportPage(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await adminLayoutPage.goToMentorView();
    await mentorLayoutPage.expect.toHaveTitle();
  });

  test("should have home page", async () => {
    await mentorHomePage.expect.toHaveHeadings();

    await mentorHomePage.goToRosterPage();

    await mentorRosterPage.expect.toHaveHeading();
  });

  test("should write report", async () => {
    await seedBookSessionAsync();

    await mentorLayoutPage.goToWriteReportPage();

    await mentorWriteReportPage.expect.toHaveHeading();
    await mentorWriteReportPage.expect.toHaveSelectedInputs();
    await mentorWriteReportPage.expect.toHaveQuestions();

    await mentorWriteReportPage.typeReport();
    await mentorWriteReportPage.saveAsDraft();

    await mentorWriteReportPage.expect.toHaveReport();

    await mentorWriteReportPage.completeReport();

    await mentorWriteReportPage.expect.toHaveReadonlyReport();
  });
});
