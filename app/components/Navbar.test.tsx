import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Navbar } from "~/components";

test("Header snapshot", async () => {
  const { baseElement } = render(
    <MemoryRouter>
      <Navbar
        currentUser={{
          appRoleAssignments: [],
          displayName: "",
          givenName: "",
          id: "",
          mail: "",
          surname: "",
          userPrincipalName: "",
          email: "",
        }}
      />
    </MemoryRouter>
  );

  expect(baseElement).toMatchSnapshot();
});
