import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Navbar } from "~/components";

describe("Navbar", () => {
  it("Navbar snapshot", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Navbar
          environment="local"
          currentUser={{
            appRoleAssignments: [],
            displayName: "",
            givenName: "",
            id: "1",
            mail: "test@test.com",
            surname: "",
            userPrincipalName: "",
            email: "",
          }}
        />
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
