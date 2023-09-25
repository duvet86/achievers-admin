import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface Counters {
  incompleteCheckMentors: number;
  totalMentors: number;
  totalStudents: number;
  totalChapters: number;
}

export class AdminHomePage {
  private page: Page;

  title: Locator;

  incompleteCheckMentors: Locator;
  totalMentors: Locator;
  totalStudents: Locator;
  totalChapters: Locator;

  mentorsLink: Locator;
  studentsLink: Locator;
  chaptersLink: Locator;

  expect: AdminHomePageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", {
      name: "Welcome to Achievers Club WA admin system",
    });

    this.incompleteCheckMentors = page.getByTestId("incompleteMentors");
    this.totalMentors = page.getByTestId("totalMentors");
    this.totalStudents = page.getByTestId("totalStudents");
    this.totalChapters = page.getByTestId("totalChapters");

    this.mentorsLink = page.getByRole("link", {
      name: "View mentors",
    });
    this.studentsLink = page.getByRole("link", {
      name: "View students",
    });
    this.chaptersLink = page.getByRole("link", {
      name: "View chapters",
    });

    this.expect = new AdminHomePageAssertions(this);
  }
}

export class AdminHomePageAssertions {
  constructor(private adminHomePage: AdminHomePage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.adminHomePage.title).toBeVisible();
  }

  async toHaveCounters({
    incompleteCheckMentors,
    totalChapters,
    totalMentors,
    totalStudents,
  }: Counters): Promise<void> {
    await expect(this.adminHomePage.incompleteCheckMentors).toContainText(
      incompleteCheckMentors.toString(),
    );
    await expect(this.adminHomePage.totalMentors).toContainText(
      `of ${totalMentors} total mentors`,
    );
    await expect(this.adminHomePage.totalStudents).toContainText(
      totalStudents.toString(),
    );
    await expect(this.adminHomePage.totalChapters).toContainText(
      totalChapters.toString(),
    );
  }

  async toHaveLinks(): Promise<void> {
    await expect(this.adminHomePage.mentorsLink).toBeVisible();
    await expect(this.adminHomePage.studentsLink).toBeVisible();
    await expect(this.adminHomePage.chaptersLink).toBeVisible();
  }
}
