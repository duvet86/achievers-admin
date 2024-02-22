import "@testing-library/jest-dom";

import { render } from "@testing-library/react";

import { LoadingSpinner } from "~/components";

describe("LoadingSpinner", () => {
  it("LoadingSpinner snapshot", async () => {
    const { baseElement } = render(<LoadingSpinner />);

    expect(baseElement).toMatchSnapshot();
  });

  it("LoadingSpinner snapshot dark large", async () => {
    const { baseElement } = render(<LoadingSpinner dark large />);

    expect(baseElement).toMatchSnapshot();
  });
});
