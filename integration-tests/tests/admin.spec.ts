/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

import { createUserAsync } from "../dbData";
import { AdminUsersPage } from "../pages/admin-users.page";
import { AdminUserPage } from "../pages/admin-user/admin-userInfo.page";
import { RemoveUserChapterPage } from "../pages/remove-user-chapter.page";
import { AssignUserChapterPage } from "../pages/assign-user-chapter.page";
import { EOIInfoPage } from "../pages/eoi.page";

test.describe("Admin", () => {
  let usersListPage: AdminUsersPage;
  let userInfoPage: AdminUserPage;
  let removeUserChapterPage: RemoveUserChapterPage;
  let assignUserChapterPage: AssignUserChapterPage;
  let eoiInfoPage: EOIInfoPage;

  test.beforeEach(async ({ page }) => {
    await createUserAsync();

    usersListPage = new AdminUsersPage(page);
    userInfoPage = new AdminUserPage(page);
    removeUserChapterPage = new RemoveUserChapterPage(page);
    assignUserChapterPage = new AssignUserChapterPage(page);
    eoiInfoPage = new EOIInfoPage(page);
  });

  test("should edit user info", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await usersListPage.expect.toHaveTableHeaders();
    await usersListPage.expect.toHaveTableCells();

    await usersListPage.goToEditUser();

    await userInfoPage.userForm.expect.toHaveTitle();
    await userInfoPage.userForm.expect.toHaveProfilePicture();
    await userInfoPage.userForm.expect.toHaveValues(
      "test@test.com",
      "test",
      "user",
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
      ""
    );

    await userInfoPage.roleForm.expect.toHaveTableHeaders();
    await userInfoPage.roleForm.expect.toHaveNoRolesCell();

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
      "Luca@luca.com"
    );

    await userInfoPage.userForm.saveForm();

    await page.reload();

    await userInfoPage.userForm.expect.toHaveValues(
      "test@test.com",
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
      "Luca@luca.com"
    );
  });

  test("should edit chapter", async ({ page }) => {
    await page.goto("/");

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
    await page.goto("/");

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
      "I have a lot of energy and I want to share it with everyone"
    );
  });
});
