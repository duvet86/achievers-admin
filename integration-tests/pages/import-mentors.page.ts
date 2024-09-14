import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class ImportMentorsPage {
  private page: Page;

  title: Locator;

  numberHeaderCell: Locator;
  fullNameHeaderCell: Locator;
  errorHeaderCell: Locator;
  actionHeaderCell: Locator;

  numberCell: Locator;
  fullNameCell: Locator;
  errorCell: Locator;
  actionCell: Locator;

  tableRows: Locator;

  expect: ImportMentorsPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", {
      name: "Import mentors from file",
    });

    this.numberHeaderCell = page.getByRole("cell", { name: "#" });
    this.fullNameHeaderCell = page.getByRole("cell", { name: "Full name" });
    this.errorHeaderCell = page.getByRole("cell", { name: "Error" });
    this.actionHeaderCell = page.getByRole("cell", {
      name: "Action",
    });

    this.numberCell = page.getByRole("cell", { name: "1" });
    this.fullNameCell = page.getByRole("cell", { name: "A D" });
    this.errorCell = page
      .getByRole("row", { name: "A D" })
      .getByRole("cell", { name: "", exact: true });
    this.actionCell = page
      .getByRole("row", { name: "A D" })
      .getByRole("cell", { name: "Edit" });

    this.tableRows = page.getByRole("row");

    this.expect = new ImportMentorsPageAssertions(this);
  }

  async uploadFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");

    await this.page.getByLabel("Upload a spreadsheet with new users").click();

    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(filePath);

    await this.page.getByRole("button", { name: "Import" }).click();
  }
}

export class ImportMentorsPageAssertions {
  constructor(private importMentorsPage: ImportMentorsPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.importMentorsPage.title).toBeVisible();
  }

  async toHaveTableHeaders(): Promise<void> {
    await expect(this.importMentorsPage.numberHeaderCell).toBeVisible();
    await expect(this.importMentorsPage.fullNameHeaderCell).toBeVisible();
    await expect(this.importMentorsPage.errorHeaderCell).toBeVisible();
    await expect(this.importMentorsPage.actionHeaderCell).toBeVisible();
  }

  async toHaveTableCells(): Promise<void> {
    await expect(this.importMentorsPage.numberCell).toBeVisible();
    await expect(this.importMentorsPage.fullNameCell).toBeVisible();
    await expect(this.importMentorsPage.errorCell).toBeVisible();
    await expect(this.importMentorsPage.actionCell).toBeVisible();
  }

  async toHaveTableRows(n: number): Promise<void> {
    await expect(this.importMentorsPage.tableRows).toHaveCount(n);
  }
}
