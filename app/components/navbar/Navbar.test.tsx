import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Navbar } from "~/components";

describe("Navbar", () => {
  it("Navbar snapshot", () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Navbar environment="local" userName="test@test.com" version="1" />
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
