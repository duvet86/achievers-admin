import { test, expect } from "@playwright/test";

import { seedDataAsync } from "../test-data";

test.describe("Mentor Volunteer Agreement", () => {
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

    await page.getByRole("link", { name: "Mentor View", exact: true }).click();
  });

  test("should have volunteer agreement", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Volunteer agreement" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "The Achievers Club WA Inc. is an association incorporated pursuant to the Associations Incorporation Act 2015 (WA)",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Confirm your details" }),
    ).toBeVisible();

    const checkboxes = [
      "hasApprovedToPublishPhotos",
      "isInformedOfConstitution",
      "hasApprovedSafetyDirections",
      "hasAcceptedNoLegalResp",
      "agree",
    ].map((name) => page.locator(`input[type='checkbox'][name='${name}']`));

    const initialValues = {
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
    };

    for (const [label, value] of Object.entries(initialValues)) {
      await expect(page.getByLabel(label)).toHaveValue(value);
    }

    for (const checkbox of checkboxes) {
      await expect(checkbox).not.toBeChecked();
    }

    const updatedValues = {
      "First name": "Luca",
      "Last name": "Mara",
      Mobile: "1111111",
      "Address street": "Address street",
      "Address suburb": "Address suburb",
      "Address state": "Address state",
      "Address postcode": "Address postcode",
      "Date of birth": "1986-07-22",
      "Emergency contact name": "Luca",
      "Emergency contact number": "Luca",
      "Emergency contact address": "Luca",
      "Emergency contact relationship": "Luca",
    };

    for (const [label, value] of Object.entries(updatedValues)) {
      await page.getByLabel(label).fill(value);
    }

    for (const checkbox of checkboxes) {
      await checkbox.check();
    }

    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByRole("link", { name: "Achievers WA" }),
    ).toBeVisible();
  });
});
