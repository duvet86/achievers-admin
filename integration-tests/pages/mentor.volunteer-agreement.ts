import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface FormQuery {
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
}

interface FormCommand {
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
}

export class MentorVolunteerAgreementPage {
  private page: Page;

  title: Locator;
  disclaimer: Locator;
  subtitle: Locator;

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

  hasApprovedToPublishPhotos: Locator;
  isInformedOfConstitution: Locator;
  hasApprovedSafetyDirections: Locator;
  hasAcceptedNoLegalResp: Locator;
  agree: Locator;
  isOver18: Locator;

  expect: MentorVolunteerAgreementPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = this.page.getByRole("heading", {
      name: "Volunteer agreement",
    });
    this.disclaimer = this.page.getByText(
      "The Achievers Club WA Inc. is an association incorporated pursuant to the Associations Incorporation Act 2015 (WA)",
    );
    this.subtitle = this.page.getByRole("heading", {
      name: "Confirm your details",
    });

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

    this.hasApprovedToPublishPhotos = page.locator(
      "input[type='checkbox'][name='hasApprovedToPublishPhotos']",
    );
    this.isInformedOfConstitution = page.locator(
      "input[type='checkbox'][name='isInformedOfConstitution']",
    );
    this.hasApprovedSafetyDirections = page.locator(
      "input[type='checkbox'][name='hasApprovedSafetyDirections']",
    );
    this.hasAcceptedNoLegalResp = page.locator(
      "input[type='checkbox'][name='hasAcceptedNoLegalResp']",
    );
    this.agree = page.locator("input[type='checkbox'][name='agree']");
    this.isOver18 = page.locator("input[type='checkbox'][name='isOver18']");

    this.expect = new MentorVolunteerAgreementPageAssertions(this);
  }

  async checkAgreement({
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
  }: FormCommand): Promise<void> {
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

    await this.hasApprovedToPublishPhotos.check();
    await this.isInformedOfConstitution.check();
    await this.hasApprovedSafetyDirections.check();
    await this.hasAcceptedNoLegalResp.check();
    await this.agree.check();
    await this.isOver18.check();
  }

  async saveForm(): Promise<void> {
    await this.page.getByRole("button", { name: "Save" }).click();
  }
}

class MentorVolunteerAgreementPageAssertions {
  constructor(private page: MentorVolunteerAgreementPage) {}

  async toHaveTitles(): Promise<void> {
    await expect(this.page.title).toBeVisible();
    await expect(this.page.disclaimer).toBeVisible();
    await expect(this.page.subtitle).toBeVisible();
  }

  async toHaveInitialInputs({
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
  }: FormQuery): Promise<void> {
    await expect(this.page.firstNameInput).toHaveValue(firstName);
    await expect(this.page.lastNameInput).toHaveValue(lastName);
    await expect(this.page.mobileInput).toHaveValue(mobile);
    await expect(this.page.addressStreetInput).toHaveValue(addressStreet);
    await expect(this.page.addressSuburbInput).toHaveValue(addressSuburb);
    await expect(this.page.addressStateInput).toHaveValue(addressState);
    await expect(this.page.addressPostcodeInput).toHaveValue(addressPostcode);
    await expect(this.page.dateOfBirthInput).toHaveValue(dateOfBirth);
    await expect(this.page.emergencyContactNameInput).toHaveValue(
      emergencyContactName,
    );
    await expect(this.page.emergencyContactNumberInput).toHaveValue(
      emergencyContactNumber,
    );
    await expect(this.page.emergencyContactAddressInput).toHaveValue(
      emergencyContactAddress,
    );
    await expect(this.page.emergencyContactRelationshipInput).toHaveValue(
      emergencyContactRelationship,
    );

    await expect(this.page.hasApprovedToPublishPhotos).not.toBeChecked();
    await expect(this.page.isInformedOfConstitution).not.toBeChecked();
    await expect(this.page.hasApprovedSafetyDirections).not.toBeChecked();
    await expect(this.page.hasAcceptedNoLegalResp).not.toBeChecked();
    await expect(this.page.agree).not.toBeChecked();
    await expect(this.page.isOver18).not.toBeChecked();
  }
}
