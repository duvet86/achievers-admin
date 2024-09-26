import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

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
}

class MentorVolunteerAgreementPageAssertions {
  constructor(private page: MentorVolunteerAgreementPage) {}

  async toHaveTitles(): Promise<void> {
    await expect(this.page.title).toBeVisible();
    await expect(this.page.disclaimer).toBeVisible();
    await expect(this.page.subtitle).toBeVisible();
  }

  async toHaveInputs(): Promise<void> {
    await expect(this.page.firstNameInput).toBeVisible();
    await expect(this.page.lastNameInput).toBeVisible();
    await expect(this.page.mobileInput).toBeVisible();
    await expect(this.page.addressStreetInput).toBeVisible();
    await expect(this.page.addressSuburbInput).toBeVisible();
    await expect(this.page.addressStateInput).toBeVisible();
    await expect(this.page.addressPostcodeInput).toBeVisible();
    await expect(this.page.dateOfBirthInput).toBeVisible();
    await expect(this.page.emergencyContactNameInput).toBeVisible();
    await expect(this.page.emergencyContactNumberInput).toBeVisible();
    await expect(this.page.emergencyContactAddressInput).toBeVisible();
    await expect(this.page.emergencyContactRelationshipInput).toBeVisible();
    await expect(this.page.hasApprovedToPublishPhotos).toBeVisible();
    await expect(this.page.isInformedOfConstitution).toBeVisible();
    await expect(this.page.hasApprovedSafetyDirections).toBeVisible();
    await expect(this.page.hasAcceptedNoLegalResp).toBeVisible();
    await expect(this.page.agree).toBeVisible();
    await expect(this.page.isOver18).toBeVisible();
  }
}
