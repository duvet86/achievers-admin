import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class RemoveUserChapterPage {
  private page: Page;

  confirmationText: Locator;

  expect: RemoveUserChapterPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.confirmationText = page.getByTestId("cofirmation-text");

    this.expect = new RemoveUserChapterPageAssertions(this);
  }

  async removeChapterClick() {
    await this.page.getByRole("button", { name: "Remove" }).click();
  }
}

export class RemoveUserChapterPageAssertions {
  constructor(private removeUserChapterPage: RemoveUserChapterPage) {}

  async toHaveConfirmationText(): Promise<void> {
    await expect(this.removeUserChapterPage.confirmationText).toBeVisible();
  }
}
