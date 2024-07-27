import "@testing-library/jest-dom";

import { render } from "@testing-library/react";

import { SubTitle } from "~/components";

describe("SubTitle", () => {
  it("should display component", () => {
    const { baseElement } = render(<SubTitle>Test</SubTitle>);

    expect(baseElement).toMatchSnapshot();
  });
});
