import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class RoleForm {
  private page: Page;

  rolesHeaderCell: Locator;
  actionHeaderCell: Locator;

  rolesCell: Locator;
  actionCell: Locator;

  noRolesCell: Locator;

  expect: RoleFormAssertions;

  constructor(page: Page) {
    this.page = page;

    this.rolesHeaderCell = page.getByRole("cell", {
      name: "Roles",
      exact: true,
    });
    this.actionHeaderCell = page.getByRole("cell", { name: "ROLES ACTION" });

    this.noRolesCell = page.getByRole("cell", {
      name: "Mentor hasn't been invited into the system yet",
    });

    this.rolesCell = page.getByRole("cell", { name: "Mentor" });
    this.actionCell = page.getByRole("cell", { name: "Remove role" });

    this.expect = new RoleFormAssertions(this);
  }

  async inviteMentor(): Promise<void> {
    await this.page.getByRole("link", { name: "INVITE" }).click();
  }

  async removeRole(): Promise<void> {
    await this.page.getByRole("link", { name: "Remove" }).click();
  }
}

class RoleFormAssertions {
  constructor(private roleForm: RoleForm) {}

  async toHaveTableHeaders(): Promise<void> {
    await expect(this.roleForm.rolesHeaderCell).toBeVisible();
    await expect(this.roleForm.actionHeaderCell).toBeVisible();
  }

  async toHaveNoRolesCell(): Promise<void> {
    await expect(this.roleForm.noRolesCell).toBeVisible();
  }

  async toHaveTableRow(): Promise<void> {
    await expect(this.roleForm.rolesCell).toBeVisible();
    await expect(this.roleForm.actionCell).toBeVisible();
  }
}
