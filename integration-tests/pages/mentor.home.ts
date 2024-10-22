import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class MentorHomePage {
  header: Locator;
  paragraph: Locator;
  firstSessionHeading: Locator;
  rosterLink: Locator;

  expect: MentorHomePageAssertions;

  constructor(page: Page) {
    this.header = page.getByRole("heading", {
      name: "Welcome Luca Mara",
    });
    this.paragraph = page.getByRole("heading", {
      name: "You haven't booked a session yet",
    });
    this.firstSessionHeading = page.getByRole("heading", {
      name: "Go to the roster page to book you first session",
    });
    this.rosterLink = page.getByRole("link", {
      name: "roster page",
    });

    this.expect = new MentorHomePageAssertions(this);
  }

  async goToRosterPage() {
    await this.rosterLink.click();
  }
}

export class MentorHomePageAssertions {
  constructor(private page: MentorHomePage) {}

  async toHaveHeadings(): Promise<void> {
    await expect(this.page.header).toBeVisible();
    await expect(this.page.paragraph).toBeVisible();
    await expect(this.page.firstSessionHeading).toBeVisible();
  }
}
