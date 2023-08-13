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

  it("should have custom message", async () => {
    render(<SubmitFormButton message="test" />);

    expect(screen.getByTestId("message")).toHaveTextContent("test");
  });

  it("should have custom label", async () => {
    render(<SubmitFormButton label="test" />);

    expect(screen.getByRole("button")).toHaveTextContent("test");
  });
});
