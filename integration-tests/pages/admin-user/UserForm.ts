import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class UserForm {
  private page: Page;

  label: Locator;
  profilePicture: Locator;

  emailInput: Locator;
  firstNameInput: Locator;
  lastNameInput: Locator;
  mobileInput: Locator;
  addressStreetInput: Locator;
  addressSuburbInput: Locator;
  addressStateInput: Locator;
  addressPostcodeInput: Locator;
  dateOfBirthInput: Locator;
  emergencyContactNameInput: Locator;
  emergencyContactNumberInput: Locator;
  emergencyContactAddressInput: Locator;
  emergencyContactRelationshipInput: Locator;
  additionalEmailInput: Locator;

  expect: UserFormAssertions;

  constructor(page: Page) {
    this.page = page;

    this.label = page.getByRole("heading", { name: "edit info for" });
    this.profilePicture = page.getByRole("figure");

    this.emailInput = page.getByLabel("Email", { exact: true });
    this.firstNameInput = page.getByLabel("First name");
    this.lastNameInput = page.getByLabel("Last name");
    this.mobileInput = page.getByLabel("Mobile");
    this.addressStreetInput = page.getByLabel("Address street");
    this.addressSuburbInput = page.getByLabel("Address suburb");
    this.addressStateInput = page.getByLabel("Address state");
    this.addressPostcodeInput = page.getByLabel("Address postcode");
    this.dateOfBirthInput = page.getByLabel("Date of birth");
    this.emergencyContactNameInput = page.getByLabel("Emergency contact name");
    this.emergencyContactNumberInput = page.getByLabel(
      "Emergency contact number"
    );
    this.emergencyContactAddressInput = page.getByLabel(
      "Emergency contact address"
    );
    this.emergencyContactRelationshipInput = page.getByLabel(
      "Emergency contact relationship"
    );
    this.additionalEmailInput = page.getByLabel("Additional email");

    this.expect = new UserFormAssertions(this);
  }

  async updateUserForm(
    firstNameValue: string,
    lastNameValue: string,
    mobileValue: string,
    addressStreetValue: string,
    addressSuburbValue: string,
    addressStateValue: string,
    addressPostcodeValue: string,
    dateOfBirthValue: string,
    emergencyContactNameValue: string,
    emergencyContactNumberValue: string,
    emergencyContactAddressValue: string,
    emergencyContactRelationshipValue: string,
    additionalEmailValue: string
  ): Promise<void> {
    await this.firstNameInput.fill(firstNameValue);
    await this.lastNameInput.fill(lastNameValue);
    await this.mobileInput.fill(mobileValue);
    await this.addressStreetInput.fill(addressStreetValue);
    await this.addressSuburbInput.fill(addressSuburbValue);
    await this.addressStateInput.fill(addressStateValue);
    await this.addressPostcodeInput.fill(addressPostcodeValue);
    await this.dateOfBirthInput.fill(dateOfBirthValue);
    await this.emergencyContactNameInput.fill(emergencyContactNameValue);
    await this.emergencyContactNumberInput.fill(emergencyContactNumberValue);
    await this.emergencyContactAddressInput.fill(emergencyContactAddressValue);
    await this.emergencyContactRelationshipInput.fill(
      emergencyContactRelationshipValue
    );
    await this.additionalEmailInput.fill(additionalEmailValue);
  }

  async saveForm(): Promise<void> {
    await this.page.getByRole("button", { name: "SAVE" }).click();
  }
}

class UserFormAssertions {
  constructor(private userForm: UserForm) { }

  async toHaveTitleForUser(userName: string): Promise<void> {
    await expect(this.userForm.label).toContainText(
      new RegExp(`Edit info for "${userName}"`, "g")
    );
  }

  async toHaveProfilePicture(): Promise<void> {
    await expect(this.userForm.profilePicture).toBeVisible();
  }

  async toHaveValues(
    emailValue: string,
    firstNameValue: string,
    lastNameValue: string,
    mobileValue: string,
    addressStreetValue: string,
    addressSuburbValue: string,
    addressStateValue: string,
    addressPostcodeValue: string,
    dateOfBirthValue: string,
    emergencyContactNameValue: string,
    emergencyContactNumberValue: string,
    emergencyContactAddressValue: string,
    emergencyContactRelationshipValue: string,
    additionalEmailValue: string
  ): Promise<void> {
    await expect(this.userForm.emailInput).toHaveValue(emailValue);
    await expect(this.userForm.emailInput).toHaveAttribute("disabled", "");

    await expect(this.userForm.firstNameInput).toHaveValue(firstNameValue);
    await expect(this.userForm.lastNameInput).toHaveValue(lastNameValue);
    await expect(this.userForm.mobileInput).toHaveValue(mobileValue);
    await expect(this.userForm.addressStreetInput).toHaveValue(
      addressStreetValue
    );
    await expect(this.userForm.addressSuburbInput).toHaveValue(
      addressSuburbValue
    );
    await expect(this.userForm.addressStateInput).toHaveValue(
      addressStateValue
    );
    await expect(this.userForm.addressPostcodeInput).toHaveValue(
      addressPostcodeValue
    );
    await expect(this.userForm.dateOfBirthInput).toHaveValue(dateOfBirthValue);
    await expect(this.userForm.emergencyContactNameInput).toHaveValue(
      emergencyContactNameValue
    );
    await expect(this.userForm.emergencyContactNumberInput).toHaveValue(
      emergencyContactNumberValue
    );
    await expect(this.userForm.emergencyContactAddressInput).toHaveValue(
      emergencyContactAddressValue
    );
    await expect(this.userForm.emergencyContactRelationshipInput).toHaveValue(
      emergencyContactRelationshipValue
    );
    await expect(this.userForm.additionalEmailInput).toHaveValue(
      additionalEmailValue
    );
  }
}
