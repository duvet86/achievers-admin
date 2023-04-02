import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Body } from "~/components";

describe("Body", () => {
  it("Body snapshot admin", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Body
          isAdmin
          version="1"
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
      </MemoryRouter>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("Body snapshot mentor", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Body
          isAdmin
          version="1"
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
      </MemoryRouter>
    );

    expect(baseElement).toMatchSnapshot();
  });
});
