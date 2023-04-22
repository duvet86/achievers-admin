import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class ChapterForm {
  private page: Page;

  chapterHeaderCell: Locator;
  actionHeaderCell: Locator;

  chapterCell: Locator;
  actionCell: Locator;

  expect: ChapterFormAssertions;

  constructor(page: Page) {
    this.page = page;

    this.chapterHeaderCell = page.getByRole("cell", {
      name: "Chapters",
      exact: true,
    });
    this.actionHeaderCell = page.getByRole("cell", { name: "CHAPTERS ACTION" });

    this.chapterCell = page.getByRole("cell", { name: "Girrawheen" });
    this.actionCell = page.getByRole("cell", { name: "Remove chapter" });

    this.expect = new ChapterFormAssertions(this);
  }

  async assignToChapter(): Promise<void> {
    await this.page.getByRole("link", { name: "ASSIGN TO A CHAPTER" }).click();
  }
}

class ChapterFormAssertions {
  constructor(private roleForm: ChapterForm) {}

  async toHaveTableHeaders(): Promise<void> {
    await expect(this.roleForm.chapterHeaderCell).toBeVisible();
  }

  async toHaveTableRow(): Promise<void> {
    await expect(this.roleForm.chapterCell).toBeVisible();
  }
}
