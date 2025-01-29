import "@testing-library/jest-dom";

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";

import { Checkbox } from "~/components";

describe("Checkbox", () => {
  it("should display label", () => {
    render(<Checkbox name="checkbox" label="test" defaultChecked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", () => {
    render(<Checkbox name="checkbox" label="test" required />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByRole("checkbox")).toHaveAttribute("required");
  });
});
