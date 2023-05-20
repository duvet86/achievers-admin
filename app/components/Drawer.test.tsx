import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Drawer } from "~/components";

describe("Drawer", () => {
  it("should display links for admin", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin version="1" />
      </MemoryRouter>
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(2);
    expect(links[0]).toHaveTextContent("Mentors");
    expect(links[0]).toHaveAttribute("href", "/users");

    expect(links[1]).toHaveTextContent("Chapters");
    expect(links[1]).toHaveAttribute("href", "/chapters");
  });

  it("should display links for mentor", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin={false} version="1" />
      </MemoryRouter>
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(2);
    expect(links[0]).toHaveTextContent("Roster");
    expect(links[0]).toHaveAttribute("href", "/roster");

    expect(links[1]).toHaveTextContent("My Mentees");
    expect(links[1]).toHaveAttribute("href", "/mentees");
  });

  it("should display version", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin={false} version="1" />
      </MemoryRouter>
    );

    expect(screen.getByTestId("version")).toHaveTextContent("Version 1");
  });
});
