import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Title } from "~/components";

describe("Title", () => {
  it("should display component", () => {
    const { baseElement } = render(<Title>Test</Title>);

    expect(baseElement).toMatchSnapshot();
  });

  it("should display component with back header", () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Title>Test</Title>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("should display component with class names", () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Title className="mb-4">Test</Title>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
