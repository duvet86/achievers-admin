import "@testing-library/jest-dom";

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";

import { Input } from "~/components";

describe("Input", () => {
  it("should display label", () => {
    render(<Input name="text" label="test" />);

    expect(screen.getByTestId("textinput")).toBeInTheDocument();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", () => {
    render(<Input name="text" label="test" required />);

    expect(screen.getByTestId("textinput")).toBeInTheDocument();
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });

  it("should have initial value", () => {
    render(<Input name="text" label="test" defaultValue="test input" />);

    expect(screen.getByTestId("textinput")).toHaveValue("test input");
  });
});
