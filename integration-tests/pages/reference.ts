import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

interface ReferenceDetails {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  bestTimeToContact: string;
  relationship: string;
  hasKnowApplicantForAYear: string;
  isRelated: string;
  knownForComment: string;
  isChildrenSafe: string;
  skillAndKnowledgeComment: string;
  empathyAndPatienceComment: string;
  buildRelationshipsComment: string;
  outcomeComment: string;
  generalComment: string;
  isMentorRecommended: string;
  calledBy: string;
  calledOndate: string;
}

export class ReferencePage {
  private page: Page;

  title: Locator;
  subTitle: Locator;

  firstNameInput: Locator;
  lastNameInput: Locator;
  mobileInput: Locator;
  emailInput: Locator;
  bestTimeToContactInput: Locator;
  relationshipInput: Locator;
  hasKnowApplicantForAYearInput: Locator;
  isRelatedInput: Locator;
  knownForCommentInput: Locator;
  isChildrenSafeInput: Locator;
  skillAndKnowledgeCommentInput: Locator;
  empathyAndPatienceCommentInput: Locator;
  buildRelationshipsCommentInput: Locator;
  outcomeCommentInput: Locator;
  generalCommentInput: Locator;
  isMentorRecommendedInput: Locator;
  calledByInput: Locator;
  calledOndateInput: Locator;

  expect: ReferencePageAssertions;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole("heading", {
      name: 'Reference "referenceA_0 lastnameA_0" for mentor "test_0 user_0"',
    });
    this.subTitle = page.getByRole("heading", {
      name: "Details",
    });

    this.firstNameInput = page.getByLabel("First name");
    this.lastNameInput = page.getByLabel("Last name");
    this.mobileInput = page.getByLabel("Mobile");
    this.emailInput = page.getByLabel("Email");
    this.bestTimeToContactInput = page.getByLabel("Best time to contact");
    this.relationshipInput = page.getByPlaceholder("Relationship", {
      exact: true,
    });
    this.hasKnowApplicantForAYearInput = page.getByTestId(
      "hasKnowApplicantForAYear",
    );
    this.isRelatedInput = page.getByTestId("isRelated");
    this.knownForCommentInput = page.getByLabel(
      "Please describe how long and in what capacity you have known the Applicant? (Use this to also confirm employment status, dates and role of the applicant)",
    );
    this.isChildrenSafeInput = page.getByTestId("isChildrenSafe");
    this.skillAndKnowledgeCommentInput = page.getByLabel(
      "What skills and knowledge do you think the Applicant has that will help them fulfil this mentoring role?",
    );
    this.empathyAndPatienceCommentInput = page.getByLabel(
      "Empathy and patience are key attributes for mentoring. Does the Applicant have these attributes? Provide examples.",
    );
    this.buildRelationshipsCommentInput = page.getByLabel(
      "Another key attribute for this role is the ability to build relationships, especially with children. Does the Applicant have this attribute? Provide examples.",
    );
    this.outcomeCommentInput = page.getByLabel(
      "Any other comments? (Use this response to provide any other relevant information that may be helpful).",
    );
    this.generalCommentInput = page.getByLabel("General comment");
    this.isMentorRecommendedInput = page.getByTestId("isMentorRecommended");
    this.calledByInput = page.getByLabel("By (name)");
    this.calledOndateInput = page.getByLabel("On (date)");

