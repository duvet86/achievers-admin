import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import testUserEvent from "@testing-library/user-event";

import { SelectSearch } from "./SelectSearch";

const user = testUserEvent.setup();

describe("SelectSearch", () => {
  it("should have attributes", async () => {
    const availableStudents = [
      {
        id: 1,
        firstName: "Luca",
        lastName: "Mara",
      },
      {
        id: 2,
        firstName: "Hugo",
        lastName: "Kant",
      },
      {
        id: 3,
        firstName: "User",
        lastName: "User",
      },
    ];

    render(
      <SelectSearch
        name="selectedStudentId"
        placeholder="start typing to select a student"
        options={availableStudents.map(({ id, firstName, lastName }) => ({
          label: `${firstName} ${lastName}`,
          value: id.toString(),
        }))}
      />,
    );

    expect(
      screen.getByPlaceholderText("start typing to select a student"),
    ).toBeInTheDocument();

    const hiddenInput = screen.getByTestId("autocomplete-hidden");

    expect(hiddenInput).toHaveAttribute("name", "selectedStudentId");
  });

  it("should click on list option", async () => {
    const availableStudents = [
      {
        id: 1,
        firstName: "Luca",
        lastName: "Mara",
      },
      {
        id: 2,
        firstName: "Hugo",
        lastName: "Kant",
      },
      {
        id: 3,
        firstName: "User",
        lastName: "User",
      },
    ];

    render(
      <SelectSearch
        name="selectedStudentId"
        placeholder="start typing to select a student"
        options={availableStudents.map(({ id, firstName, lastName }) => ({
          label: `${firstName} ${lastName}`,
          value: id.toString(),
        }))}
      />,
    );

    const input = screen.getByPlaceholderText(
      "start typing to select a student",
    );

    await user.type(input, "luc");
    await user.click(screen.getByRole("button", { name: "Luca Mara" }));

    const hiddenInput = screen.getByTestId("autocomplete-hidden");

    expect(hiddenInput).toHaveValue("1");
  });

  it("should clear text", async () => {
    const availableStudents = [
      {
        id: 1,
        firstName: "Luca",
        lastName: "Mara",
      },
      {
        id: 2,
        firstName: "Hugo",
        lastName: "Kant",
      },
      {
        id: 3,
        firstName: "User",
        lastName: "User",
      },
    ];

    render(
      <SelectSearch
        name="selectedStudentId"
        placeholder="start typing to select a student"
        options={availableStudents.map(({ id, firstName, lastName }) => ({
          label: `${firstName} ${lastName}`,
          value: id.toString(),
        }))}
      />,
    );

    const input = screen.getByPlaceholderText(
      "start typing to select a student",
    );

    await user.type(input, "luc");
    await user.click(screen.getByTestId("clear-text"));

    const hiddenInput = screen.getByTestId("autocomplete-hidden");

    expect(input).toHaveValue("");
    expect(hiddenInput).toHaveValue("");
  });
});
