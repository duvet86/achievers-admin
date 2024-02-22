import { test, expect } from "@playwright/test";

import { seedDataAsync } from "../test-data";

import { AdminLayoutPage } from "integration-tests/pages/admin-layout.page";
import { AdminHomePage } from "integration-tests/pages/admin-home.page";
import { AdminUsersPage } from "../pages/admin-users.page";
import { AdminUserPage } from "../pages/admin-user/admin-userInfo.page";
import { EOIInfoPage } from "../pages/eoi.page";
import { ImportMentorsPage } from "../pages/import-mentors.page";
import { ReferencePage } from "integration-tests/pages/reference";
import { PoliceCheckPage } from "integration-tests/pages/police-check.page";
import { WWCCheckPage } from "integration-tests/pages/wwc-check.page";
import { ApprovalMRCPage } from "integration-tests/pages/approval-mrc.page";

test.describe("Admin", () => {
  let adminLayoutPage: AdminLayoutPage;
  let adminHomePage: AdminHomePage;
  let usersListPage: AdminUsersPage;
  let userInfoPage: AdminUserPage;
  let eoiInfoPage: EOIInfoPage;
  let importMentorsPage: ImportMentorsPage;
  let referencePage: ReferencePage;
  let policeCheckPage: PoliceCheckPage;
  let wWCCheckPage: WWCCheckPage;
  let approvalMRCPage: ApprovalMRCPage;

  test.beforeEach(async ({ page }) => {
    await seedDataAsync();

    adminLayoutPage = new AdminLayoutPage(page);
    adminHomePage = new AdminHomePage(page);
    usersListPage = new AdminUsersPage(page);
    userInfoPage = new AdminUserPage(page);
    eoiInfoPage = new EOIInfoPage(page);
    importMentorsPage = new ImportMentorsPage(page);
    referencePage = new ReferencePage(page);
    policeCheckPage = new PoliceCheckPage(page);
    wWCCheckPage = new WWCCheckPage(page);
    approvalMRCPage = new ApprovalMRCPage(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await adminLayoutPage.expect.toHaveTitle();
    await adminLayoutPage.expect.toHaveDrawerLinks();
  });

  test("should have home page", async ({ page }) => {
    await adminHomePage.expect.toHaveTitle();
    await adminHomePage.expect.toHaveCounters();
    await adminHomePage.expect.toHaveLinks();
  });

  test("should display list of mentors", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.expect.toHaveTitle();

    await usersListPage.expect.toHaveTableHeaders();
    await usersListPage.expect.toHaveTableCells();

    await usersListPage.expect.toHaveTableRows(11);
    await usersListPage.expect.toHavePreviousPageButtonDisabled();
    await usersListPage.expect.toHaveCompletedMentor();

    await usersListPage.goToNextPage();

    await usersListPage.expect.toHaveTableRows(9);
    await usersListPage.expect.toHaveNextPageButtonDisabled();

    await usersListPage.goToPage(1);

    await usersListPage.expect.toHaveTableRows(11);

    await usersListPage.searchUser("test_0");

    await usersListPage.expect.toHaveTableRows(2);

    await usersListPage.clearSelection();

    await usersListPage.expect.toHaveTableRows(11);

    await usersListPage.includeArchivedUsers();
    await usersListPage.expect.toHaveArchivedMentor();

    await usersListPage.goToNextPage();

    await usersListPage.expect.toHaveTableRows(10);
  });

  test("should import mentors from file", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToImportMentorsFromFile();

    await importMentorsPage.expect.toHaveTitle();

    await importMentorsPage.uploadFile(
      "./integration-tests/test-data/VolunteerDatabaseInfo.xlsx",
    );

    await importMentorsPage.expect.toHaveTableHeaders();
    await importMentorsPage.expect.toHaveTableCells();

    await importMentorsPage.expect.toHaveTableRows(4);
  });

  test("should edit mentor info", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToEditUser();

    await userInfoPage.expect.toHaveTitle();

    // Test that empty values are saved correctly.
    await userInfoPage.userForm.saveForm();

    await userInfoPage.userForm.expect.toHaveProfilePicture();
    await userInfoPage.userForm.expect.toHaveValues({
      email: "test_0@test.com",
      chapter: "Girrawheen",
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
      additionalEmail: "",
    });

    await userInfoPage.expect.toHaveNoAccessWarning();

    // Update user info.
    await userInfoPage.userForm.updateUserForm({
      chapter: "Butler",
      firstName: "Luca",
      lastName: "Mara",
      mobile: "1111111",
      addressStreet: "Address street",
      addressSuburb: "Address suburb",
      addressState: "Address state",
      addressPostcode: "Address postcode",
      dateOfBirth: "2018-07-22",
      emergencyContactName: "Luca",
      emergencyContactNumber: "Luca",
      emergencyContactAddress: "Luca",
      emergencyContactRelationship: "Luca",
      additionalEmail: "Luca@luca.com",
    });

    await userInfoPage.userForm.saveForm();

    await page.reload();

    await userInfoPage.userForm.expect.toHaveValues({
      email: "test_0@test.com",
      chapter: "Butler",
      firstName: "Luca",
      lastName: "Mara",
      mobile: "1111111",
      addressStreet: "Address street",
      addressSuburb: "Address suburb",
      addressState: "Address state",
      addressPostcode: "Address postcode",
      dateOfBirth: "2018-07-22",
      emergencyContactName: "Luca",
      emergencyContactNumber: "Luca",
      emergencyContactAddress: "Luca",
      emergencyContactRelationship: "Luca",
      additionalEmail: "Luca@luca.com",
    });
  });

  test("should display eoi info for mentor", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToEditUser();
    await userInfoPage.goToEOIProfile();

    await eoiInfoPage.expect.toHaveValues({
      bestTimeToContact: "Afternoon after 3pm",
      occupation: "Retired",
      volunteerExperience: "None",
      role: "Mentor",
      mentoringLevel: "2 years at Curtin university",
      preferredFrequency: "every week",
      hearAboutUs: "Linkid",
      isOver18: "Yes",
      whyVolunteer: "I am ready to rock",
      aboutMe: "I have a lot of energy and I want to share it with everyone",
    });

    await eoiInfoPage.updateForm({
      bestTimeToContact: "AAAAA",
      occupation: "asdasd",
      volunteerExperience: "ddddd",
      role: "sdsdsd",
      mentoringLevel: "wwwww",
      preferredFrequency: "vvcvcv",
      hearAboutUs: "Linkidvvvvvvvvvvvv",
      isOver18: "No",
      whyVolunteer: "mnmnmmmmm",
      aboutMe: "vvvvvvvvvvvvvvvv",
    });

    await eoiInfoPage.submitForm();

    await eoiInfoPage.expect.toHaveValues({
      bestTimeToContact: "AAAAA",
      occupation: "asdasd",
      volunteerExperience: "ddddd",
      role: "sdsdsd",
      mentoringLevel: "wwwww",
      preferredFrequency: "vvcvcv",
      hearAboutUs: "Linkidvvvvvvvvvvvv",
      isOver18: "No",
      whyVolunteer: "mnmnmmmmm",
      aboutMe: "vvvvvvvvvvvvvvvv",
    });
  });

  test("should update reference for mentor", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToEditUser();
    await userInfoPage.goToReferences("referenceA_0 lastnameA_0");

    await referencePage.expect.toHaveHeadings();

    await referencePage.updateReference({
      firstName: "Luca",
      lastName: "Mara",
      mobile: "123123",
      email: "asd@asd.com",
      bestTimeToContact: "now",
      relationship: "father",
      hasKnowApplicantForAYear: "Yes",
      isRelated: "No",
      knownForComment: "asdasdasdasdsa",
      safeWithChildren: "Yes asdasdasasd",
      skillAndKnowledgeComment: "asdasdasdssss",
      empathyAndPatienceComment: "sssssssssssssssssss",
      buildRelationshipsComment: "aaaaaaaaaaaaaaaaaaa",
      outcomeComment: "sssssssssssssssssss",
      generalComment: "ddddddddddddddddddddddd",
      isMentorRecommended: "Yes",
      calledBy: "Tony",
      calledOndate: "2020-02-02",
    });

    await referencePage.submitForm();

    await referencePage.expect.toHaveInputs({
      firstName: "Luca",
      lastName: "Mara",
      mobile: "123123",
      email: "asd@asd.com",
      bestTimeToContact: "now",
      relationship: "father",
      hasKnowApplicantForAYear: "Yes",
      isRelated: "No",
      knownForComment: "asdasdasdasdsa",
      safeWithChildren: "Yes asdasdasasd",
      skillAndKnowledgeComment: "asdasdasdssss",
      empathyAndPatienceComment: "sssssssssssssssssss",
      buildRelationshipsComment: "aaaaaaaaaaaaaaaaaaa",
      outcomeComment: "sssssssssssssssssss",
      generalComment: "ddddddddddddddddddddddd",
      isMentorRecommended: "Yes",
      calledBy: "Tony",
      calledOndate: "2020-02-02",
    });
  });

  test("should update police check for mentor", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToEditUser();
    await userInfoPage.goToPoliceCheck();

    await policeCheckPage.expect.toHaveTitle();
    await policeCheckPage.expect.toHaveVNPCLink();

    await policeCheckPage.expect.toHaveInputValues({
      expiryDate: "2023-09-16",
    });

    await policeCheckPage.updateInputValues({
      expiryDate: "1999-11-11",
    });

    await policeCheckPage.submitForm();

    await policeCheckPage.expect.toHaveInputValues({
      expiryDate: "1999-11-11",
    });
  });

  test("should update WWC check for mentor", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToEditUser();
    await userInfoPage.goToWwcCheck();

    await wWCCheckPage.expect.toHaveTitle();

    await wWCCheckPage.expect.toHaveInputValues({
      wwcNumber: "123456",
      expiryDate: "2023-09-16",
    });

    await wWCCheckPage.updateInputValues({
      wwcNumber: "00000",
      expiryDate: "1999-11-11",
    });

    await wWCCheckPage.submitForm();

    await wWCCheckPage.expect.toHaveInputValues({
      wwcNumber: "00000",
      expiryDate: "1999-11-11",
    });
  });

  test("should update Approbal by MRC for mentor", async ({ page }) => {
    await adminLayoutPage.goToMentorsList();

    await usersListPage.goToEditUser();
    await userInfoPage.goToApprovalByMRC();

    await approvalMRCPage.expect.toHaveTitle();

    await approvalMRCPage.updateInputValues({
      completedBy: "Luca",
      submittedDate: "1999-11-11",
      comment: "comment asd",
    });

    await approvalMRCPage.submitForm();

    await approvalMRCPage.expect.toHaveInputs({
      completedBy: "Luca",
      submittedDate: "1999-11-11",
      comment: "comment asd",
    });
  });
});
