import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";
import { CHAPTER_DATA } from "integration-tests/test-data";

interface FormQuery {
  email: string;
  chapter: string;
  firstName: string;
  lastName: string;
  mobile: string;
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactAddress: string;
  emergencyContactRelationship: string;
  additionalEmail: string;
}

interface FormCommand {
  chapter: string;
  firstName: string;
  lastName: string;
  mobile: string;
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactAddress: string;
  emergencyContactRelationship: string;
  additionalEmail: string;
}

export class UserForm {
  private page: Page;

  profilePicture: Locator;

  emailInput: Locator;
  chapterSelect: Locator;
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

    this.profilePicture = page.getByRole("figure");

    this.emailInput = page.getByLabel("Email", { exact: true });
    this.chapterSelect = page.getByLabel("Chapter");
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
      "Emergency contact number",
    );
    this.emergencyContactAddressInput = page.getByLabel(
      "Emergency contact address",
    );
    this.emergencyContactRelationshipInput = page.getByLabel(
      "Emergency contact relationship",
    );
    this.additionalEmailInput = page.getByLabel("Additional email");

    this.expect = new UserFormAssertions(this);
  }

  async updateUserForm({
    chapter,
    firstName,
    lastName,
    mobile,
    addressStreet,
    addressSuburb,
    addressState,
    addressPostcode,
    dateOfBirth,
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
    additionalEmail,
  }: FormCommand): Promise<void> {
    await this.chapterSelect.selectOption({ label: chapter });
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.mobileInput.fill(mobile);
    await this.addressStreetInput.fill(addressStreet);
    await this.addressSuburbInput.fill(addressSuburb);
    await this.addressStateInput.fill(addressState);
    await this.addressPostcodeInput.fill(addressPostcode);
    await this.dateOfBirthInput.fill(dateOfBirth);
    await this.emergencyContactNameInput.fill(emergencyContactName);
    await this.emergencyContactNumberInput.fill(emergencyContactNumber);
    await this.emergencyContactAddressInput.fill(emergencyContactAddress);
    await this.emergencyContactRelationshipInput.fill(
      emergencyContactRelationship,
    );
    await this.additionalEmailInput.fill(additionalEmail);
  }

  async saveForm(): Promise<void> {
    await this.page.getByRole("button", { name: "Save" }).click();
  }
}

class UserFormAssertions {
  constructor(private userForm: UserForm) {}

  async toHaveProfilePicture(): Promise<void> {
    await expect(this.userForm.profilePicture).toBeVisible();
  }

  async toHaveValues({
    chapter,
    email,
    firstName,
    lastName,
    mobile,
    addressStreet,
    addressSuburb,
    addressState,
    addressPostcode,
    dateOfBirth,
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
    additionalEmail,
  }: FormQuery): Promise<void> {
    await expect(this.userForm.chapterSelect).toHaveValue(
      CHAPTER_DATA[chapter],
    );
    await expect(this.userForm.emailInput).toHaveValue(email);
    await expect(this.userForm.emailInput).toHaveAttribute("disabled", "");

    await expect(this.userForm.firstNameInput).toHaveValue(firstName);
    await expect(this.userForm.lastNameInput).toHaveValue(lastName);
    await expect(this.userForm.mobileInput).toHaveValue(mobile);
    await expect(this.userForm.addressStreetInput).toHaveValue(addressStreet);
    await expect(this.userForm.addressSuburbInput).toHaveValue(addressSuburb);
    await expect(this.userForm.addressStateInput).toHaveValue(addressState);
    await expect(this.userForm.addressPostcodeInput).toHaveValue(
      addressPostcode,
    );
    await expect(this.userForm.dateOfBirthInput).toHaveValue(dateOfBirth);
    await expect(this.userForm.emergencyContactNameInput).toHaveValue(
      emergencyContactName,
    );
    await expect(this.userForm.emergencyContactNumberInput).toHaveValue(
      emergencyContactNumber,
    );
    await expect(this.userForm.emergencyContactAddressInput).toHaveValue(
      emergencyContactAddress,
    );
    await expect(this.userForm.emergencyContactRelationshipInput).toHaveValue(
      emergencyContactRelationship,
    );
    await expect(this.userForm.additionalEmailInput).toHaveValue(
      additionalEmail,
    );
  }
}
