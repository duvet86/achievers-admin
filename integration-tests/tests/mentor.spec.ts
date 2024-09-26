import { test, expect } from "@playwright/test";

import { seedDataAsync } from "../test-data";

import { AdminLayoutPage } from "integration-tests/pages/admin-layout.page";
import { MentorLayoutPage } from "integration-tests/pages/mentor-layout.page";

test.describe("Mentor Volunteer Agreement", () => {
  let adminLayoutPage: AdminLayoutPage;
  let mentorLayoutPage: MentorLayoutPage;

  test.beforeEach(async ({ page }) => {
    await seedDataAsync();

    adminLayoutPage = new AdminLayoutPage(page);
    mentorLayoutPage = new MentorLayoutPage(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await adminLayoutPage.goToMentorView();
  });

  test("should have home page", async () => {
    await mentorLayoutPage.expect.toHaveTitle();
  });
});
