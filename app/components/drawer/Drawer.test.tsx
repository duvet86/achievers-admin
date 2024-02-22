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

    expect(links.length).toBe(5);

    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/admin/home");

    expect(links[1]).toHaveTextContent("Mentors");
    expect(links[1]).toHaveAttribute("href", "/admin/users");

    expect(links[2]).toHaveTextContent("Students");
    expect(links[2]).toHaveAttribute("href", "/admin/students");

    expect(links[3]).toHaveTextContent("Chapters");
    expect(links[3]).toHaveAttribute("href", "/admin/chapters");

    expect(links[4]).toHaveTextContent("School Terms");
    expect(links[4]).toHaveAttribute("href", "/admin/school-terms");
  });

  it("should display links for mentor", async () => {
    render(
      <MemoryRouter>
        <Drawer isAdmin={false} />
      </MemoryRouter>,
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(5);
    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/mentor/home");

    expect(links[1]).toHaveTextContent("My Students");
    expect(links[1]).toHaveAttribute("href", "/mentor/students");

    expect(links[2]).toHaveTextContent("My Partner");
    expect(links[2]).toHaveAttribute("href", "/mentor/partner");

    expect(links[3]).toHaveTextContent("Roster");
    expect(links[3]).toHaveAttribute("href", "/mentor/roster");

    expect(links[4]).toHaveTextContent("Policy");
    expect(links[4]).toHaveAttribute("href", "/mentor/policy");
  });
});
