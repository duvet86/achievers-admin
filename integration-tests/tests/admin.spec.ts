import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import { CHAPTER_DATA, seedDataAsync } from "../test-data";

async function fillFields(page: Page, fields: Record<string, string>) {
  for (const [label, value] of Object.entries(fields)) {
    await page.getByLabel(label).fill(value);
  }
}

async function expectFields(page: Page, fields: Record<string, string>) {
  for (const [label, value] of Object.entries(fields)) {
    await expect(page.getByLabel(label)).toHaveValue(value);
  }
}

// The app is server rendered. Interacting before hydration finishes can lose
// clicks and reset filled values, so wait for the page to settle after
// navigating.
async function waitForHydration(page: Page) {
  await page.waitForLoadState("networkidle");
}

async function goToEditFirstMentor(page: Page) {
  await page.getByRole("link", { name: "Mentors", exact: true }).click();
  await waitForHydration(page);
  await page
    .getByRole("row", { name: "test_0 user_0" })
    .getByRole("link", { name: "Edit" })
    .click();
  await waitForHydration(page);
}

async function goToMentorSection(page: Page, section: string) {
  await page
    .getByRole("row", { name: section })
    .getByRole("link", { name: "View" })
    .click();
  await waitForHydration(page);
}

test.describe("Admin", () => {
  test.beforeEach(async ({ page }) => {
    await seedDataAsync();

    await page.goto("/");

    await expect(page).toHaveTitle(/Achievers WA/);

    await expect(
      page.getByRole("link", { name: "Achievers WA" }),
    ).toBeVisible();

    for (const name of ["Home", "Mentors", "Students", "Chapters"]) {
      await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("should have home page", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "Welcome to Achievers Club WA admin system",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Mentors with incomplete checks" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "17" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "of 18 total mentors" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Students without a mentor" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "15" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "of 18 total students" }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "Chapters" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "4" })).toBeVisible();

    const links = page.getByRole("link", { name: "View" });

    await expect(links).toHaveCount(4);
    await expect(links.nth(0)).toHaveAttribute("href", "/admin/mentors");
    await expect(links.nth(1)).toHaveAttribute("href", "/admin/students");
    await expect(links.nth(2)).toHaveAttribute("href", "/admin/chapters");
    await expect(links.nth(3)).toHaveAttribute("href", "/mentor/home");
  });

  test("should display list of mentors", async ({ page }) => {
    const rows = page.getByRole("row");
    const previousPageButton = page.getByTitle("previous");
    const nextPageButton = page.getByTitle("next");

    await page.getByRole("link", { name: "Mentors", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Mentors", exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "Full name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Assigned chapter" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Action" }),
    ).toBeVisible();

    await expect(
      page.getByRole("cell", { name: "test_0 user_0" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("row", { name: "test_0 user_0" })
        .getByRole("cell", { name: "Girrawheen" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("row", { name: "test_0 user_0" })
        .getByRole("link", { name: "Edit" }),
    ).toBeVisible();

    await expect(rows).toHaveCount(11);
    await expect(previousPageButton).toBeDisabled();

    await expect(
      page.getByRole("row", { name: /test_18/ }).getByTestId("completed"),
    ).toBeVisible();

    await nextPageButton.click();

    await expect(rows).toHaveCount(9);
    await expect(nextPageButton).toBeDisabled();

    await page.getByRole("button", { name: "1" }).click();

    await expect(rows).toHaveCount(11);

    await page.getByPlaceholder("Search").fill("test_0");
    await page.keyboard.press("Enter");

    await expect(rows).toHaveCount(2);

    await page.getByRole("button", { name: "Reset" }).click();

    await expect(rows).toHaveCount(11);

    await page.getByLabel("Include archived").check();

    await expect(
      page.getByRole("row", { name: /test_17/ }).getByTestId("archived"),
    ).toBeVisible();

    await nextPageButton.click();

    await expect(rows).toHaveCount(10);
  });

  test("should import mentors from file", async ({ page }) => {
    await page.getByRole("link", { name: "Mentors", exact: true }).click();

    // The actions dropdown is focus based, hydration re-renders it and closes
    // the menu, swallowing the click on "Import mentors".
    await waitForHydration(page);

    await page.getByTitle("actions").click();
    await page.getByRole("link", { name: "Import mentors" }).click();

    await expect(
      page.getByRole("heading", { name: "Import mentors from file" }),
    ).toBeVisible();

    const fileChooserPromise = page.waitForEvent("filechooser");

    await page.getByLabel("Upload a spreadsheet with new users").click();

    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(
      "./integration-tests/test-data/VolunteerDatabaseInfo.xlsx",
    );

    await page.getByRole("button", { name: "Import" }).click();

    await expect(page.getByRole("columnheader", { name: "#" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Full name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Error" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Action" }),
    ).toBeVisible();

    await expect(page.getByRole("cell", { name: "1" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "A D" })).toBeVisible();
    await expect(
      page
        .getByRole("row", { name: "A D" })
        .getByRole("cell", { name: "", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("row", { name: "A D" })
        .getByRole("cell", { name: "Edit" }),
    ).toBeVisible();

    await expect(page.getByRole("row")).toHaveCount(4);
  });

  test("should edit mentor info", async ({ page }) => {
    await goToEditFirstMentor(page);

    await expect(
      page.getByRole("heading", { name: "Edit mentor info" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Edit" }).click();

    // Test that empty values are saved correctly.
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("figure")).toBeVisible();

    const emptyValues = {
      "First name": "test_0",
      "Last name": "user_0",
      Mobile: "123",
      "Address street": "street",
      "Address suburb": "suburb",
      "Address state": "state",
      "Address postcode": "123123",
      "Date of birth": "",
      "Emergency contact name": "",
      "Emergency contact number": "",
      "Emergency contact address": "",
      "Emergency contact relationship": "",
      "Additional email": "",
    };

    await expect(page.getByLabel("Chapter")).toHaveValue(
      CHAPTER_DATA.Girrawheen,
    );
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
      "test_0@test.com",
    );
    await expectFields(page, emptyValues);

    await expect(page.getByTitle("No access")).not.toBeVisible();

    // Update user info.
    const updatedValues = {
      "First name": "Luca",
      "Last name": "Mara",
      Mobile: "1111111",
      "Address street": "Address street",
      "Address suburb": "Address suburb",
      "Address state": "Address state",
      "Address postcode": "Address postcode",
      "Date of birth": "2018-07-22",
      "Emergency contact name": "Luca",
      "Emergency contact number": "Luca",
      "Emergency contact address": "Luca",
      "Emergency contact relationship": "Luca",
      "Additional email": "Luca@luca.com",
    };

    await page.getByLabel("Chapter").selectOption({ label: "Butler" });
    await fillFields(page, updatedValues);

    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByTestId("container").getByTestId("message"),
    ).toBeVisible();

    await expect(page.getByLabel("Chapter")).toHaveValue(CHAPTER_DATA.Butler);
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
      "test_0@test.com",
    );
    await expectFields(page, updatedValues);
  });

  test("should display eoi info for mentor", async ({ page }) => {
    await goToEditFirstMentor(page);
    await goToMentorSection(page, "Expression of interest");

    const isOver18 = page.getByTestId("isOver18");

    const initialValues = {
      "Best time to contact": "Afternoon after 3pm",
      Occupation: "Retired",
      "Volunteer experience": "None",
      Role: "Mentor",
      "Mentoring level": "2 years at Curtin university",
      "Preferred frequency": "every week",
      "How did you hear about us?": "Linkid",
      "Why a volunteer?": "I am ready to rock",
      "About me": "I have a lot of energy and I want to share it with everyone",
    };

    await expectFields(page, initialValues);
    await expect(isOver18.getByText("Yes")).toBeChecked();

    const updatedValues = {
      "Best time to contact": "AAAAA",
      Occupation: "asdasd",
      "Volunteer experience": "ddddd",
      Role: "sdsdsd",
      "Mentoring level": "wwwww",
      "Preferred frequency": "vvcvcv",
      "How did you hear about us?": "Linkidvvvvvvvvvvvv",
      "Why a volunteer?": "mnmnmmmmm",
      "About me": "vvvvvvvvvvvvvvvv",
    };

    await fillFields(page, updatedValues);
    await isOver18.getByText("No").check();

    await page.getByRole("button", { name: "Save" }).click();

    await expectFields(page, updatedValues);
    await expect(isOver18.getByText("No")).toBeChecked();
  });

  test("should update reference for mentor", async ({ page }) => {
    await goToEditFirstMentor(page);
    await goToMentorSection(page, "References");
    await goToMentorSection(page, "referenceA_0 lastnameA_0");

    await expect(
      page.getByRole("heading", {
        name: 'Reference "referenceA_0 lastnameA_0" for mentor "test_0 user_0"',
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Details" })).toBeVisible();

    const hasKnownApplicantForAYear = page.getByTestId(
      "hasKnowApplicantForAYear",
    );
    const isRelated = page.getByTestId("isRelated");
    const isMentorRecommended = page.getByTestId("isMentorRecommended");

    const values = {
      "First name": "Luca",
      "Last name": "Mara",
      Mobile: "123123",
      Email: "asd@asd.com",
      "Best time to contact": "now",
      "Please describe how long and in what capacity you have known the Applicant? (Use this to also confirm employment status, dates and role of the applicant)":
        "asdasdasdasdsa",
      "Would you be happy with your own children, or children you know, to be mentored by the Applicant?":
        "Yes asdasdasasd",
      "What skills and knowledge do you think the Applicant has that will help them fulfil this mentoring role?":
        "asdasdasdssss",
      "Empathy and patience are key attributes for mentoring. Does the Applicant have these attributes? Provide examples.":
        "sssssssssssssssssss",
      "Another key attribute for this role is the ability to build relationships, especially with children. Does the Applicant have this attribute? Provide examples.":
        "aaaaaaaaaaaaaaaaaaa",
      "Any other comments? (Use this response to provide any other relevant information that may be helpful).":
        "sssssssssssssssssss",
      "General comment": "ddddddddddddddddddddddd",
      "By (name)": "Tony",
      "On (date)": "2020-02-02",
    };

    await fillFields(page, values);
    await page.getByPlaceholder("Relationship", { exact: true }).fill("father");
    await hasKnownApplicantForAYear.getByText("Yes").check();
    await isRelated.getByText("No").check();
    await isMentorRecommended.getByText("Yes").check();

    await page.getByRole("button", { name: "Save" }).click();

    await expectFields(page, values);
    await expect(
      page.getByPlaceholder("Relationship", { exact: true }),
    ).toHaveValue("father");
    await expect(hasKnownApplicantForAYear.getByLabel("Yes")).toBeChecked();
    await expect(isRelated.getByLabel("No")).toBeChecked();
    await expect(isMentorRecommended.getByLabel("Yes")).toBeChecked();
  });

  test("should update police check for mentor", async ({ page }) => {
    const expiryDate = page.getByLabel("Expiry Date (3 years from issue)");

    await goToEditFirstMentor(page);
    await goToMentorSection(page, "Police check");

    await expect(
      page.getByRole("heading", { name: /Police check for/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "VNPC Portal" })).toBeVisible();

    await expect(expiryDate).toHaveValue("2023-09-16");

    await expiryDate.fill("1999-11-11");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(expiryDate).toHaveValue("1999-11-11");
  });

  test("should update WWC check for mentor", async ({ page }) => {
    await goToEditFirstMentor(page);
    await goToMentorSection(page, "WWC check");

    await expect(
      page.getByRole("heading", { name: /WWC check for/ }),
    ).toBeVisible();

    await expectFields(page, {
      "WWC number": "123456",
      "Expiry date": "2023-09-16",
    });

    const updatedValues = {
      "WWC number": "00000",
      "Expiry date": "1999-11-11",
    };

    await fillFields(page, updatedValues);

    await page.getByRole("button", { name: "Save" }).click();

    await expectFields(page, updatedValues);
  });

  test("should update Approbal by MRC for mentor", async ({ page }) => {
    await goToEditFirstMentor(page);
    await goToMentorSection(page, "Approval by MRC");

    await expect(
      page.getByRole("heading", { name: /Approval by MRC for/ }),
    ).toBeVisible();

    const updatedValues = {
      "Completed by": "Luca",
      "Submitted date": "1999-11-11",
      Comment: "comment asd",
    };

    await fillFields(page, updatedValues);

    await page.getByRole("button", { name: "Save" }).click();

    await expectFields(page, updatedValues);
  });
});
