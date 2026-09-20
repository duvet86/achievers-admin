import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

import {
  acceptDialogs,
  expectFields,
  fillFields,
  goToSidebarPage,
  waitForHydration,
} from "../helpers";
import { CHAPTER_DATA, seedDataAsync } from "../test-data";

const FIRST_STUDENT = "student_0 student_lastname_0";

async function goToEditFirstStudent(page: Page) {
  await goToSidebarPage(page, "Students");

  await page
    .getByRole("row", { name: FIRST_STUDENT })
    .getByRole("link", { name: "Edit" })
    .click();
  await waitForHydration(page);

  await expect(
    page.getByRole("heading", { name: "Edit student info" }),
  ).toBeVisible();
}

async function openHeaderAction(page: Page, name: string) {
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("link", { name }).click();
  await waitForHydration(page);
}

test.describe("Admin students (read only)", () => {
  test.beforeAll(async () => {
    await seedDataAsync();
  });

  test("should display list of students", async ({ page }) => {
    const rows = page.getByRole("row");
    const previousPageButton = page.getByTitle("previous");
    const nextPageButton = page.getByTitle("next");

    await goToSidebarPage(page, "Students");

    await expect(
      page.getByRole("heading", { name: "Students", exact: true }),
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

    const firstRow = page.getByRole("row", { name: FIRST_STUDENT });

    await expect(firstRow).toBeVisible();
    await expect(
      firstRow.getByRole("cell", { name: "Girrawheen" }),
    ).toBeVisible();
    await expect(firstRow.getByRole("link", { name: "Edit" })).toBeVisible();

    await expect(rows).toHaveCount(11);
    await expect(previousPageButton).toBeDisabled();

    await nextPageButton.click();

    await expect(rows).toHaveCount(9);
    await expect(nextPageButton).toBeDisabled();

    await page.getByRole("button", { name: "1" }).click();

    await expect(rows).toHaveCount(11);
  });

  test("should search and filter students", async ({ page }) => {
    const rows = page.getByRole("row");

    await goToSidebarPage(page, "Students");

    await page.getByPlaceholder("Search").fill("student_0");
    await page.keyboard.press("Enter");

    await expect(rows).toHaveCount(2);
    await expect(page.getByRole("row", { name: FIRST_STUDENT })).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();

    await expect(rows).toHaveCount(11);

    // All the students belong to the first chapter.
    await page.getByLabel("Chapters").selectOption({ label: "Butler" });

    await expect(page.getByText("No students")).toBeVisible();

    await page.getByLabel("Chapters").selectOption({ label: "Girrawheen" });

    await expect(rows).toHaveCount(11);
  });

  test("should display student info", async ({ page }) => {
    await goToEditFirstStudent(page);

    await expectFields(
      page,
      {
        "First name": "student_0",
        "Last name": "student_lastname_0",
        Address: "address",
        "Best person to contact": "Tony",
        "Best contact method": "phone",
        "Name of the school": "school_0",
        "Emergency contact full name": "Luca M",
        "Emergency contact relationship": "father",
        "Emergency contact phone": "123456",
        "Emergency contact email": "emergency@asd.com",
        "Emergency contact address": "emergency address",
      },
      { exact: true },
    );

    await expect(page.getByLabel("Chapter", { exact: true })).toHaveValue(
      CHAPTER_DATA.Girrawheen,
    );
    await expect(page.getByLabel("Gender")).toHaveValue("MALE");

    await expect(page.getByTitle("archived")).not.toBeVisible();

    const guardians = page.getByRole("table").filter({
      has: page.getByRole("columnheader", { name: "Guardian full name" }),
    });

    await expect(
      guardians.getByRole("row", { name: /Lolo mother/ }),
    ).toBeVisible();
    await expect(
      guardians.getByRole("row", { name: /Lolo2 mother2/ }),
    ).toBeVisible();

    const teachers = page.getByRole("table").filter({
      has: page.getByRole("columnheader", { name: "Teacher full name" }),
    });

    await expect(
      teachers.getByRole("row", { name: /Pippo Schoole 1/ }),
    ).toBeVisible();
    await expect(
      teachers.getByRole("row", { name: /Pippo2 Schoole 2/ }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "School reports" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Grades tracker" }),
    ).toBeVisible();
  });

  test("should display school reports of a student", async ({ page }) => {
    await goToEditFirstStudent(page);

    await page.getByRole("link", { name: "School reports" }).click();

    await expect(
      page.getByRole("heading", {
        name: `School reports for "${FIRST_STUDENT}"`,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "Label" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Term" }),
    ).toBeVisible();
    await expect(page.getByText("No reports uploaded")).toBeVisible();
  });

  test("should display grades tracker of a student", async ({ page }) => {
    await goToEditFirstStudent(page);

    await page.getByRole("link", { name: "Grades tracker" }).click();

    await expect(
      page.getByRole("heading", {
        name: `Grades tracker for "${FIRST_STUDENT}"`,
      }),
    ).toBeVisible();

    await expect(page.getByLabel("Year")).toBeVisible();
    await expect(page.getByLabel("Semester")).toBeVisible();
    await expect(page.getByLabel("Subject")).toBeVisible();
    await expect(page.getByLabel("Grade")).toBeVisible();
    await expect(page.getByText("No grades yet")).toBeVisible();
  });

  test("should display students expressions of interest", async ({ page }) => {
    await goToSidebarPage(page, "Students");

    await page.getByTitle("actions").click();
    await page.getByRole("link", { name: "EOIs" }).click();

    await expect(
      page.getByRole("heading", { name: "Student Expression of Interests" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Preferred chapter" }),
    ).toBeVisible();
    await expect(page.getByText("No students")).toBeVisible();
  });

  test("should display import students page", async ({ page }) => {
    await goToSidebarPage(page, "Students");

    await page.getByTitle("actions").click();
    await page.getByRole("link", { name: "Import students" }).click();

    await expect(page).toHaveURL(/\/admin\/students\/import$/);
    await expect(
      page.getByRole("heading", { name: "Import students from file" }),
    ).toBeVisible();
  });
});

test.describe("Admin students (edit)", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 60 * 1000 });

  test.beforeEach(async () => {
    await seedDataAsync();
  });

  test("should edit student info", async ({ page }) => {
    await goToEditFirstStudent(page);

    const updatedValues = {
      "First name": "Luca",
      "Last name": "Mara",
      Address: "New address",
      "Best person to contact": "Mum",
      "Best contact method": "email",
      "Name of the school": "New school",
      "Emergency contact full name": "Emergency name",
      "Emergency contact relationship": "aunt",
      "Emergency contact phone": "999999",
      "Emergency contact email": "new@emergency.com",
      "Emergency contact address": "New emergency address",
    };

    await fillFields(page, updatedValues, { exact: true });
    await page.getByLabel("Chapter", { exact: true }).selectOption({
      label: "Butler",
    });

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Student updated successfully",
    );

    await page.reload();
    await waitForHydration(page);

    await expectFields(page, updatedValues, { exact: true });
    await expect(page.getByLabel("Chapter", { exact: true })).toHaveValue(
      CHAPTER_DATA.Butler,
    );

    await goToSidebarPage(page, "Students");

    await expect(
      page.getByRole("row", { name: "Luca Mara" }).getByRole("cell", {
        name: "Butler",
      }),
    ).toBeVisible();
  });

  test("should add, edit and remove a guardian", async ({ page }) => {
    acceptDialogs(page);

    await goToEditFirstStudent(page);

    // Add.
    await page.getByRole("link", { name: "Add a guardian" }).click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Add new guardian" }),
    ).toBeVisible();

    await fillFields(
      page,
      {
        "Full name": "New Guardian",
        Relationship: "uncle",
        "Phone number": "0400000000",
        "Email address": "guardian@test.com",
        Address: "Guardian address",
      },
      { exact: true },
    );
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Successfully saved",
    );

    await goToEditFirstStudent(page);

    const guardianRow = page.getByRole("row", { name: /New Guardian uncle/ });

    await expect(guardianRow).toBeVisible();

    // Edit.
    await guardianRow.getByRole("link", { name: "Edit" }).click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Edit info for guardian" }),
    ).toBeVisible();
    await expectFields(
      page,
      {
        "Full name": "New Guardian",
        Relationship: "uncle",
        "Phone number": "0400000000",
        "Email address": "guardian@test.com",
        Address: "Guardian address",
      },
      { exact: true },
    );

    await page.getByLabel("Full name").fill("Renamed Guardian");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Successfully saved",
    );

    await goToEditFirstStudent(page);

    await expect(
      page.getByRole("row", { name: /Renamed Guardian uncle/ }),
    ).toBeVisible();

    // Remove.
    await page
      .getByRole("row", { name: /Renamed Guardian uncle/ })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(
      page.getByRole("row", { name: /Renamed Guardian/ }),
    ).toHaveCount(0);
    await expect(page.getByRole("row", { name: /Lolo mother/ })).toBeVisible();
  });

  test("should add, edit and remove a teacher", async ({ page }) => {
    acceptDialogs(page);

    await goToEditFirstStudent(page);

    // Add.
    await page.getByRole("link", { name: "Add a teacher" }).click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Add new teacher" }),
    ).toBeVisible();

    await fillFields(page, {
      "Full name": "New Teacher",
      "Email address": "teacher@test.com",
      "Name of the school": "Teacher school",
    });
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Successfully saved",
    );

    await goToEditFirstStudent(page);

    const teacherRow = page.getByRole("row", {
      name: /New Teacher Teacher school/,
    });

    await expect(teacherRow).toBeVisible();

    // Edit.
    await teacherRow.getByRole("link", { name: "Edit" }).click();
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Edit info for teacher" }),
    ).toBeVisible();
    await expectFields(page, {
      "Full name": "New Teacher",
      "Email address": "teacher@test.com",
      "Name of the school": "Teacher school",
    });

    await page.getByLabel("Full name").fill("Renamed Teacher");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Successfully saved",
    );

    await goToEditFirstStudent(page);

    await expect(
      page.getByRole("row", { name: /Renamed Teacher Teacher school/ }),
    ).toBeVisible();

    // Remove.
    await page
      .getByRole("row", { name: /Renamed Teacher Teacher school/ })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(
      page.getByRole("row", { name: /Renamed Teacher/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("row", { name: /Pippo Schoole 1/ }),
    ).toBeVisible();
  });

  test("should archive and re enable a student", async ({ page }) => {
    await goToEditFirstStudent(page);

    // Archive.
    await openHeaderAction(page, "Archive");

    await expect(
      page.getByRole("heading", { name: `Archive "${FIRST_STUDENT}"` }),
    ).toBeVisible();

    await page.getByPlaceholder("Reason to Archive").fill("Moved to Sydney");
    await page.getByRole("button", { name: "Archive" }).click();

    await expect(
      page.getByRole("heading", { name: "Archived Student" }),
    ).toBeVisible();
    await expect(page.getByText(`Student: ${FIRST_STUDENT}`)).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveValue("Moved to Sydney");

    // Archived students are hidden unless requested.
    await goToSidebarPage(page, "Students");

    await expect(page.getByRole("row", { name: FIRST_STUDENT })).toHaveCount(0);

    await page.getByLabel("Include archived students").check();

    await expect(
      page.getByRole("row", { name: FIRST_STUDENT }).getByTestId("archived"),
    ).toBeVisible();

    // Re enable.
    await page
      .getByRole("row", { name: FIRST_STUDENT })
      .getByRole("link", { name: "Edit" })
      .click();
    await waitForHydration(page);

    await expect(page.getByTitle("archived")).toBeVisible();

    await openHeaderAction(page, "Re enable student");

    await expect(
      page.getByRole("heading", { name: `Re enable "${FIRST_STUDENT}"` }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Re enable" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Student re enabled successfully",
    );

    await goToSidebarPage(page, "Students");

    await expect(
      page.getByRole("row", { name: FIRST_STUDENT }).getByTestId("archived"),
    ).toHaveCount(0);
    await expect(page.getByRole("row", { name: FIRST_STUDENT })).toBeVisible();
  });

  test("should add a new student", async ({ page }) => {
    await goToSidebarPage(page, "Students");

    await page.getByRole("link", { name: "Add new student" }).click();
    await page.waitForURL(/\/admin\/students\/new/);
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "Add new student" }),
    ).toBeVisible();

    // Guardians and teachers can only be added once the student exists.
    await expect(
      page.getByRole("link", { name: "School reports" }),
    ).toHaveCount(0);

    await fillFields(
      page,
      {
        "First name": "New",
        "Last name": "Kid",
        Address: "1 New street",
        "Best person to contact": "Mum",
        "Best contact method": "phone",
        "Name of the school": "New school",
        "Emergency contact full name": "Emergency name",
        "Emergency contact relationship": "aunt",
        "Emergency contact phone": "999999",
        "Emergency contact email": "new@emergency.com",
        "Emergency contact address": "New emergency address",
      },
      { exact: true },
    );
    await page.getByLabel("Chapter", { exact: true }).selectOption({
      label: "Butler",
    });
    await page.getByLabel("Gender").selectOption("FEMALE");
    await page.getByLabel("Date of birth").fill("2015-03-04");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("message").first()).toContainText(
      "Student updated successfully",
    );

    await goToSidebarPage(page, "Students");

    await page.getByPlaceholder("Search").fill("New Kid");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(
      page.getByRole("row", { name: "New Kid" }).getByRole("cell", {
        name: "Butler",
      }),
    ).toBeVisible();
  });

  test("should add and delete grades of a student", async ({ page }) => {
    await goToEditFirstStudent(page);

    await page.getByRole("link", { name: "Grades tracker" }).click();
    await page.waitForURL(/grades-tracker/);
    await waitForHydration(page);

    await expect(page.getByText("No grades yet")).toBeVisible();

    const addGrade = async (
      year: string,
      semester: string,
      subject: string,
      grade: string,
    ) => {
      await page.getByLabel("Year").selectOption(year);
      await page.getByLabel("Semester").selectOption(semester);
      await page.getByLabel("Subject").selectOption(subject);
      await page.getByLabel("Grade").selectOption(grade);
      await page.getByRole("button", { name: "Submit" }).click();
    };

    const mathsRow = page.getByRole("row", { name: /2024 Semester 1 Maths A/ });
    const englishRow = page.getByRole("row", {
      name: /2024 Semester 2 English B/,
    });

    await addGrade("2024", "sem1", "MATH", "A");

    await expect(mathsRow).toBeVisible();
    await expect(page.getByText("No grades yet")).not.toBeVisible();

    await addGrade("2024", "sem2", "ENG", "B");

    await expect(englishRow).toBeVisible();
    await expect(mathsRow).toBeVisible();

    // A subject can be graded once per semester.
    await addGrade("2024", "sem1", "MATH", "C");

    await expect(page.getByText("Grade entry already exists.")).toBeVisible();
    await expect(
      page.getByRole("row", { name: /2024 Semester 1 Maths C/ }),
    ).toHaveCount(0);

    await mathsRow.getByRole("button", { name: "Delete" }).click();

    await expect(mathsRow).toHaveCount(0);
    await expect(englishRow).toBeVisible();
  });
});
