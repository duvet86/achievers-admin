import { test, expect } from "@playwright/test";

import { goToMentorPage, setMentorClock, waitForHydration } from "../helpers";
import {
  MENTOR_RESOURCE_CATEGORY,
  deleteMentorResourcesAsync,
  seedDataAsync,
  seedMentorResourcesAsync,
  seedPartnerSharedInfoAsync,
} from "../test-data";

test.describe("Mentor navigation and profile (read only)", () => {
  test.beforeAll(async () => {
    await seedDataAsync(true);
  });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
  });

  test("should navigate with the sidebar", async ({ page }) => {
    const pages = [
      { link: "Roster", url: /\/mentor\/roster/, heading: "Roster planner" },
      {
        link: "View Session Summaries",
        url: /\/mentor\/view-reports/,
        heading: "Session Summaries",
      },
      {
        link: "My Students",
        url: /\/mentor\/students/,
        heading: "My students",
      },
      {
        link: "My Partners",
        url: /\/mentor\/partners/,
        heading: "My partners",
      },
      {
        link: "Useful Resources",
        url: /\/mentor\/useful-resources/,
        heading: "Useful resources",
      },
      {
        link: "Profile",
        url: /\/mentor\/profile/,
        heading: "Luca Mara profile",
      },
    ];

    for (const { link, url, heading } of pages) {
      await goToMentorPage(page, link);

      await expect(page).toHaveURL(url);
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
    }
  });

  test("should display the profile", async ({ page }) => {
    await goToMentorPage(page, "Profile");

    await expect(
      page.getByRole("heading", { name: "Luca Mara profile" }),
    ).toBeVisible();

    const values = {
      Email: "test_0@test.com",
      Chapter: "Girrawheen",
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

    for (const [label, value] of Object.entries(values)) {
      await expect(page.getByLabel(label, { exact: true })).toHaveValue(value);
    }

    // The details of a mentor are managed by the admins.
    await expect(page.getByLabel("Email", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("Chapter", { exact: true })).toBeDisabled();
  });

  test("should open the report error dialog", async ({ page }) => {
    await goToMentorPage(page, "Profile");

    await page.getByRole("button", { name: "Report error" }).click();

    await expect(page.locator("#report-error-modal")).toBeVisible();
  });
});

test.describe("Mentor volunteer agreement", () => {
  test.beforeAll(async () => {
    // The volunteer agreement has not been signed.
    await seedDataAsync(false);
  });

  test("should ask to sign the volunteer agreement first", async ({ page }) => {
    await page.goto("/mentor/partners");

    await page.waitForURL(/\/volunteer-agreement/);

    await expect(
      page.getByRole("heading", { name: "Volunteer agreement" }),
    ).toBeVisible();
  });
});

test.describe("Mentor partners", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 90 * 1000 });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
    await seedDataAsync(true);
    await seedPartnerSharedInfoAsync();
  });

  test("should display my partners", async ({ page }) => {
    await goToMentorPage(page, "My Partners");

    await expect(
      page.getByRole("heading", { name: "My partners" }),
    ).toBeVisible();

    for (const name of ["#", "Full name", "Email", "Mobile", "Action"]) {
      await expect(
        page.getByRole("columnheader", { name, exact: true }),
      ).toBeVisible();
    }

    // test_0 shares student_1 with test_1 and student_2 with test_2.
    await expect(page.getByRole("row")).toHaveCount(3);

    // test_1 shared its details, test_2 did not.
    const sharedRow = page.getByRole("row", { name: /test_1 user_1/ });

    await expect(sharedRow).toContainText("test_1@test.com");
    await expect(sharedRow).toContainText("123");

    const notSharedRow = page.getByRole("row", { name: /test_2 user_2/ });

    await expect(notSharedRow).not.toContainText("test_2@test.com");
    await expect(notSharedRow.getByRole("cell", { name: "-" })).toHaveCount(2);
  });

  test("should share and remove my details", async ({ page }) => {
    page.on("dialog", (dialog) => void dialog.accept());

    await goToMentorPage(page, "My Partners");

    const row = page.getByRole("row", { name: /test_2 user_2/ });

    await row.getByRole("button", { name: "Share Mobile and email" }).click();

    await expect(
      row.getByRole("button", { name: "Remove Mobile and email" }),
    ).toBeVisible();
    await expect(
      row.getByRole("button", { name: "Share Mobile and email" }),
    ).toHaveCount(0);

    await page.reload();
    await waitForHydration(page);

    await expect(
      page
        .getByRole("row", { name: /test_2 user_2/ })
        .getByRole("button", { name: "Remove Mobile and email" }),
    ).toBeVisible();

    await page
      .getByRole("row", { name: /test_2 user_2/ })
      .getByRole("button", { name: "Remove Mobile and email" })
      .click();

    await expect(
      page
        .getByRole("row", { name: /test_2 user_2/ })
        .getByRole("button", { name: "Share Mobile and email" }),
    ).toBeVisible();
  });
});

test.describe("Mentor useful resources", () => {
  // Seeding the database takes most of the default timeout.
  test.describe.configure({ timeout: 90 * 1000 });

  test.beforeEach(async ({ page }) => {
    await setMentorClock(page);
    await seedMentorResourcesAsync();
  });

  test.afterEach(async () => {
    await deleteMentorResourcesAsync();
  });

  test("should display the useful resources", async ({ page }) => {
    // The user needs to be a mentor with a signed agreement.
    await seedDataAsync(true);

    await goToMentorPage(page, "Useful Resources");

    await expect(
      page.getByRole("heading", { name: "Useful resources" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: MENTOR_RESOURCE_CATEGORY }),
    ).toBeVisible();

    const reading = page.getByRole("link", { name: "Reading tips" });

    await expect(reading).toHaveAttribute(
      "href",
      "https://example.com/reading",
    );
    await expect(reading).toHaveAttribute("target", "_blank");
    await expect(page.getByText("How to read with your student")).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Maths games" }),
    ).toHaveAttribute("href", "https://example.com/maths");
    await expect(page.getByText("Games to practice maths")).toBeVisible();
  });
});
