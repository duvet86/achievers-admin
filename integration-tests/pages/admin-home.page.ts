import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class AdminHomePage {
  private page: Page;

  title: Locator;

  incompleteCheckMentorsLabel: Locator;
  incompleteCheckMentorsCounter: Locator;
  incompleteCheckMentorsSubLabel: Locator;

  studentsNoMentorLabel: Locator;
  studentsNoMentorCouter: Locator;
  studentsNoMentorSublabel: Locator;

  totalChaptersLabel: Locator;
  totalChaptersCounter: Locator;

  links: Locator;

  expect: AdminHomePageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", {
      name: "Welcome to Achievers Club WA admin system",
    });

    this.incompleteCheckMentorsLabel = page.getByRole("heading", {
      name: "Mentors with incomplete checks",
    });
    this.incompleteCheckMentorsCounter = page.getByRole("heading", {
      name: "17",
    });
    this.incompleteCheckMentorsSubLabel = page.getByRole("heading", {
      name: "of 18 total mentors",
    });

    this.studentsNoMentorLabel = page.getByRole("heading", {
      name: "Students without a mentor",
    });
    this.studentsNoMentorCouter = page.getByRole("heading", {
      name: "15",
    });
    this.studentsNoMentorSublabel = page.getByRole("heading", {
      name: "of 18 total students",
    });

    this.totalChaptersLabel = page.getByRole("heading", {
      name: "Chapters",
    });
    this.totalChaptersCounter = page.getByRole("heading", {
      name: "3",
    });

    this.links = page.getByRole("link", {
      name: "View",
    });

    this.expect = new AdminHomePageAssertions(this);
  }
}

export class AdminHomePageAssertions {
  constructor(private adminHomePage: AdminHomePage) {}

  async toHaveTitle(): Promise<void> {
    await expect(this.adminHomePage.title).toBeVisible();
  }

  async toHaveCounters(): Promise<void> {
    await expect(this.adminHomePage.incompleteCheckMentorsLabel).toBeVisible();
    await expect(
      this.adminHomePage.incompleteCheckMentorsCounter,
    ).toBeVisible();
    await expect(
      this.adminHomePage.incompleteCheckMentorsSubLabel,
    ).toBeVisible();

    await expect(this.adminHomePage.studentsNoMentorLabel).toBeVisible();
    await expect(this.adminHomePage.studentsNoMentorCouter).toBeVisible();
    await expect(this.adminHomePage.studentsNoMentorSublabel).toBeVisible();

    await expect(this.adminHomePage.totalChaptersLabel).toBeVisible();
    await expect(this.adminHomePage.totalChaptersCounter).toBeVisible();
  }

  async toHaveLinks(): Promise<void> {
    await expect(this.adminHomePage.links).toHaveCount(4);

    await expect(this.adminHomePage.links.nth(0)).toHaveAttribute(
      "href",
      "/admin/mentors",
    );

    await expect(this.adminHomePage.links.nth(1)).toHaveAttribute(
      "href",
      "/admin/students",
    );

    await expect(this.adminHomePage.links.nth(2)).toHaveAttribute(
      "href",
      "/admin/chapters",
    );

    await expect(this.adminHomePage.links.nth(3)).toHaveAttribute(
      "href",
      "/mentor/home",
    );
  }
}
