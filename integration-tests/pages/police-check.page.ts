import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface Form {
  expiryDate: string;
}

export class PoliceCheckPage {
  private page: Page;

  title: Locator;
  VNPCLink: Locator;

  expiryDateInput: Locator;
  fileInput: Locator;

  expect: PoliceCheckPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", { name: /Police check for/ });
    this.VNPCLink = page.getByRole("link", { name: "VNPC Portal" });

    this.expiryDateInput = page.getByLabel("Expiry Date (3 years from issue)");
    this.fileInput = page.getByLabel("Police check file");

    this.expect = new PoliceCheckPageAssertions(this);
  }

  async updateInputValues({ expiryDate }: Form): Promise<void> {
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

export class PoliceCheckPageAssertions {
  constructor(private policeCheckPage: PoliceCheckPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.policeCheckPage.title).toBeVisible();
  }

  async toHaveVNPCLink(): Promise<void> {
    await expect(this.policeCheckPage.VNPCLink).toBeVisible();
  }

  async toHaveInputValues({ expiryDate }: Form): Promise<void> {
    await expect(this.policeCheckPage.expiryDateInput).toHaveValue(expiryDate);
  }
}
