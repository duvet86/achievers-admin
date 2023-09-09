import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { SubmitFormButton } from "~/components";

describe("SubmitFormButton", () => {
  it("should have initial state", async () => {
    render(<SubmitFormButton />);

    expect(screen.getByRole("button")).toHaveTextContent("Save");
    expect(screen.getByTestId("message")).not.toHaveClass();
    expect(screen.getByTestId("container")).toHaveClass(
      "mt-6 flex items-center justify-between",
    );
  });

  it("should have stiky prop", async () => {
    render(<SubmitFormButton sticky />);

    expect(screen.getByTestId("container")).toHaveClass(
      "mt-6 flex items-center justify-between sticky bottom-0",
    );
  });

  it("should have custom success message", async () => {
    render(<SubmitFormButton successMessage="success" />);

    expect(screen.getByTestId("message")).toHaveTextContent("success");
  });

  it("should have custom error message", async () => {
    render(<SubmitFormButton errorMessage="error" />);

    expect(screen.getByTestId("message")).toHaveTextContent("error");
  });

  it("should have custom label", async () => {
    render(<SubmitFormButton label="test" />);

    expect(screen.getByRole("button")).toHaveTextContent("test");
  });
});
