import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class AdminUsersPage {
  private page: Page;

  title: Locator;

  previousPageBtn: Locator;
  nextPageBtn: Locator;

  fullNameHeaderCell: Locator;
  assigndChapterHeaderCell: Locator;
  actionHeaderCell: Locator;

  fullNameCell: Locator;
  assigndChapterCell: Locator;
  actionCell: Locator;

  tableRows: Locator;

  completedMentorRow: Locator;
  archivedMentorRow: Locator;

  expect: AdminUsersPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", { name: "Mentors", exact: true });

    this.fullNameHeaderCell = page.getByRole("cell", { name: "Full name" });
    this.assigndChapterHeaderCell = page.getByRole("cell", {
      name: "Assigned chapter",
    });
    this.actionHeaderCell = page.getByRole("cell", { name: "Action" });

    this.fullNameCell = page.getByRole("cell", { name: "test_0 user_0" });
    this.assigndChapterCell = page
      .getByRole("row", { name: "test_0 user_0" })
      .getByRole("cell", { name: "Girrawheen" });
    this.actionCell = page
      .getByRole("row", { name: "test_0 user_0" })
      .getByRole("link", { name: "Edit" });

    this.tableRows = page.getByRole("row");

    this.previousPageBtn = page.getByTitle("previous");
    this.nextPageBtn = page.getByTitle("next");

    this.completedMentorRow = page
      .getByRole("row", {
        name: /test_18/,
      })
      .getByTestId("completed");

    this.archivedMentorRow = page
      .getByRole("row", {
        name: /test_17/,
      })
      .getByTestId("archived");

    this.expect = new AdminUsersPageAssertions(this);
  }

  async searchUser(firstName: string): Promise<void> {
    await this.page.getByPlaceholder("Search").fill(firstName);
    await this.page.keyboard.press("Enter");
  }

  async clearSelection(): Promise<void> {
    await this.page.getByRole("button", { name: "Reset" }).click();
  }

  async includeCompleteChecksUsers(): Promise<void> {
    await this.page.getByLabel("Include complete checks").check();
  }

  async includeArchivedUsers(): Promise<void> {
    await this.page.getByLabel("Include archived").check();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageBtn.click();
  }

  async goToNextPreviousPage(): Promise<void> {
    await this.previousPageBtn.click();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page
      .getByRole("button", { name: pageNumber.toString() })
      .click();
  }

  async goToEditUser(): Promise<void> {
    await this.actionCell.click();
  }

  async goToImportMentorsFromFile(): Promise<void> {
    await this.page.getByTitle("actions").click();
    await this.page
      .getByRole("link", {
        name: "Import mentors",
      })
      .click();
  }

  async getCurrentRows(): Promise<void> {
    await this.page.getByTitle("actions").click();
    await this.page
      .getByRole("link", {
        name: "Import mentors",
      })
      .click();
  }
}

export class AdminUsersPageAssertions {
  constructor(private adminUsersPage: AdminUsersPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.adminUsersPage.title).toBeVisible();
  }

  async toHaveTableHeaders(): Promise<void> {
    await expect(this.adminUsersPage.fullNameHeaderCell).toBeVisible();
    await expect(this.adminUsersPage.assigndChapterHeaderCell).toBeVisible();
    await expect(this.adminUsersPage.actionHeaderCell).toBeVisible();
  }

  async toHaveTableCells(): Promise<void> {
    await expect(this.adminUsersPage.fullNameCell).toBeVisible();
    await expect(this.adminUsersPage.assigndChapterCell).toBeVisible();
    await expect(this.adminUsersPage.actionCell).toBeVisible();
  }

  async toHaveTableRows(n: number): Promise<void> {
    await expect(this.adminUsersPage.tableRows).toHaveCount(n);
  }

  async toHavePreviousPageButtonDisabled(): Promise<void> {
    await expect(this.adminUsersPage.previousPageBtn).toBeDisabled();
  }

  async toHaveNextPageButtonDisabled(): Promise<void> {
    await expect(this.adminUsersPage.nextPageBtn).toBeDisabled();
  }

  async toHaveCompletedMentor() {
    await expect(this.adminUsersPage.completedMentorRow).toBeVisible();
  }

  async toHaveArchivedMentor() {
    await expect(this.adminUsersPage.archivedMentorRow).toBeVisible();
  }
}
