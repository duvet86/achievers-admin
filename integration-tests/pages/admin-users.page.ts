import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class AdminUsersPage {
  private page: Page;

  fullNameHeaderCell: Locator;
  emailHeaderCell: Locator;
  assigndChapterHeaderCell: Locator;
  actionHeaderCell: Locator;

  fullNameCell: Locator;
  emailCell: Locator;
  assigndChapterCell: Locator;
  actionCell: Locator;

  expect: AdminUsersPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.fullNameHeaderCell = page.getByRole("cell", { name: "FULL NAME" });
    this.emailHeaderCell = page.getByRole("cell", { name: "EMAIL" });
    this.assigndChapterHeaderCell = page.getByRole("cell", {
      name: "ASSIGNED CHAPTER",
    });
    this.actionHeaderCell = page.getByRole("cell", { name: "ACTION" });

    this.fullNameCell = page.getByRole("cell", { name: "test user" });
    this.emailCell = page.getByRole("cell", { name: "test@test.com" });
    this.assigndChapterCell = page.getByRole("cell", { name: "Girrawheen" });
    this.actionCell = page.getByRole("cell", { name: "EDIT" });

    this.expect = new AdminUsersPageAssertions(this);
  }

  async goToEditUser(): Promise<void> {
    await this.page.getByRole("link", { name: "EDIT" }).click();
  }

  async goToImportUsersFromFile(): Promise<void> {
    await this.page
      .getByRole("link", {
        name: "IMPORT USERS FROM FILE",
      })
      .click();
  }
}

export class AdminUsersPageAssertions {
  constructor(private adminUsersPage: AdminUsersPage) {}

  async toHaveTableHeaders(): Promise<void> {
    await expect(this.adminUsersPage.fullNameHeaderCell).toBeVisible();
    await expect(this.adminUsersPage.emailHeaderCell).toBeVisible();
    await expect(this.adminUsersPage.assigndChapterHeaderCell).toBeVisible();
    await expect(this.adminUsersPage.actionHeaderCell).toBeVisible();
  }

  async toHaveTableCells(): Promise<void> {
    await expect(this.adminUsersPage.fullNameCell).toBeVisible();
    await expect(this.adminUsersPage.emailCell).toBeVisible();
    await expect(this.adminUsersPage.assigndChapterCell).toBeVisible();
    await expect(this.adminUsersPage.actionCell).toBeVisible();
  }
}
