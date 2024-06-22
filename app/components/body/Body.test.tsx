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
          environment="local"
          userName="test@test.com"
          linkMappings={{
            User: true,
            Student: true,
            Session: true,
            Chapter: true,
            SchoolTerm: true,
            Config: true,
          }}
        />
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("Body snapshot mentor", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Body
          isAdmin={false}
          hasCompletedVolunteerAgreement
          version="1"
          environment="local"
          userName="test@test.com"
          linkMappings={{}}
        />
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
