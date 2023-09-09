/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

import { createUserAsync } from "../dbData";
import { AdminUsersPage } from "../pages/admin-users.page";
import { AdminUserPage } from "../pages/admin-user/admin-userInfo.page";
import { RemoveUserChapterPage } from "../pages/remove-user-chapter.page";
import { AssignUserChapterPage } from "../pages/assign-user-chapter.page";
import { EOIInfoPage } from "../pages/eoi.page";
import { ImportMentorsPage } from "../pages/import-mentors.page";
import { ReferencePage } from "integration-tests/pages/reference";

test.describe("Admin", () => {
  let usersListPage: AdminUsersPage;
  let userInfoPage: AdminUserPage;
  let removeUserChapterPage: RemoveUserChapterPage;
  let assignUserChapterPage: AssignUserChapterPage;
  let eoiInfoPage: EOIInfoPage;
  let importMentorsPage: ImportMentorsPage;
  let referencePage: ReferencePage;

  test.beforeEach(async ({ page }) => {
    await createUserAsync();

    usersListPage = new AdminUsersPage(page);
    userInfoPage = new AdminUserPage(page);
    removeUserChapterPage = new RemoveUserChapterPage(page);
    assignUserChapterPage = new AssignUserChapterPage(page);
    eoiInfoPage = new EOIInfoPage(page);
    importMentorsPage = new ImportMentorsPage(page);
    referencePage = new ReferencePage(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);
  });

  test("should display list of mentors", async ({ page }) => {
    await usersListPage.expect.toHaveTitle();
    await usersListPage.expect.toHaveWarning();

    await usersListPage.expect.toHaveTableHeaders();
    await usersListPage.expect.toHaveTableCells();

    await usersListPage.expect.toHaveTableRows(11);
    await usersListPage.expect.toHavePreviousPageButtonDisabled();

    await usersListPage.goToNextPage();

    await usersListPage.expect.toHaveTableRows(9);
    await usersListPage.expect.toHaveNextPageButtonDisabled();

    await usersListPage.goToPage(1);

    await usersListPage.expect.toHaveTableRows(11);

    await usersListPage.searchUser("test_0");

    await usersListPage.expect.toHaveTableRows(2);

    await usersListPage.clearSelection();

    await usersListPage.expect.toHaveTableRows(11);

    await usersListPage.includeAllUsers();
    await usersListPage.goToNextPage();

    await usersListPage.expect.toHaveTableRows(10);
  });

  test("should import mentors from file", async ({ page }) => {
    await usersListPage.goToImportMentorsFromFile();

    await importMentorsPage.expect.toHaveTitle();

    await importMentorsPage.uploadFile(
      "./integration-tests/test-data/VolunteerDatabaseInfo.xlsx",
    );

    await importMentorsPage.expect.toHaveTableHeaders();
    await importMentorsPage.expect.toHaveTableCells();

    await importMentorsPage.expect.toHaveTableRows(4);
  });

  test("should edit user info", async ({ page }) => {
    await usersListPage.goToEditUser();

    await userInfoPage.expect.toHaveTitle();

    await userInfoPage.userForm.expect.toHaveProfilePicture();
    await userInfoPage.userForm.expect.toHaveValues(
      "test_0@test.com",
      "test_0",
      "user_0",
      "123",
      "street",
      "suburb",
      "state",
      "123123",
      "",
      "",
      "",
      "",
      "",
      "",
    );

    await userInfoPage.expect.toHaveNoAccessWarning();

    await userInfoPage.chapterForm.expect.toHaveTableHeaders();
    await userInfoPage.chapterForm.expect.toHaveTableRow();

    // Update user info.
    await userInfoPage.userForm.updateUserForm(
      "Luca",
      "Mara",
      "1111111",
      "Address street",
      "Address suburb",
      "Address state",
      "Address postcode",
      "2018-07-22",
      "Luca",
      "Luca",
      "Luca",
      "Luca",
      "Luca@luca.com",
    );

    await userInfoPage.userForm.saveForm();

    await page.reload();

    await userInfoPage.userForm.expect.toHaveValues(
      "test_0@test.com",
      "Luca",
      "Mara",
      "1111111",
      "Address street",
      "Address suburb",
      "Address state",
      "Address postcode",
      "2018-07-22",
      "Luca",
      "Luca",
      "Luca",
      "Luca",
      "Luca@luca.com",
    );
  });

  test("should edit chapter", async ({ page }) => {
    await usersListPage.goToEditUser();
    await userInfoPage.chapterForm.gotToRemoveChapter();

    await removeUserChapterPage.expect.toHaveConfirmationText();

    await removeUserChapterPage.removeChapterClick();

    await userInfoPage.chapterForm.expect.toHaveNoChaptersRow();

    await userInfoPage.chapterForm.gotToAssignToChapter();
    await assignUserChapterPage.selectChapter("Girrawheen");
    await assignUserChapterPage.assignChapter();

    await userInfoPage.chapterForm.expect.toHaveTableRow();
  });

  test("should display eoi info", async ({ page }) => {
    await usersListPage.goToEditUser();
    await userInfoPage.goToEOIProfile();

    await eoiInfoPage.expect.toHaveHeadings();
    await eoiInfoPage.expect.toHaveText(
      "Afternoon after 3pm",
      "Retired",
      "None",
      "Mentor",
      "2 years at Curtin university",
      "every week",
      "Linkid",
      "true",
      "I am ready to rock",
      "I have a lot of energy and I want to share it with everyone",
    );
  });

  test("should update reference", async ({ page }) => {
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
      isChildrenSafe: "Yes",
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
      isChildrenSafe: "Yes",
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
});
