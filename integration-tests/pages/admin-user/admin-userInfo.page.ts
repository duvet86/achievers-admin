import type { Locator, Page } from "@playwright/test";

import { UserForm } from "./UserForm";
import { RoleForm } from "./RoleForm";
import { ChapterForm } from "./ChapterForm";

export class AdminUserPage {
  private page: Page;

  userForm: UserForm;
  roleForm: RoleForm;
  chapterForm: ChapterForm;

  eoiProfileLink: Locator;
  welcomeCallLink: Locator;
  referencesLink: Locator;
  inductionLink: Locator;
  policeCheckLink: Locator;
  wwcCheckLink: Locator;
  approvalByMRCLink: Locator;
  volunteerAgreementLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.userForm = new UserForm(page);
    this.roleForm = new RoleForm(page);
    this.chapterForm = new ChapterForm(page);

    this.eoiProfileLink = this.page.getByRole("link", { name: "EOI PROFILE" });
    this.welcomeCallLink = this.page.getByRole("link", {
      name: "WELCOME CALL",
    });
    this.referencesLink = this.page.getByRole("link", { name: "REFERENCES" });
    this.inductionLink = this.page.getByRole("link", { name: "INDUCTION" });
    this.policeCheckLink = this.page.getByRole("link", {
      name: "POLICE CHECK",
    });
    this.wwcCheckLink = this.page.getByRole("link", { name: "WWC CHECK" });
    this.approvalByMRCLink = this.page.getByRole("link", {
      name: "APPROVAL BY MRC",
    });
    this.volunteerAgreementLink = this.page.getByRole("link", {
      name: "VOLUNTEER AGREEMENT",
    });
  }

  async goToEOIProfile(): Promise<void> {
    await this.eoiProfileLink.click();
  }

  async goToWelcomeCall(): Promise<void> {
    await this.welcomeCallLink.click();
  }

  async goToReferences(): Promise<void> {
    await this.referencesLink.click();
  }

  async goToInduction(): Promise<void> {
    await this.inductionLink.click();
  }

  async goToPoliceCheck(): Promise<void> {
    await this.policeCheckLink.click();
  }

  async goToWwcCheck(): Promise<void> {
    await this.wwcCheckLink.click();
  }

  async goToApprovalByMRC(): Promise<void> {
    await this.approvalByMRCLink.click();
  }

  async goToVolunteerAgreementLink(): Promise<void> {
    await this.volunteerAgreementLink.click();
  }
}
