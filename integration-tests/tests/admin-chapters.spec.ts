import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import {
  acceptDialogs,
  goToSidebarPage,
  selectSearchOption,
  waitForHydration,
} from "../helpers";
import { CHAPTER_DATA, seedDataAsync } from "../test-data";

const CHAPTERS = [
  { name: "Head Office", address: "11 Patrick Court Girrawheen WA 6064" },
  { name: "Girrawheen", address: "11 Patrick Court Girrawheen WA 6064" },
  {
    name: "Armadale",
    address:
      "Library, Westfield Park Primary School, Hemingway Drive Camillo WA 6111",
  },
  {
    name: "Butler",
    address: "East Butler Primary School, Amersham Crescent Butler 6036",
  },
];

function getChapterCard(page: Page, name: string) {
  return page
    .locator(".card")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });
}

async function goToChapterLink(page: Page, chapter: string, link: string) {
  await goToSidebarPage(page, "Chapters");

  await getChapterCard(page, chapter).getByRole("link", { name: link }).click();
  await waitForHydration(page);
}

test.describe("Admin chapters (read only)", () => {
  test.beforeAll(async () => {
    await seedDataAsync();
  });

  test("should display list of chapters", async ({ page }) => {
    await goToSidebarPage(page, "Chapters");

    await expect(
      page.getByRole("heading", { name: "Chapters", exact: true }),
    ).toBeVisible();

    for (const { name, address } of CHAPTERS) {
      const card = getChapterCard(page, name);

      await expect(card).toBeVisible();
      await expect(card.getByText(address, { exact: true })).toBeVisible();

      for (const link of [
        "Roster STUDENTS",
        "Roster MENTORS",
        "Assign: STUDENT LIST",
        "Assign: MENTOR LIST",
        "Attendances: MENTORS",
        "Attendances: STUDENTS",
      ]) {
        await expect(card.getByRole("link", { name: link })).toBeVisible();
      }
    }

    await expect(page.locator(".card")).toHaveCount(CHAPTERS.length);
  });

  test("should display students with their mentors", async ({ page }) => {
    await goToChapterLink(page, "Girrawheen", "Assign: STUDENT LIST");

    await expect(
      page.getByRole("heading", { name: "Students with Mentors" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Students" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Mentors" }),
    ).toBeVisible();

    await expect(page.getByRole("row")).toHaveCount(11);
    await expect(
      page.getByRole("row", { name: /^student_0 student_lastname_0/ }),
    ).toContainText("test_0 user_0");

    await page.getByPlaceholder("Search by name").fill("student_2");
    await page.keyboard.press("Enter");

    const row = page.getByRole("row", {
      name: /^student_2 student_lastname_2/,
    });

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(row).toContainText("test_0 user_0");
    await expect(row).toContainText("test_2 user_2");
  });

  test("should display mentors with their students", async ({ page }) => {
    await goToChapterLink(page, "Girrawheen", "Assign: MENTOR LIST");

    await expect(
      page.getByRole("heading", { name: "Mentors with students" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Mentors" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Students" }),
    ).toBeVisible();

    await page.getByPlaceholder("Search by name").fill("test_0");
    await page.keyboard.press("Enter");

    const row = page.getByRole("row", { name: /^test_0 user_0/ });

    await expect(row).toBeVisible();
    await expect(row).toContainText("student_0 student_lastname_0");
    await expect(row).toContainText("student_1 student_lastname_1");
    await expect(row).toContainText("student_2 student_lastname_2");
  });

  test("should display students roster", async ({ page }) => {
    await goToChapterLink(page, "Girrawheen", "Roster STUDENTS");

    await expect(
      page.getByRole("heading", { name: "Roster planner STUDENTS" }),
    ).toBeVisible();
    await expect(page.getByLabel("Session date")).toBeVisible();
    await expect(
      page.getByLabel("Student (press Enter to submit)"),
    ).toBeVisible();
  });

  test("should display mentors roster", async ({ page }) => {
    await goToChapterLink(page, "Girrawheen", "Roster MENTORS");

    await expect(
      page.getByRole("heading", { name: "Roster planner MENTORS" }),
    ).toBeVisible();
    await expect(page.getByLabel("Session date")).toBeVisible();
    await expect(
      page.getByLabel("Mentor (press Enter to submit)"),
    ).toBeVisible();
    await expect(page.getByLabel("Status")).toBeVisible();
  });

  test("should display students attendances", async ({ page }) => {
    await goToChapterLink(page, "Girrawheen", "Attendances: STUDENTS");

    await expect(
      page.getByRole("heading", { name: /Student attendances/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Attended on" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Student" }),
    ).toBeVisible();
    await expect(page.getByText("No attendaces")).toBeVisible();
  });

  test("should display mentors attendances", async ({ page }) => {
    await goToChapterLink(page, "Girrawheen", "Attendances: MENTORS");

    await expect(
      page.getByRole("heading", { name: /Mentor attendances/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Attended on" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Mentor" }),
    ).toBeVisible();
    await expect(page.getByText("No attendaces")).toBeVisible();
  });

  // The edit chapter page has no way to save (the route has no action) and
  // nothing links to it, so only check that it renders.
  test("should display chapter info", async ({ page }) => {
    await page.goto(`/admin/chapters/${CHAPTER_DATA.Butler}`);
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Edit chapter" }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("Butler");
    await expect(page.getByLabel("Address")).toHaveValue(
      "East Butler Primary School, Amersham Crescent Butler 6036",
    );
  });
});

