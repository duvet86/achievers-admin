import type { Page } from "@playwright/test";

import { UserForm } from "./UserForm";
import { RoleForm } from "./RoleForm";

export class AdminUserPage {
  userForm: UserForm;
  roleForm: RoleForm;

  constructor(page: Page) {
    this.userForm = new UserForm(page);
    this.roleForm = new RoleForm(page);
  }
}
