import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

import { UserForm } from "./UserForm";

export class AdminUserPage {
  private page: Page;

  userForm: UserForm;

  label: Locator;
  noAccessText: Locator;

  eoiProfileLink: Locator;
  welcomeCallLink: Locator;
  referencesLink: Locator;
  inductionLink: Locator;
  policeCheckLink: Locator;
  wwcCheckLink: Locator;
  approvalByMRCLink: Locator;
  volunteerAgreementLink: Locator;

  expect: AdminUserPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.userForm = new UserForm(page);

    this.label = this.page.getByRole("heading", { name: "Edit mentor info" });
    this.noAccessText = this.page.getByTitle("No access");

    this.eoiProfileLink = this.page
      .getByRole("row", { name: "Expression of interest" })
      .getByRole("link", {
        name: "View",
      });
    this.welcomeCallLink = this.page
      .getByRole("row", {
        name: "Welcome call",
      })
      .getByRole("link", {
        name: "View",
      });
    this.referencesLink = this.page
      .getByRole("row", { name: "References" })
      .getByRole("link", {
        name: "View",
      });
    this.inductionLink = this.page
      .getByRole("row", { name: "Induction" })
      .getByRole("link", {
        name: "View",
      });
    this.policeCheckLink = this.page
      .getByRole("row", {
        name: "Police check",
      })
      .getByRole("link", {
        name: "View",
      });
    this.wwcCheckLink = this.page
      .getByRole("row", { name: "WWC check" })
      .getByRole("link", {
        name: "View",
      });
    this.approvalByMRCLink = this.page
      .getByRole("row", {
        name: "Approval by MRC",
      })
      .getByRole("link", {
        name: "View",
      });
    this.volunteerAgreementLink = this.page.getByRole("row", {
      name: "Volunteer agreement",
    });

    this.expect = new AdminUserPageAssertions(this);
  }

  async goToEOIProfile(): Promise<void> {
    await this.eoiProfileLink.click();
  }

  async goToWelcomeCall(): Promise<void> {
    await this.welcomeCallLink.click();
  }

  async goToReferences(referenceName: string): Promise<void> {
    await this.referencesLink.click();

    await this.page
      .getByRole("row", {
        name: referenceName,
      })
      .getByRole("link", {
        name: "View",
      })
      .click();
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

  async goToGiveAccessLink(): Promise<void> {
    await this.page.getByTitle("actions").click();
    await this.page
      .getByRole("link", {
        name: "Give access",
      })
      .click();
  }
}

class AdminUserPageAssertions {
  constructor(private adminUserPage: AdminUserPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.adminUserPage.label).toBeVisible();
  }

  async toHaveNOTNoAccessWarning(): Promise<void> {
    await expect(this.adminUserPage.noAccessText).not.toBeVisible();
  }
}