test.describe("Admin chapters (edit)", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 60 * 1000 });

  test.beforeEach(async () => {
    await seedDataAsync();
  });

  test("should assign and unassign a mentor of a student", async ({ page }) => {
    acceptDialogs(page);

    await goToChapterLink(page, "Girrawheen", "Assign: STUDENT LIST");

    await page.getByPlaceholder("Search by name").fill("student_2");
    await page.keyboard.press("Enter");
    await page
      .getByRole("row", { name: /^student_2 student_lastname_2/ })
      .getByRole("link", { name: "Edit" })
      .click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Assign mentor to student" }),
    ).toBeVisible();

    const assigned = page.locator("article ol > li");

    await expect(assigned).toHaveCount(2);
    await expect(assigned.filter({ hasText: "test_0 user_0" })).toBeVisible();
    await expect(assigned.filter({ hasText: "test_2 user_2" })).toBeVisible();

    // Assign.
    await selectSearchOption(
      page,
      "start typing to select a mentor",
      "test_5 user_5",
    );
    await page.getByRole("button", { name: "Add" }).click();

    await expect(assigned).toHaveCount(3);
    await expect(assigned.filter({ hasText: "test_5 user_5" })).toBeVisible();

    // Unassign.
    await assigned
      .filter({ hasText: "test_2 user_2" })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(assigned).toHaveCount(2);
    await expect(assigned.filter({ hasText: "test_2 user_2" })).toHaveCount(0);
    await expect(assigned.filter({ hasText: "test_0 user_0" })).toBeVisible();
    await expect(assigned.filter({ hasText: "test_5 user_5" })).toBeVisible();
  });

  test("should assign and unassign a student of a mentor", async ({ page }) => {
    acceptDialogs(page);

    await goToChapterLink(page, "Girrawheen", "Assign: MENTOR LIST");

    await page.getByPlaceholder("Search by name").fill("test_0");
    await page.keyboard.press("Enter");
    await page
      .getByRole("row", { name: /^test_0 user_0/ })
      .getByRole("link", { name: "Edit" })
      .click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Assign student to mentor" }),
    ).toBeVisible();

    const assigned = page.locator("article ol > li");

    await expect(assigned).toHaveCount(3);

    // Assign.
    await selectSearchOption(
      page,
      "start typing to select a student",
      "student_5 student_lastname_5",
    );
    await page.getByRole("button", { name: "Add" }).click();

    await expect(assigned).toHaveCount(4);
    await expect(
      assigned.filter({ hasText: "student_5 student_lastname_5" }),
    ).toBeVisible();

    // Unassign.
    await assigned
      .filter({ hasText: "student_0 student_lastname_0" })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(assigned).toHaveCount(3);
    await expect(
      assigned.filter({ hasText: "student_0 student_lastname_0" }),
    ).toHaveCount(0);
  });
});
