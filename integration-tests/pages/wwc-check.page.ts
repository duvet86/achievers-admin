import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface Form {
  wwcNumber: string;
  expiryDate: string;
}

export class WWCCheckPage {
  private page: Page;

  title: Locator;

  wwcNumberInput: Locator;
  expiryDateInput: Locator;
  fileInput: Locator;

  expect: WWCCheckPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", { name: /WWC check for/ });

    this.wwcNumberInput = page.getByLabel("WWC number");
    this.expiryDateInput = page.getByLabel("Expiry date");
    this.fileInput = page.getByLabel("Police check file");

    this.expect = new WWCCheckPageAssertions(this);
  }

  async updateInputValues({ wwcNumber, expiryDate }: Form): Promise<void> {
    await this.wwcNumberInput.fill(wwcNumber);
    await this.expiryDateInput.fill(expiryDate);
  }

  async goToUserEdit(): Promise<void> {
    await this.page.getByRole("link", { name: "Back" }).click();
  }

  async submitForm() {
    await this.page
      .getByRole("button", {
        name: "Save",
      })
      .click();
  }
}

export class WWCCheckPageAssertions {
  constructor(private wWCCheckPage: WWCCheckPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.wWCCheckPage.title).toBeVisible();
  }

  async toHaveInputValues({ wwcNumber, expiryDate }: Form): Promise<void> {
    await expect(this.wWCCheckPage.wwcNumberInput).toHaveValue(wwcNumber);
    await expect(this.wWCCheckPage.expiryDateInput).toHaveValue(expiryDate);
  }
}
