/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

import { createUserAsync } from "../dbData";
import { AdminUsersPage } from "../pages/admin-users.page";
// import { AdminUserPage } from "../pages/admin-user/admin-userInfo.page";

test.describe("when you ARE logged in", () => {
  let usersPage: AdminUsersPage;
  // let userPage: AdminUserPage;

  test.beforeAll(async () => {
    await createUserAsync();
  });

  test.beforeEach(({ page }) => {
    usersPage = new AdminUsersPage(page);
    // userPage = new AdminUserPage(page);
  });

  test("should display table with users", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await usersPage.expect.toHaveTableHeaders();
    await usersPage.expect.toHaveTableCells();

    await usersPage.goToEditUser();

    // await userPage.userForm.expect.toHaveTitle("test user");

    // await expect(page.getByRole("figure")).toBeVisible();

    // await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    //   "test@test.com"
    // );
    // await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute(
    //   "disabled",
    //   ""
    // );
    // await expect(page.getByLabel("First name")).toHaveValue("test");
    // await expect(page.getByLabel("Last name")).toHaveValue("user");
    // await expect(page.getByLabel("Mobile")).toHaveValue("123");
    // await expect(page.getByLabel("Address street")).toHaveValue("street");
    // await expect(page.getByLabel("Address suburb")).toHaveValue("suburb");
    // await expect(page.getByLabel("Address state")).toHaveValue("state");
    // await expect(page.getByLabel("Address postcode")).toHaveValue("123123");
    // await expect(page.getByLabel("Date of birth")).toHaveValue("");
    // await expect(page.getByLabel("Emergency contact name")).toHaveValue("");
    // await expect(page.getByLabel("Emergency contact number")).toHaveValue("");
    // await expect(page.getByLabel("Emergency contact address")).toHaveValue("");
    // await expect(page.getByLabel("Emergency contact relationship")).toHaveValue(
    //   ""
    // );
    // await expect(page.getByLabel("Additional email")).toHaveValue("");

    // await expect(page.getByRole("button", { name: "SAVE" })).toBeVisible();

    // await expect(page.getByRole("cell", { name: "ROLES" })).toBeVisible();
    // await expect(page.getByRole("cell", { name: "ACTION" })).toBeVisible();
    // await expect(
    //   page.getByRole("cell", {
    //     name: "Mentor hasn't been invited into the system yet",
    //   })
    // ).toBeVisible();

    // await expect(page.getByRole("link", { name: "INVITE" })).toBeVisible();

    await expect(
      page.getByRole("cell", { name: "ASSIGNED TO CHAPTER" })
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Girrawheen" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "ASSIGN TO A CHAPTER" })
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "EOI PROFILE" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "WELCOME CALL" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "REFERENCES" })).toBeVisible();
    await expect(page.getByRole("link", { name: "INDUCTION" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "POLICE CHECK" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "WWC CHECK" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "APPROVAL BY MRC" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "VOLUNTEER AGREEMENT" })
    ).toBeVisible();

    // Update user info.
    await page.getByLabel("First name").fill("Luca");
    await page.getByLabel("Last name").fill("Mara");
    await page.getByLabel("Mobile").fill("1111111");
    await page.getByLabel("Address street").fill("Address street");
    await page.getByLabel("Address suburb").fill("Address suburb");
    await page.getByLabel("Address state").fill("Address state");
    await page.getByLabel("Address postcode").fill("Address postcode");
    await page.getByLabel("Date of birth").fill("2018-07-22");
    await page.getByLabel("Emergency contact name").fill("Luca");
    await page.getByLabel("Emergency contact number").fill("Luca");
    await page.getByLabel("Emergency contact address").fill("Luca");
    await page.getByLabel("Emergency contact relationship").fill("Luca");
    await page.getByLabel("Additional email").fill("Luca");

    await page.getByRole("button", { name: "SAVE" }).click();

    await page.reload();
  });
});
