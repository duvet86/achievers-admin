import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class MentorWriteReportPage {
  header: Locator;

  termSelect: Locator;
  sessionDateSelect: Locator;
  studentSelect: Locator;

  editorQuestionsHeading: Locator;
  editorQuestionsList: Locator;

  editorEditable: Locator;
  editorReadonly: Locator;

  saveAsDraftButton: Locator;
  completeButton: Locator;

  reportText: Locator;

  expect: MentorWriteReportPageAssertions;

  constructor(private page: Page) {
    this.header = page.getByRole("heading", {
      name: 'Report of "23/11/2024"',
    });

    this.termSelect = page.getByLabel("Term");
    this.sessionDateSelect = page.getByLabel("Session Date");
    this.studentSelect = page.getByLabel("Student");

    this.editorQuestionsHeading = page.getByText(
      "Have you answered these questions?",
    );
    this.editorQuestionsList = page.getByTestId("questions");

    this.editorEditable = page
      .locator('.lexical div[contenteditable="true"]')
      .first();
    this.editorReadonly = page
      .locator('.lexical div[contenteditable="false"]')
      .first();

    this.saveAsDraftButton = page.getByRole("button", {
      name: "Save",
    });
    this.completeButton = page.getByRole("button", {
      name: "Completed",
    });

    this.reportText = page
      .locator('.lexical span[data-lexical-text="true"]')
      .first();

    this.expect = new MentorWriteReportPageAssertions(this);

    this.page.on("dialog", (dialog) => dialog.accept());
  }

  async typeReport() {
    await this.editorEditable.focus();
    await this.page.keyboard.type("Hello this is my first report!");
  }

  async saveAsDraft() {
    await this.saveAsDraftButton.click();
  }

  async completeReport() {
    await this.completeButton.click();
  }
}

export class MentorWriteReportPageAssertions {
  constructor(private page: MentorWriteReportPage) {}

  async toHaveHeading(): Promise<void> {
    await expect(this.page.header).toBeVisible();
  }

  async toHaveSelectedInputs(): Promise<void> {
    await expect(this.page.termSelect).toHaveValue("4");
    await expect(this.page.sessionDateSelect).toHaveValue(
      "2024-11-23T00:00:00.000Z",
    );
    await expect(this.page.studentSelect).toHaveValue("1");
  }

  async toHaveQuestions(): Promise<void> {
    await expect(this.page.editorQuestionsHeading).toBeVisible();
    await expect(this.page.editorQuestionsList).toHaveText(
      "What work did you cover this week?What went well?What could be improved on?Any notes for next week for your partner mentor?Any notes for your Chapter Coordinator?",
    );
  }

  async toHaveReport(): Promise<void> {
    await expect(this.page.reportText).toHaveText(
      "Hello this is my first report!",
    );
  }

  async toHaveReadonlyReport() {
    await expect(this.page.editorReadonly).toBeVisible();
  }
}
