import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class AssignUserChapterPage {
  private page: Page;

  title: Locator;

  expect: AssignUserChapterPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByTestId("title");

    this.expect = new AssignUserChapterPageAssertions(this);
  }

  async removeChapterClick() {
    await this.page.getByRole("button", { name: "Remove" }).click();
  }

  async selectChapter(chapter: string) {
    await this.page
      .getByLabel("Select a chapter")
      .selectOption({ label: chapter });
  }

  async assignChapter() {
    await this.page.getByRole("button", { name: "Save" }).click();
  }
}

export class AssignUserChapterPageAssertions {
  constructor(private assignUserChapterPage: AssignUserChapterPage) {}

  async toHavePageTitle(): Promise<void> {
    await expect(this.assignUserChapterPage.title).toBeVisible();
  }
}
