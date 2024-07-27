import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { Textarea } from "~/components";

describe("Input", () => {
  it("should display label", () => {
    render(<Textarea name="text" label="test" />);

    expect(screen.getByTestId("textarea")).toBeInTheDocument();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", () => {
    render(<Textarea name="text" label="test" required />);

    expect(screen.getByTestId("textarea")).toBeInTheDocument();
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });

  it("should have initial value", () => {
    render(<Textarea name="text" label="test" defaultValue="test input" />);

    expect(screen.getByTestId("textarea")).toHaveValue("test input");
  });
});
