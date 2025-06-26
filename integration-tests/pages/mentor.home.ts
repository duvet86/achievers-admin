import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export interface NextSession {
  number: string;
  sessionDate: string;
  studentName: string;
}

export interface RecentSession {
  number: string;
  sessionDate: string;
  studentName: string;
  reportCompletedOn: string | null;
  signOffOn: string | null;
}

export class MentorHomePage {
  header: Locator;
  paragraph: Locator;
  firstSessionHeading: Locator;
  rosterLink: Locator;

  nextSessionsTable: Locator;
  recentSessionsTable: Locator;

  expect: MentorHomePageAssertions;

  constructor(private page: Page) {
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

    this.nextSessionsTable = page.getByTestId("next-sessions");
    this.recentSessionsTable = page.getByTestId("recent-sessions");

    this.expect = new MentorHomePageAssertions(this);
  }

  async goToRosterPage() {
    await this.rosterLink.click();
  }

  async goToViewReportPage(tableRow: number) {
    await (
      await this.page.getByRole("link", { name: "Report" }).all()
    )[tableRow].click();
  }
}

export class MentorHomePageAssertions {
  constructor(private page: MentorHomePage) {}

  async toHaveHeadings(): Promise<void> {
    await expect(this.page.header).toBeVisible();
    await expect(this.page.paragraph).toBeVisible();
    await expect(this.page.firstSessionHeading).toBeVisible();
  }

  async toHaveRosterPageLink(): Promise<void> {
    await expect(this.page.rosterLink).toBeVisible();
  }

  async toHaveNextSessions(nextSessions: NextSession[]): Promise<void> {
    await expect(this.page.nextSessionsTable).toBeVisible();

    await expect(
      this.page.nextSessionsTable.locator("th").getByText("#"),
    ).toBeVisible();
    await expect(
      this.page.nextSessionsTable.locator("th").getByText("Session date"),
    ).toBeVisible();
    await expect(
      this.page.nextSessionsTable.locator("th").getByText("Student"),
    ).toBeVisible();

    for (const nextSession of nextSessions) {
      await expect(
        this.page.nextSessionsTable
          .getByRole("cell")
          .getByText(nextSession.number, { exact: true }),
      ).toBeVisible();
      await expect(
        this.page.nextSessionsTable
          .getByRole("cell", { name: nextSession.sessionDate })
          .first(),
      ).toBeVisible();
      await expect(
        this.page.nextSessionsTable.getByRole("cell", {
          name: nextSession.studentName,
        }),
      ).toBeVisible();
    }
  }

  async toHaveRecentSessions(recentSessions: RecentSession[]): Promise<void> {
    await expect(this.page.recentSessionsTable).toBeVisible();

    await expect(
      this.page.recentSessionsTable.locator("th").getByText("#"),
    ).toBeVisible();
    await expect(
      this.page.recentSessionsTable.locator("th").getByText("Session date"),
    ).toBeVisible();
    await expect(
      this.page.recentSessionsTable.locator("th").getByText("Student"),
    ).toBeVisible();
    await expect(
      this.page.recentSessionsTable.locator("th").getByText("Report completed"),
    ).toBeVisible();
    await expect(
      this.page.recentSessionsTable.locator("th").getByText("Signed off"),
    ).toBeVisible();
    await expect(
      this.page.recentSessionsTable.locator("th").getByText("Action"),
    ).toBeVisible();

    for (const recentSession of recentSessions) {
      await expect(
        this.page.recentSessionsTable
          .getByRole("cell")
          .getByText(recentSession.number, { exact: true }),
      ).toBeVisible();
      await expect(
        this.page.recentSessionsTable
          .getByRole("cell", { name: recentSession.sessionDate })
          .first(),
      ).toBeVisible();
      await expect(
        this.page.recentSessionsTable.getByRole("cell", {
          name: recentSession.studentName,
        }),
      ).toBeVisible();

      if (recentSession.reportCompletedOn !== null) {
        await expect(
          this.page.recentSessionsTable.getByTestId("completedOn"),
        ).toHaveText(recentSession.reportCompletedOn);
      } else {
        await expect(
          this.page.recentSessionsTable.getByTestId("not-completedOn"),
        ).toBeVisible();
      }

      if (recentSession.signOffOn !== null) {
        await expect(
          this.page.recentSessionsTable.getByTestId("signedOffOn"),
        ).toHaveText(recentSession.signOffOn);
      } else {
        await expect(
          this.page.recentSessionsTable.getByTestId("not-signedOffOn"),
        ).toBeVisible();
      }

      expect(
        await this.page.recentSessionsTable
          .getByRole("link", { name: "Report" })
          .count(),
      ).toBe(recentSessions.length);
    }
  }
}
