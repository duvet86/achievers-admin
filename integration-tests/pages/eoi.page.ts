import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

export class EOIInfoPage {
  private page: Page;

  title: Locator;

  bestTimeToContactHeading: Locator;
  occupationHeading: Locator;
  volunteerExperienceHeading: Locator;
  roleHeading: Locator;
  mentoringLevelHeading: Locator;
  preferredFrequencyHeading: Locator;
  hearAboutUsHeading: Locator;
  over18Heading: Locator;
  whyVolunteerHeading: Locator;
  aboutMeHeading: Locator;

  expect: EOIInfoPageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", { name: "expression of interest" });

    this.bestTimeToContactHeading = page.getByRole("heading", {
      name: "Best time to contact",
    });
    this.occupationHeading = page.getByRole("heading", { name: "Occupation" });
    this.volunteerExperienceHeading = page.getByRole("heading", {
      name: "Volunteer experience",
    });
    this.roleHeading = page.getByRole("heading", { name: "Role" });
    this.mentoringLevelHeading = page.getByRole("heading", {
      name: "Mentoring level",
    });
    this.hearAboutUsHeading = page.getByRole("heading", {
      name: "How did you hear about us?",
    });
    this.preferredFrequencyHeading = page.getByRole("heading", {
      name: "Preferred frequency",
    });
    this.over18Heading = page.getByRole("heading", { name: "Is over 18?" });
    this.whyVolunteerHeading = page.getByRole("heading", {
      name: "Why a volunteer?",
    });
    this.aboutMeHeading = page.getByRole("heading", { name: "About me" });

    this.expect = new EOIInfoPageAssertions(this);
  }

  async getTextLocators(
    bestTimeToContactText: string,
    occupationText: string,
    volunteerExperienceText: string,
    roleText: string,
    mentoringLevelText: string,
    preferredFrequencyText: string,
    hearAboutUsText: string,
    over18Text: string,
    whyVolunteerText: string,
    aboutMeText: string
  ) {
    return {
      bestTimeToContactText: this.page.getByText(bestTimeToContactText, {
        exact: true,
      }),
      occupationText: this.page.getByText(occupationText, { exact: true }),
      volunteerExperienceText: this.page.getByText(volunteerExperienceText, {
        exact: true,
      }),
      roleText: this.page.getByText(roleText, { exact: true }),
      mentoringLevelText: this.page.getByText(mentoringLevelText, {
        exact: true,
      }),
      preferredFrequencyText: this.page.getByText(preferredFrequencyText, {
        exact: true,
      }),
      hearAboutUsText: this.page.getByText(hearAboutUsText, { exact: true }),
      over18Text: this.page.getByText(over18Text, { exact: true }),
      whyVolunteerText: this.page.getByText(whyVolunteerText, { exact: true }),
      aboutMeText: this.page.getByText(aboutMeText, { exact: true }),
    };
  }

  async goToUserEdit(): Promise<void> {
    await this.page.getByRole("link", { name: "Back" }).click();
  }
}

export class EOIInfoPageAssertions {
  constructor(private eoiChapterPage: EOIInfoPage) {}

  async toHaveHeadings(): Promise<void> {
    await expect(this.eoiChapterPage.bestTimeToContactHeading).toBeVisible();
    await expect(this.eoiChapterPage.occupationHeading).toBeVisible();
    await expect(this.eoiChapterPage.volunteerExperienceHeading).toBeVisible();
    await expect(this.eoiChapterPage.roleHeading).toBeVisible();
    await expect(this.eoiChapterPage.mentoringLevelHeading).toBeVisible();
    await expect(this.eoiChapterPage.preferredFrequencyHeading).toBeVisible();
    await expect(this.eoiChapterPage.hearAboutUsHeading).toBeVisible();
    await expect(this.eoiChapterPage.over18Heading).toBeVisible();
    await expect(this.eoiChapterPage.whyVolunteerHeading).toBeVisible();
    await expect(this.eoiChapterPage.aboutMeHeading).toBeVisible();
  }

  async toHaveText(
    bestTimeToContactText: string,
    occupationText: string,
    volunteerExperienceText: string,
    roleText: string,
    mentoringLevelText: string,
    preferredFrequencyText: string,
    hearAboutUsText: string,
    over18Text: string,
    whyVolunteerText: string,
    aboutMeText: string
  ): Promise<void> {
    const locators = await this.eoiChapterPage.getTextLocators(
      bestTimeToContactText,
      occupationText,
      volunteerExperienceText,
      roleText,
      mentoringLevelText,
      preferredFrequencyText,
      hearAboutUsText,
      over18Text,
      whyVolunteerText,
      aboutMeText
    );

    await expect(locators.bestTimeToContactText).toBeVisible();
    await expect(locators.occupationText).toBeVisible();
    await expect(locators.volunteerExperienceText).toBeVisible();
    await expect(locators.roleText).toBeVisible();
    await expect(locators.mentoringLevelText).toBeVisible();
    await expect(locators.preferredFrequencyText).toBeVisible();
    await expect(locators.hearAboutUsText).toBeVisible();
    await expect(locators.over18Text).toBeVisible();
    await expect(locators.whyVolunteerText).toBeVisible();
    await expect(locators.aboutMeText).toBeVisible();
  }
}
