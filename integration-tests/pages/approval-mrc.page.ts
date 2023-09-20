import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface Form {
  completedBy: string;
  submittedDate: string;
  comment: string;
}

export class ApprovalMRCPage {
  private page: Page;

  title: Locator;

  completedByInput: Locator;
  submittedDateInput: Locator;
  commentInput: Locator;

  expect: ApprovalMRCPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", {
      name: /Approval by MRC for/,
    });

    this.completedByInput = page.getByLabel("Completed by");
    this.submittedDateInput = page.getByLabel("Submitted date");
    this.commentInput = page.getByLabel("Comment");

    this.expect = new ApprovalMRCPageAssertions(this);
  }

  async updateInputValues({ completedBy, submittedDate, comment }: Form) {
    await this.completedByInput.fill(completedBy);
    await this.submittedDateInput.fill(submittedDate);
    await this.commentInput.fill(comment);
  }

  async submitForm() {
    await this.page
      .getByRole("button", {
        name: "Save",
      })
      .click();
  }
}

export class ApprovalMRCPageAssertions {
  constructor(private approvalMRCPage: ApprovalMRCPage) {}

  async toHaveTitle() {
    await expect(this.approvalMRCPage.title).toBeVisible();
  }

  async toHaveInputs({ completedBy, submittedDate, comment }: Form) {
    await expect(this.approvalMRCPage.completedByInput).toHaveValue(
      completedBy,
    );
    await expect(this.approvalMRCPage.submittedDateInput).toHaveValue(
      submittedDate,
    );
    await expect(this.approvalMRCPage.commentInput).toHaveValue(comment);
  }
}
