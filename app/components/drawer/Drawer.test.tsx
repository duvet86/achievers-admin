import "@testing-library/jest-dom";

import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { Drawer } from "~/components";

describe("Drawer", () => {
  it("should display links for admin", () => {
    render(
      <MemoryRouter>
        <Drawer
          currentView="admin"
          isMentorAndAdmin={false}
          linkMappings={{
            User: true,
            Student: true,
            Session: true,
            Chapter: true,
            SchoolTerm: true,
            Config: true,
          }}
        />
      </MemoryRouter>,
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(7);

    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/admin/home");

    expect(links[1]).toHaveTextContent("Mentors");
    expect(links[1]).toHaveAttribute("href", "/admin/users");

    expect(links[2]).toHaveTextContent("Students");
    expect(links[2]).toHaveAttribute("href", "/admin/students");

    expect(links[3]).toHaveTextContent("Sessions/Reports");
    expect(links[3]).toHaveAttribute("href", "/admin/sessions");

    expect(links[4]).toHaveTextContent("Chapters");
    expect(links[4]).toHaveAttribute("href", "/admin/chapters");

    expect(links[5]).toHaveTextContent("School Terms");
    expect(links[5]).toHaveAttribute("href", "/admin/school-terms");

    expect(links[6]).toHaveTextContent("Config");
    expect(links[6]).toHaveAttribute("href", "/admin/config");
  });

  it("should display links for mentor", () => {
    render(
      <MemoryRouter>
        <Drawer
          currentView="mentor"
          isMentorAndAdmin={false}
          linkMappings={{}}
        />
      </MemoryRouter>,
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links.length).toBe(5);

    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/mentor/home");

    expect(links[1]).toHaveTextContent("Roster/Reports");
    expect(links[1]).toHaveAttribute("href", "/mentor/roster");

    expect(links[2]).toHaveTextContent("My Students");
    expect(links[2]).toHaveAttribute("href", "/mentor/students");

    expect(links[3]).toHaveTextContent("My Partner");
    expect(links[3]).toHaveAttribute("href", "/mentor/partner");

    expect(links[4]).toHaveTextContent("Policy");
    expect(links[4]).toHaveAttribute("href", "/mentor/policy");
  });

  it("should display swap app link if both mentor and admin", () => {
    render(
      <MemoryRouter>
        <Drawer
          currentView="admin"
          isMentorAndAdmin={true}
          linkMappings={{
            User: true,
            Student: true,
            Session: true,
            Chapter: true,
            SchoolTerm: true,
            Config: true,
          }}
        />
      </MemoryRouter>,
    );

    const links: HTMLAnchorElement[] = screen.getAllByRole("link");

    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/admin/home");

    expect(links[1]).toHaveTextContent("Mentors");
    expect(links[1]).toHaveAttribute("href", "/admin/users");

    expect(links[2]).toHaveTextContent("Students");
    expect(links[2]).toHaveAttribute("href", "/admin/students");

    expect(links[3]).toHaveTextContent("Sessions/Reports");
    expect(links[3]).toHaveAttribute("href", "/admin/sessions");

    expect(links[4]).toHaveTextContent("Chapters");
    expect(links[4]).toHaveAttribute("href", "/admin/chapters");

    expect(links[5]).toHaveTextContent("School Terms");
    expect(links[5]).toHaveAttribute("href", "/admin/school-terms");

    expect(links[6]).toHaveTextContent("Config");
    expect(links[6]).toHaveAttribute("href", "/admin/config");

    expect(links[7]).toHaveTextContent("Mentor View");
    expect(links[7]).toHaveAttribute("href", "/mentor/home");
  });
});
