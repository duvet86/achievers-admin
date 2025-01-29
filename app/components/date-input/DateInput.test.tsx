import "@testing-library/jest-dom";

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";

import { DateInput } from "~/components";

describe("DateInput", () => {
  it("should display label", () => {
    render(<DateInput name="date" label="test" />);

    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", () => {
    render(<DateInput name="date" label="test" required />);

    expect(screen.getByLabelText("test")).toHaveAttribute("required");
  });

  it("should have initial value type date", () => {
    render(
      <DateInput
        name="date"
        label="test"
        defaultValue={new Date(1995, 11, 17)}
      />,
    );

    expect(screen.getByLabelText("test")).toHaveValue("1995-12-17");
  });

  it("should have initial value type string", () => {
    render(<DateInput name="date" label="test" defaultValue="1995-12-17" />);

    expect(screen.getByLabelText("test")).toHaveValue("1995-12-17");
  });
});
