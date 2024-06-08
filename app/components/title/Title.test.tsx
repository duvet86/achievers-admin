import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { Title } from "~/components";

describe("Title", () => {
  it("should display component", async () => {
    const { baseElement } = render(<Title>Test</Title>);

    expect(baseElement).toMatchSnapshot();
  });

  it("should display component with back header", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Title to="/">Test</Title>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("should display component with class names", async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Title className="mb-4" to="/">
          Test
        </Title>
      </MemoryRouter>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
