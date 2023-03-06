import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navbar from "~/components/Navbar";

test("Header snapshot", async () => {
  const { baseElement } = render(
    <MemoryRouter>
      <Navbar
        isAdmin={true}
        version="1"
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
