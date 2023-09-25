import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class AdminLayoutPage {
  title: Locator;

  homeLink: Locator;
  mentorsLink: Locator;
  studentsLink: Locator;
  chaptersLink: Locator;

  expect: AdminLayoutPageAssertions;

  constructor(page: Page) {
    this.title = page.getByRole("link", {
      name: "Achievers WA",
    });

    this.homeLink = page.getByRole("link", {
      name: "Home",
      exact: true,
    });
    this.mentorsLink = page.getByRole("link", {
      name: "Mentors",
      exact: true,
    });
    this.studentsLink = page.getByRole("link", {
      name: "Students",
      exact: true,
    });
    this.chaptersLink = page.getByRole("link", {
      name: "Chapters",
      exact: true,
    });

    this.expect = new AdminLayoutPageAssertions(this);
  }

  async goToMentorsList() {
    await this.mentorsLink.click();
  }

  async goToStudentsList() {
    await this.studentsLink.click();
  }

  async goToChaptersList() {
    await this.chaptersLink.click();
  }

  async goToHome() {
    await this.homeLink.click();
  }
}

export class AdminLayoutPageAssertions {
  constructor(private adminLayoutPage: AdminLayoutPage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.adminLayoutPage.title).toBeVisible();
  }

  async toHaveDrawerLinks(): Promise<void> {
    await expect(this.adminLayoutPage.homeLink).toBeVisible();
    await expect(this.adminLayoutPage.mentorsLink).toBeVisible();
    await expect(this.adminLayoutPage.studentsLink).toBeVisible();
    await expect(this.adminLayoutPage.chaptersLink).toBeVisible();
  }
}
