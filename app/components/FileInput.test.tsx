import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { FileInput } from "~/components";

describe("FileInput", () => {
  it("should display label", async () => {
    render(<FileInput name="file" label="test" />);

    expect(screen.getByTestId("fileinput")).toBeInTheDocument();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", async () => {
    render(<FileInput name="file" label="test" required />);

    expect(screen.getByTestId("fileinput")).toBeInTheDocument();
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });
});
