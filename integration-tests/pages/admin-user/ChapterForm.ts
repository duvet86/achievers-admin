import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class ChapterForm {
  private page: Page;

  chapterHeaderCell: Locator;
  actionHeaderCell: Locator;

  chapterCell: Locator;
  actionCell: Locator;

  noChaptersCell: Locator;

  expect: ChapterFormAssertions;

  constructor(page: Page) {
    this.page = page;

    this.chapterHeaderCell = page.getByRole("cell", {
      name: "Chapters",
      exact: true,
    });
    this.actionHeaderCell = page.getByRole("cell", { name: "CHAPTERS ACTION" });

    this.noChaptersCell = page.getByRole("cell", {
      name: "No chapters assigned to this user",
    });

    this.chapterCell = page.getByRole("cell", { name: "Girrawheen" });
    this.actionCell = page.getByRole("cell", { name: "Remove" });

    this.expect = new ChapterFormAssertions(this);
  }

  async gotToAssignToChapter(): Promise<void> {
    await this.page.getByRole("link", { name: "ASSIGN A CHAPTER" }).click();
  }

  async gotToRemoveChapter(): Promise<void> {
    await this.page.getByRole("link", { name: "Remove" }).click();
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

  async toHaveNoChaptersRow(): Promise<void> {
    await expect(this.roleForm.noChaptersCell).toBeVisible();
  }
}
