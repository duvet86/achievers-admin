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

  sessionsTable: Locator;

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

    this.sessionsTable = page.getByTestId("sessions");

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

  async toHaveSessions(sessions: RecentSession[]): Promise<void> {
    await expect(this.page.sessionsTable).toBeVisible();

    await expect(
      this.page.sessionsTable.locator("th").getByText("#"),
    ).toBeVisible();
    await expect(
      this.page.sessionsTable.locator("th").getByText("Session date"),
    ).toBeVisible();
    await expect(
      this.page.sessionsTable.locator("th").getByText("Student"),
    ).toBeVisible();
    await expect(
      this.page.sessionsTable.locator("th").getByText("Report completed"),
    ).toBeVisible();
    await expect(
      this.page.sessionsTable.locator("th").getByText("Signed off"),
    ).toBeVisible();
    await expect(
      this.page.sessionsTable.locator("th").getByText("Action"),
    ).toBeVisible();

    for (const session of sessions) {
      await expect(
        this.page.sessionsTable
          .getByRole("cell")
          .getByText(session.number, { exact: true }),
      ).toBeVisible();
      await expect(
        this.page.sessionsTable
          .getByRole("cell", { name: session.sessionDate })
          .first(),
      ).toBeVisible();
      await expect(
        this.page.sessionsTable.getByRole("cell", {
          name: session.studentName,
        }),
      ).toBeVisible();

      if (session.reportCompletedOn !== null) {
        await expect(
          this.page.sessionsTable.getByTestId("completedOn"),
        ).toHaveText(session.reportCompletedOn);
      } else {
        await expect(
          this.page.sessionsTable.getByTestId("not-completedOn"),
        ).toBeVisible();
      }

      if (session.signOffOn !== null) {
        await expect(
          this.page.sessionsTable.getByTestId("signedOffOn"),
        ).toHaveText(session.signOffOn);
      } else {
        await expect(
          this.page.sessionsTable.getByTestId("not-signedOffOn"),
        ).toBeVisible();
      }

      expect(
        await this.page.sessionsTable
          .getByRole("link", { name: "Report" })
          .count(),
      ).toBe(sessions.length);
    }
  }
}
