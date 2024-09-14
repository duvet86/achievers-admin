import "@testing-library/jest-dom";

import { render } from "@testing-library/react";

import { Text } from "~/components";

describe("Text", () => {
  it("should display component", () => {
    const { baseElement } = render(
      <Text label="test label" text="test text" />,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
