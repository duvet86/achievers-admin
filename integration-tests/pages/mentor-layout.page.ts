import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class MentorLayoutPage {
  title: Locator;

  homeLink: Locator;
  rosterLink: Locator;
  writeReportLink: Locator;
  studentsLink: Locator;
  partnerLink: Locator;
  resourcesLink: Locator;

  expect: MentorLayoutPageAssertions;

  constructor(page: Page) {
    this.title = page.getByRole("link", {
      name: "Achievers WA",
    });

    this.homeLink = page.getByRole("link", {
      name: "Home",
      exact: true,
    });
    this.rosterLink = page.getByRole("link", {
      name: "Roster",
      exact: true,
    });
    this.writeReportLink = page.getByRole("link", {
      name: "Write Report",
      exact: true,
    });
    this.studentsLink = page.getByRole("link", {
      name: "My Students",
      exact: true,
    });
    this.partnerLink = page.getByRole("link", {
      name: "My Partner",
      exact: true,
    });
    this.resourcesLink = page.getByRole("link", {
      name: "Useful Resources",
      exact: true,
    });

    this.expect = new MentorLayoutPageAssertions(this);
  }

  async goToRosterList() {
    await this.rosterLink.click();
  }

  async goToWriteReportPage() {
    await this.writeReportLink.click();
  }

  async goToStudentsList() {
    await this.studentsLink.click();
  }

  async goToHome() {
    await this.homeLink.click();
  }

  async goToPartnerView() {
    await this.partnerLink.click();
  }

  async goToResourcesView() {
    await this.resourcesLink.click();
  }
}

export class MentorLayoutPageAssertions {
  constructor(private page: MentorLayoutPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.page.title).toBeVisible();
  }

  async toHaveDrawerLinks(): Promise<void> {
    await expect(this.page.homeLink).toBeVisible();
    await expect(this.page.rosterLink).toBeVisible();
    await expect(this.page.writeReportLink).toBeVisible();
    await expect(this.page.studentsLink).toBeVisible();
    await expect(this.page.resourcesLink).toBeVisible();
  }
}
