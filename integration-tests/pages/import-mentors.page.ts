import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class ImportMentorsPage {
  private page: Page;

  title: Locator;

  fullNameHeaderCell: Locator;
  emailHeaderCell: Locator;
  actionHeaderCell: Locator;

  fullNameCell: Locator;
  emailCell: Locator;
  actionCell: Locator;

  tableRows: Locator;

  expect: ImportMentorsPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", { name: "Import from file" });

    this.fullNameHeaderCell = page.getByRole("cell", { name: "Full name" });
    this.emailHeaderCell = page.getByRole("cell", { name: "Email" });
    this.actionHeaderCell = page.getByRole("cell", {
      name: "Action",
    });

    this.fullNameCell = page.getByRole("cell", { name: "A D" });
    this.emailCell = page.getByRole("cell", { name: "e11131testASD@test.com" });
    this.actionCell = page
      .getByRole("row", { name: "e11131testASD@test.com" })
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
    await expect(this.importMentorsPage.fullNameHeaderCell).toBeVisible();
    await expect(this.importMentorsPage.emailHeaderCell).toBeVisible();
    await expect(this.importMentorsPage.actionHeaderCell).toBeVisible();
  }

  async toHaveTableCells(): Promise<void> {
    await expect(this.importMentorsPage.fullNameCell).toBeVisible();
    await expect(this.importMentorsPage.emailCell).toBeVisible();
    await expect(this.importMentorsPage.actionCell).toBeVisible();
  }

  async toHaveTableRows(n: number): Promise<void> {
    await expect(this.importMentorsPage.tableRows).toHaveCount(n);
  }
}
