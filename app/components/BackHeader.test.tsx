import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { BackHeader } from "~/components";

describe("BackHeader", () => {
  test("BackHeader snapshot", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <BackHeader />
      </MemoryRouter>
    );

    expect(baseElement).toMatchSnapshot();
  });

  test("should have href defined via prop", async () => {
    render(
      <MemoryRouter>
        <BackHeader to="/test" />
      </MemoryRouter>
    );

    expect(screen.getByText("Back")).toHaveAttribute("href", "/test");
  });
});
