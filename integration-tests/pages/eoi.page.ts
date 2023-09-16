import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface EoiForm {
  bestTimeToContact: string;
  occupation: string;
  volunteerExperience: string;
  role: string;
  mentoringLevel: string;
  preferredFrequency: string;
  hearAboutUs: string;
  isOver18: string;
  whyVolunteer: string;
  aboutMe: string;
}

export class EOIInfoPage {
  private page: Page;

  title: Locator;

  bestTimeToContactInput: Locator;
  occupationInput: Locator;
  volunteerExperienceInput: Locator;
  roleInput: Locator;
  mentoringLevelInput: Locator;
  preferredFrequencyInput: Locator;
  hearAboutUsInput: Locator;
  isOver18Input: Locator;
  whyVolunteerInput: Locator;
  aboutMeInput: Locator;

  expect: EOIInfoPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", { name: "expression of interest" });

    this.bestTimeToContactInput = page.getByLabel("Best time to contact");
    this.occupationInput = page.getByLabel("Occupation");
    this.volunteerExperienceInput = page.getByLabel("Volunteer experience");
    this.roleInput = page.getByLabel("Role");
    this.mentoringLevelInput = page.getByLabel("Mentoring level");
    this.hearAboutUsInput = page.getByLabel("How did you hear about us?");
    this.preferredFrequencyInput = page.getByLabel("Preferred frequency");
    this.isOver18Input = page.getByTestId("isOver18");
    this.whyVolunteerInput = page.getByLabel("Why a volunteer?");
    this.aboutMeInput = page.getByLabel("About me");

    this.expect = new EOIInfoPageAssertions(this);
  }

  async updateForm({
    bestTimeToContact,
    occupation,
    volunteerExperience,
    role,
    mentoringLevel,
    preferredFrequency,
    hearAboutUs,
    isOver18,
    whyVolunteer,
    aboutMe,
  }: EoiForm) {
    await this.bestTimeToContactInput.fill(bestTimeToContact);
    await this.occupationInput.fill(occupation);
    await this.volunteerExperienceInput.fill(volunteerExperience);
    await this.roleInput.fill(role);
    await this.mentoringLevelInput.fill(mentoringLevel);
    await this.hearAboutUsInput.fill(hearAboutUs);
    await this.preferredFrequencyInput.fill(preferredFrequency);
    await this.isOver18Input.getByText(isOver18).check();
    await this.whyVolunteerInput.fill(whyVolunteer);
    await this.aboutMeInput.fill(aboutMe);
  }

  async goToUserEdit(): Promise<void> {
    await this.page.getByRole("link", { name: "Back" }).click();
  }

  async submitForm() {
    await this.page
      .getByRole("button", {
        name: "Save",
      })
      .click();
  }
}

export class EOIInfoPageAssertions {
  constructor(private eoiChapterPage: EOIInfoPage) {}

  async toHaveValues({
    bestTimeToContact,
    occupation,
    volunteerExperience,
    role,
    mentoringLevel,
    preferredFrequency,
    hearAboutUs,
    isOver18,
    whyVolunteer,
    aboutMe,
  }: EoiForm): Promise<void> {
    await expect(this.eoiChapterPage.bestTimeToContactInput).toHaveValue(
      bestTimeToContact,
    );
    await expect(this.eoiChapterPage.occupationInput).toHaveValue(occupation);
    await expect(this.eoiChapterPage.volunteerExperienceInput).toHaveValue(
      volunteerExperience,
    );
    await expect(this.eoiChapterPage.roleInput).toHaveValue(role);
    await expect(this.eoiChapterPage.mentoringLevelInput).toHaveValue(
      mentoringLevel,
    );
    await expect(this.eoiChapterPage.preferredFrequencyInput).toHaveValue(
      preferredFrequency,
    );
    await expect(this.eoiChapterPage.hearAboutUsInput).toHaveValue(hearAboutUs);
    await expect(
      this.eoiChapterPage.isOver18Input.getByText(isOver18),
    ).toBeChecked();
    await expect(this.eoiChapterPage.whyVolunteerInput).toHaveValue(
      whyVolunteer,
    );
    await expect(this.eoiChapterPage.aboutMeInput).toHaveValue(aboutMe);
  }
}
