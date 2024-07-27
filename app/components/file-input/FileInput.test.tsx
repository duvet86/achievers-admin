import "@testing-library/jest-dom";

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";

import { FileInput } from "~/components";

describe("FileInput", () => {
  it("should display label", () => {
    render(<FileInput name="file" label="test" />);

    expect(screen.getByTestId("fileinput")).toBeInTheDocument();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", () => {
    render(<FileInput name="file" label="test" required />);

    expect(screen.getByTestId("fileinput")).toBeInTheDocument();
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });
});
