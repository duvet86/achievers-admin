import "@testing-library/jest-dom";

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";

import { DateInput } from "~/components";

describe("DateInput", () => {
  it("should display label", async () => {
    render(<DateInput name="date" label="test" />);

    expect(screen.getByTestId("dateinput")).toHaveValue("");
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", async () => {
    render(<DateInput name="date" label="test" required />);

    expect(screen.getByTestId("dateinput")).toHaveValue("");
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });

  it("should have initial value type date", async () => {
    render(
      <DateInput
        name="date"
        label="test"
        defaultValue={new Date(1995, 11, 17)}
      />,
    );

    expect(screen.getByTestId("dateinput")).toHaveValue("1995-12-17");
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should have initial value type string", async () => {
    render(<DateInput name="date" label="test" defaultValue="1995-12-17" />);

    expect(screen.getByTestId("dateinput")).toHaveValue("1995-12-17");
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });
});
