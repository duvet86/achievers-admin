import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { Checkbox } from "~/components";

describe("Checkbox", () => {
  it("should display label", async () => {
    render(<Checkbox name="checkbox" label="test" defaultChecked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", async () => {
    render(<Checkbox name="checkbox" label="test" required />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });
});
