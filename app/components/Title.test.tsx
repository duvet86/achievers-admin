import "@testing-library/jest-dom";

import { render } from "@testing-library/react";

import { Title } from "~/components";

describe("Title", () => {
  it("should display component", async () => {
    const { baseElement } = render(<Title>Test</Title>);

    expect(baseElement).toMatchSnapshot();
  });
});
