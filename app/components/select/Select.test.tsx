import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { Select } from "~/components";

describe("Select", () => {
  it("should display label", () => {
    render(
      <Select
        name="select"
        label="test"
        options={[{ value: "value", label: "label" }]}
      />,
    );

    expect(screen.getByLabelText("test")).toBeInTheDocument();
  });

  it("should display required", () => {
    render(
      <Select
        name="select"
        label="test"
        required
        options={[{ value: "value", label: "label" }]}
      />,
    );

    expect(screen.getByLabelText("test")).toHaveAttribute("required");
  });

  it("should have initial value", () => {
    render(
      <Select
        name="select"
        label="test"
        defaultValue="value"
        options={[{ value: "value", label: "label" }]}
      />,
    );

    expect(screen.getByLabelText("test")).toHaveValue("value");
  });

  it("should ignore missing value", () => {
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

    expect(screen.getByLabelText("test")).toHaveValue("");
  });
});
