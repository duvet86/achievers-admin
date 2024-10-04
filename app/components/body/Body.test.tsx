import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Body } from "~/components";

describe("Body", () => {
  it("Body snapshot admin", () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Body
          currentView="admin"
          isMentorAndAdmin={false}
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
        >
          Test
        </Body>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("Body snapshot mentor", () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Body
          currentView="mentor"
          isMentorAndAdmin={false}
          version="1"
          environment="local"
          userName="test@test.com"
          linkMappings={{}}
        >
          Test
        </Body>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("Body snapshot mentor and admin permissions", () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Body
          currentView="admin"
          isMentorAndAdmin={true}
          version="1"
          environment="local"
          userName="test@test.com"
          linkMappings={{}}
        >
          Test
        </Body>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
