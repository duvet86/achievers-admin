/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

import { createUserAsync } from "../dbData";
import { AdminUsersPage } from "../pages/admin-users.page";
import { AdminUserPage } from "../pages/admin-user/admin-userInfo.page";

test.describe("Admin role", () => {
  let usersPage: AdminUsersPage;
  let userPage: AdminUserPage;

  test.beforeAll(async () => {
    await createUserAsync();
  });

  test.beforeEach(({ page }) => {
    usersPage = new AdminUsersPage(page);
    userPage = new AdminUserPage(page);
  });

  test("should enroll user", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await usersPage.expect.toHaveTableHeaders();
    await usersPage.expect.toHaveTableCells();

    await usersPage.goToEditUser();

    await userPage.userForm.expect.toHaveTitleForUser("test user");
    await userPage.userForm.expect.toHaveProfilePicture();
    await userPage.userForm.expect.toHaveValues(
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

    await userPage.roleForm.expect.toHaveTableHeaders();
    await userPage.roleForm.expect.toHaveNoRolesCell();

    await userPage.chapterForm.expect.toHaveTableHeaders();
    await userPage.chapterForm.expect.toHaveTableRow();

    // Update user info.
    await userPage.userForm.updateUserForm(
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

    await userPage.userForm.saveForm();

    await page.reload();

    await userPage.userForm.expect.toHaveValues(
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
});
