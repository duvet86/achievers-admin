import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class MentorRosterPage {
  header: Locator;

  expect: MentorRosterPageAssertions;

  constructor(page: Page) {
    this.header = page.getByRole("heading", {
      name: "Welcome Luca Mara",
    });

    this.expect = new MentorRosterPageAssertions(this);
  }
}

export class MentorRosterPageAssertions {
  constructor(private page: MentorRosterPage) {}

  async toHaveHeading(): Promise<void> {
    await expect(this.page.header).toBeVisible();
  }
}
