import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/react";

import { Message } from "./Message";

describe("Message", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should hide the success message after 3 seconds", () => {
    render(<Message successMessage="Saved" result={{}} />);

    expect(screen.getByTestId("message")).toHaveTextContent("Saved");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("message")).toHaveTextContent("");
  });

  it("should show the success message again only for a new result", () => {
    const result = { successMessage: "Saved" };
    const { rerender } = render(
      <Message successMessage="Saved" result={result} />,
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    rerender(<Message successMessage="Saved" result={result} />);
    expect(screen.getByTestId("message")).toHaveTextContent("");

    rerender(<Message successMessage="Saved" result={{ ...result }} />);
    expect(screen.getByTestId("message")).toHaveTextContent("Saved");
  });

  it("should always show the error message", () => {
    render(<Message successMessage={null} errorMessage="Failed" />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("message")).toHaveTextContent("Failed");
  });
});
