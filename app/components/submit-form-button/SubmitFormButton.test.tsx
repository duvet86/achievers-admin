import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { SubmitFormButton } from "~/components";

describe("SubmitFormButton", () => {
  it("should have initial state", () => {
    render(<SubmitFormButton />);

    expect(screen.getByRole("button")).toHaveTextContent("Save");
    expect(screen.getByTestId("message")).not.toHaveClass();
    expect(screen.getByTestId("container")).toHaveClass("flex");
  });

  it("should have stiky prop", () => {
    render(<SubmitFormButton sticky />);

    expect(screen.getByTestId("container")).toHaveClass("flex sticky bottom-0");
  });

  it("should have custom success message", () => {
    render(<SubmitFormButton successMessage="success" />);

    expect(screen.getByTestId("message")).toHaveTextContent("success");
  });

  it("should have custom error message", () => {
    render(<SubmitFormButton errorMessage="error" />);

    expect(screen.getByTestId("message")).toHaveTextContent("error");
  });

  it("should have custom label", () => {
    render(<SubmitFormButton label="test" />);

    expect(screen.getByRole("button")).toHaveTextContent("test");
  });
});
