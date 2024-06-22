import { render, screen } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";

import { json } from "@remix-run/node";

import Page from "./route";

describe("Admin /users", () => {
  it("should return empty list", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return json({
            chapters: [],
            count: 0,
            users: [],
            currentPageNumber: 0,
            range: [],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const rows = await screen.findAllByRole("row");

    expect(rows[0]).toHaveTextContent(
      /#Full nameEmailAssigned chapter# Checks completedAction/,
    );
    expect(rows[1]).toHaveTextContent(/No users/);
  });

  it("should return list of users", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return json({
            chapters: [],
            count: 1,
            currentPageNumber: 0,
            range: [],
            users: [
              {
                id: 1,
                email: "test@test.com",
                fullName: "Test User",
                chapter: {
                  name: "Chapter 1",
                },
              },
            ],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const rows = await screen.findAllByRole("row");

    expect(rows[0]).toHaveTextContent(
      /#Full nameEmailAssigned chapter# Checks completedAction/,
    );
    expect(rows[1]).toHaveTextContent(/Test Usertest@test.comChapter 1\/8Edit/);
  });

  it("should have title", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return json({
            chapters: [],
            count: 0,
            currentPageNumber: 0,
            range: [],
            users: [],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const title = await screen.findByRole("heading", { name: "Mentors" });

    expect(title).toBeVisible();
  });

  it("should have link to 'import from file'", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: Page,
        loader() {
          return json({
            chapters: [],
            count: 0,
            currentPageNumber: 0,
            range: [],
            users: [],
          });
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
