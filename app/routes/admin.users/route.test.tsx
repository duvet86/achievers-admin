import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";

import Page from "./route";

describe("Admin /users", () => {
  it("should return empty list", async () => {
    const RemixStub = createRoutesStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return {
            chapters: [],
            count: 0,
            users: [],
            currentPageNumber: 0,
            range: [],
            searchTerm: null,
            chapterId: null,
            onlyExpiredChecks: false,
            includeArchived: false,
            includeCompleteChecks: false,
          };
        },
      },
    ]);

    render(<RemixStub />);

    const rows = await screen.findAllByRole("row");

    expect(rows[0]).toHaveTextContent(
      /#Full nameAssigned chapterCreated At# Checks completedAction/,
    );
    expect(rows[1]).toHaveTextContent(/No users/);
  });

  it("should return list of users", async () => {
    const RemixStub = createRoutesStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return {
            chapters: [],
            count: 1,
            currentPageNumber: 0,
            range: [],
            users: [
              {
                id: 1,
                fullName: "Test User",
                chapterName: "Chapter 1",
                volunteerAgreementSignedOn: null,
                endDate: null,
                policeCheckExpiryDate: null,
                policeCheckReminderSentAt: null,
                wwccheckExpiryDate: null,
                wwccheckReminderSentAt: null,
                checksCompleted: 2,
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
              },
            ],
            searchTerm: null,
            chapterId: null,
            onlyExpiredChecks: false,
            includeArchived: false,
            includeCompleteChecks: false,
          };
        },
      },
    ]);

    render(<RemixStub />);

    const rows = await screen.findAllByRole("row");

    expect(rows[0]).toHaveTextContent(
      /#Full nameAssigned chapterCreated At# Checks completedAction/,
    );
    expect(rows[1]).toHaveTextContent(
      /1 Test UserChapter 101\/01\/20252\/8Edit/,
    );
  });

  it("should have title", async () => {
    const RemixStub = createRoutesStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return {
            chapters: [],
            count: 0,
            currentPageNumber: 0,
            range: [],
            users: [],
            searchTerm: null,
            chapterId: null,
            onlyExpiredChecks: false,
            includeArchived: false,
            includeCompleteChecks: false,
          };
        },
      },
    ]);

    render(<RemixStub />);

    const title = await screen.findByRole("heading", { name: "Mentors" });

    expect(title).toBeVisible();
  });

  it("should have link to 'import from file'", async () => {
    const RemixStub = createRoutesStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return {
            chapters: [],
            count: 0,
            currentPageNumber: 0,
            range: [],
            users: [],
            searchTerm: null,
            chapterId: null,
            onlyExpiredChecks: false,
            includeArchived: false,
            includeCompleteChecks: false,
          };
        },
      },
    ]);

    render(<RemixStub />);

    const link = await screen.findByRole("link", {
      name: "Import mentors",
    });

    expect(link).toBeVisible();
  });
});