    this.expect = new ReferencePageAssertions(this);
  }

  async updateReference({
    firstName,
    lastName,
    mobile,
    email,
    bestTimeToContact,
    relationship,
    hasKnowApplicantForAYear,
    isRelated,
    knownForComment,
    isChildrenSafe,
    skillAndKnowledgeComment,
    empathyAndPatienceComment,
    buildRelationshipsComment,
    outcomeComment,
    generalComment,
    isMentorRecommended,
    calledBy,
    calledOndate,
  }: ReferenceDetails) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.mobileInput.fill(mobile);
    await this.emailInput.fill(email);
    await this.bestTimeToContactInput.fill(bestTimeToContact);
    await this.relationshipInput.fill(relationship);
    await this.hasKnowApplicantForAYearInput
      .getByText(hasKnowApplicantForAYear)
      .check();
    await this.isRelatedInput.getByText(isRelated).check();
    await this.knownForCommentInput.fill(knownForComment);
    await this.isChildrenSafeInput.getByText(isChildrenSafe).check();
    await this.skillAndKnowledgeCommentInput.fill(skillAndKnowledgeComment);
    await this.empathyAndPatienceCommentInput.fill(empathyAndPatienceComment);
    await this.buildRelationshipsCommentInput.fill(buildRelationshipsComment);
    await this.outcomeCommentInput.fill(outcomeComment);
    await this.generalCommentInput.fill(generalComment);
    await this.isMentorRecommendedInput.getByText(isMentorRecommended).check();
    await this.calledByInput.fill(calledBy);
    await this.calledOndateInput.fill(calledOndate);
  }

  async submitForm() {
    await this.page
      .getByRole("button", {
        name: "Save",
      })
      .click();
  }
}

export class ReferencePageAssertions {
  constructor(private referencePage: ReferencePage) {}

  async toHaveHeadings() {
    await expect(this.referencePage.title).toBeVisible();
    await expect(this.referencePage.subTitle).toBeVisible();
  }

  async toHaveInputs({
    firstName,
    lastName,
    mobile,
    email,
    bestTimeToContact,
    relationship,
    hasKnowApplicantForAYear,
    isRelated,
    knownForComment,
    isChildrenSafe,
    skillAndKnowledgeComment,
    empathyAndPatienceComment,
    buildRelationshipsComment,
    outcomeComment,
    generalComment,
    isMentorRecommended,
    calledBy,
    calledOndate,
  }: ReferenceDetails) {
    await expect(this.referencePage.firstNameInput).toHaveValue(firstName);
    await expect(this.referencePage.lastNameInput).toHaveValue(lastName);
    await expect(this.referencePage.mobileInput).toHaveValue(mobile);
    await expect(this.referencePage.emailInput).toHaveValue(email);
    await expect(this.referencePage.bestTimeToContactInput).toHaveValue(
      bestTimeToContact,
    );
    await expect(this.referencePage.relationshipInput).toHaveValue(
      relationship,
    );
    await expect(
      this.referencePage.hasKnowApplicantForAYearInput.getByLabel(
        hasKnowApplicantForAYear,
      ),
    ).toBeChecked();
    await expect(
      this.referencePage.isRelatedInput.getByLabel(isRelated),
    ).toBeChecked();
    await expect(this.referencePage.knownForCommentInput).toHaveValue(
      knownForComment,
    );
    await expect(
      this.referencePage.isChildrenSafeInput.getByLabel(isChildrenSafe),
    ).toBeChecked();
    await expect(this.referencePage.skillAndKnowledgeCommentInput).toHaveValue(
      skillAndKnowledgeComment,
    );
    await expect(this.referencePage.empathyAndPatienceCommentInput).toHaveValue(
      empathyAndPatienceComment,
    );
    await expect(this.referencePage.buildRelationshipsCommentInput).toHaveValue(
      buildRelationshipsComment,
    );
    await expect(this.referencePage.outcomeCommentInput).toHaveValue(
      outcomeComment,
    );
    await expect(this.referencePage.generalCommentInput).toHaveValue(
      generalComment,
    );
    await expect(
      this.referencePage.isMentorRecommendedInput.getByLabel(
        isMentorRecommended,
      ),
    ).toBeChecked();
    await expect(this.referencePage.calledByInput).toHaveValue(calledBy);
    await expect(this.referencePage.calledOndateInput).toHaveValue(
      calledOndate,
    );
  }
}
