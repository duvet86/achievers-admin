import { test, expect } from "@playwright/test";

import { seedDataAsync } from "../test-data";

import { AdminLayoutPage } from "integration-tests/pages/admin-layout.page";
import { MentorVolunteerAgreementPage } from "integration-tests/pages/mentor.volunteer-agreement";

test.describe("Mentor", () => {
  let adminLayoutPage: AdminLayoutPage;
  let mentorVolunteerAgreementPage: MentorVolunteerAgreementPage;

  test.beforeEach(async ({ page }) => {
    await seedDataAsync();

    adminLayoutPage = new AdminLayoutPage(page);
    mentorVolunteerAgreementPage = new MentorVolunteerAgreementPage(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await adminLayoutPage.expect.toHaveTitle();
    await adminLayoutPage.expect.toHaveDrawerLinks();

    await adminLayoutPage.goToMentorView();
  });

  test("should have volunteer agreement", async () => {
    await mentorVolunteerAgreementPage.expect.toHaveTitles();
  });
});
