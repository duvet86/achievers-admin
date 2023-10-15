import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { BackHeader } from "~/components";

describe("BackHeader", () => {
  it("BackHeader snapshot", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <BackHeader />
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
