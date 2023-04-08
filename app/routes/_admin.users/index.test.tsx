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
            users: [
              {
                id: 1,
                azureADId: null,
                email: "test@test.com",
                firstName: "Test",
                lastName: "User",
                mobile: "",
                addressStreet: "",
                addressSuburb: "",
                addressState: "",
                addressPostcode: "",
                additionalEmail: null,
                dateOfBirth: null,
                emergencyContactName: null,
                emergencyContactNumber: null,
                emergencyContactAddress: null,
                emergencyContactRelationship: null,
                nextOfKinName: null,
                nextOfKinNumber: null,
                nextOfKinAddress: null,
                nextOfKinRelationship: null,
                profilePicturePath: null,
                hasApprovedToPublishPhotos: null,
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                chapterId: "",
                chapter: {
                  id: "",
                  name: "Chapter 1",
                  address: "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
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
