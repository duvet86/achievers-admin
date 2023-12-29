import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Drawer } from "~/components";

describe("Drawer", () => {
  it("should display links for admin", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin />
      </MemoryRouter>,
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(4);

    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/admin/home");

    expect(links[1]).toHaveTextContent("Mentors");
    expect(links[1]).toHaveAttribute("href", "/admin/users");

    expect(links[2]).toHaveTextContent("Students");
    expect(links[2]).toHaveAttribute("href", "/admin/students");

    expect(links[3]).toHaveTextContent("Chapters");
    expect(links[3]).toHaveAttribute("href", "/admin/chapters");
  });

  it("should display links for mentor", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin={false} />
      </MemoryRouter>,
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(2);
    expect(links[0]).toHaveTextContent("Roster");
    expect(links[0]).toHaveAttribute("href", "/mentor/roster");

    expect(links[1]).toHaveTextContent("My Mentees");
    expect(links[1]).toHaveAttribute("href", "/mentor/mentees");
  });

  it("should display version", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin={false} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("version")).toHaveTextContent("Version 1");
  });
});
