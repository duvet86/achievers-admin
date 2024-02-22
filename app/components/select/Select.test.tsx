import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { Select } from "~/components";

describe("Select", () => {
  it("should display label", async () => {
    render(
      <Select
        name="select"
        label="test"
        options={[{ value: "value", label: "label" }]}
      />,
    );

    expect(screen.getByTestId("select")).toBeInTheDocument();
    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", async () => {
    render(
      <Select
        name="select"
        label="test"
        required
        options={[{ value: "value", label: "label" }]}
      />,
    );

    expect(screen.getByTestId("select")).toBeInTheDocument();
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });

  it("should have initial value", async () => {
    render(
      <Select
        name="select"
        label="test"
        defaultValue="value"
        options={[{ value: "value", label: "label" }]}
      />,
    );

    expect(screen.getByTestId("select")).toHaveValue("value");
  });

  it("should ignore missing value", async () => {
    render(
      <Select
        name="select"
        label="test"
        defaultValue="notARealValue"
        options={[
          { value: "", label: "label 1" },
          { value: "value", label: "label 2" },
        ]}
      />,
    );

    expect(screen.getByTestId("select")).toHaveValue("");
  });
});
