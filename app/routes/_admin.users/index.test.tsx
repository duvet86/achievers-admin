import { render, screen } from "@testing-library/react";
import { unstable_createRemixStub } from "@remix-run/testing";

import { json } from "@remix-run/node";

import Page from "./index";

describe("Admin /users", () => {
  it("should return empty list", async () => {
    let RemixStub = unstable_createRemixStub([
      {
        path: "/",
        element: <Page />,
        loader() {
          return json({
            count: 0,
            users: [],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const rows = await screen.findAllByRole("row");

    expect(rows[0]).toHaveTextContent(/Full NameEmailAssigned ChapterAction/);
    expect(rows[1]).toHaveTextContent(/No users/);
  });

  it("should return list of users", async () => {
    let RemixStub = unstable_createRemixStub([
      {
        path: "/",
        element: <Page />,
        loader() {
          return json({
            count: 1,
            users: [
              {
                id: 1,
                email: "test@test.com",
                firstName: "Test",
                lastName: "User",
                userAtChapter: [
                  {
                    chapter: {
                      name: "Chapter 1",
                    },
                  },
                ],
              },
            ],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const rows = await screen.findAllByRole("row");

    expect(rows[0]).toHaveTextContent(/Full NameEmailAssigned ChapterAction/);
    expect(rows[1]).toHaveTextContent(/Test Usertest@test.comChapter 1Edit/);
  });

  it("should have title", async () => {
    let RemixStub = unstable_createRemixStub([
      {
        path: "/",
        element: <Page />,
        loader() {
          return json({
            count: 0,
            users: [],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const title = await screen.findByTestId("title");

    expect(title).toHaveTextContent(/Users/);
  });

  it("should have link to 'import from file'", async () => {
    let RemixStub = unstable_createRemixStub([
      {
        path: "/",
        element: <Page />,
        loader() {
          return json({
            count: 0,
            users: [],
          });
        },
      },
    ]);

    render(<RemixStub />);

    const link = await screen.findByRole("link");

    expect(link).toHaveTextContent(/Import users from file/);
  });
});
