import { test, expect } from "@playwright/test";

import { seedDataAsync } from "../test-data";

import { AdminLayoutPage } from "integration-tests/pages/admin-layout.page";
import { MentorLayoutPage } from "integration-tests/pages/mentor-layout.page";
import { MentorVolunteerAgreementPage } from "integration-tests/pages/mentor.volunteer-agreement";

test.describe("Mentor Volunteer Agreement", () => {
  let adminLayoutPage: AdminLayoutPage;
  let mentorLayoutPage: MentorLayoutPage;
  let mentorVolunteerAgreementPage: MentorVolunteerAgreementPage;

  test.beforeEach(async ({ page }) => {
    await seedDataAsync();

    adminLayoutPage = new AdminLayoutPage(page);
    mentorLayoutPage = new MentorLayoutPage(page);

    mentorVolunteerAgreementPage = new MentorVolunteerAgreementPage(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await adminLayoutPage.expect.toHaveTitle();
    await adminLayoutPage.expect.toHaveDrawerLinks();

    await adminLayoutPage.goToMentorView();
  });

  test("should have volunteer agreement", async () => {
    await mentorVolunteerAgreementPage.expect.toHaveTitles();

    await mentorVolunteerAgreementPage.expect.toHaveInitialInputs({
      firstName: "test_0",
      lastName: "user_0",
      mobile: "123",
      addressStreet: "street",
      addressSuburb: "suburb",
      addressState: "state",
      addressPostcode: "123123",
      dateOfBirth: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      emergencyContactAddress: "",
      emergencyContactRelationship: "",
    });

    await mentorVolunteerAgreementPage.checkAgreement({
      firstName: "Luca",
      lastName: "Mara",
      mobile: "1111111",
      addressStreet: "Address street",
      addressSuburb: "Address suburb",
      addressState: "Address state",
      addressPostcode: "Address postcode",
      dateOfBirth: "1986-07-22",
      emergencyContactName: "Luca",
      emergencyContactNumber: "Luca",
      emergencyContactAddress: "Luca",
      emergencyContactRelationship: "Luca",
    });

    await mentorVolunteerAgreementPage.saveForm();

    await mentorLayoutPage.expect.toHaveTitle();
  });
});
