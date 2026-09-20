import { readFileSync } from "node:fs";

import type { Page } from "@playwright/test";

import { test, expect } from "@playwright/test";
import { read, utils } from "xlsx";

import {
  XLSX_MIME_TYPE,
  buildSpreadsheet,
  goToSidebarPage,
  uploadFile,
} from "../helpers";
import { seedDataAsync } from "../test-data";

const UPLOAD_LABEL = "Upload a spreadsheet with new students";

const NEW_STUDENT = {
  "First Name": "Import",
  "Last Name": "Student",
  Chapter: "Girrawheen",
  Gender: "Female",
  "Approval to publish photographs?": "Yes",
  "Start Date": new Date("2024-02-01T00:00:00.000Z"),
  "Date of Birth": new Date("2014-05-12T00:00:00.000Z"),
  Address: "1 Import street",
  "Dietary Requirements/Allergies": "No",
  "Best Person to Contact": "Mum",
  "Best Contact Method": "phone",
  "Parent/Guardian 1 Full name": "Guardian One",
  "Parent/Guardian 1 Relationship": "mother",
  "Parent/Guardian 1 Phone": 400111111,
  "Parent/Guardian 1 Email": "one@import.com",
  "Parent/Guardian 1 Address": "1 Import street",
  "Parent/Guardian 2 Full name": "Guardian Two",
  "Parent/Guardian 2 Relationship": "father",
  "Parent/Guardian 2 Phone": 400222222,
  "Parent/Guardian 2 Email": "two@import.com",
  "Parent/Guardian 2 Address": "2 Import street",
  "Name of School": "Import school",
  "Teacher's Email": "teacher@import.com",
  "Teacher's Name (s)": "Teacher One",
};

// Already created by the seed.
const EXISTING_STUDENT = {
  ...NEW_STUDENT,
  "First Name": "student_0",
  "Last Name": "student_lastname_0",
};

async function goToImportStudents(page: Page) {
  await goToSidebarPage(page, "Students");

  await page.getByTitle("actions").click();
  await page.getByRole("link", { name: "Import students" }).click();
  await page.waitForURL(/\/admin\/students\/import$/);
}

async function importStudents(page: Page, rows: Record<string, unknown>[]) {
  await uploadFile(page, UPLOAD_LABEL, {
    name: "students.xlsx",
    mimeType: XLSX_MIME_TYPE,
    buffer: buildSpreadsheet(rows),
  });

  await page.getByRole("button", { name: "Import" }).click();
}

test.describe("Admin students import and export", () => {
  // Every test seeds the database, which takes most of the default timeout.
  test.describe.configure({ timeout: 60 * 1000 });

  test.beforeEach(async () => {
    await seedDataAsync();
  });

  test("should import students from file", async ({ page }) => {
    await goToImportStudents(page);

    // The student that already exists is not imported again.
    await importStudents(page, [NEW_STUDENT, EXISTING_STUDENT]);

    await expect(
      page.getByRole("columnheader", { name: "Full name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Errors" }),
    ).toBeVisible();

    const importedRow = page.getByRole("row", { name: /Import Student/ });

    await expect(importedRow).toBeVisible();
    await expect(importedRow.getByRole("link", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByText("Error!")).not.toBeVisible();

    // History.
    await page.getByRole("link", { name: "View history" }).click();
    await page.waitForURL(/import-history/);

    await expect(
      page.getByRole("heading", { name: "History of imported students" }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Import Student/ }),
    ).toBeVisible();

    // The imported student has its guardians and teacher.
    await goToSidebarPage(page, "Students");

    await page.getByPlaceholder("Search").fill("Import");
    await page.keyboard.press("Enter");

    const studentRow = page.getByRole("row", { name: /Import Student/ });

    await expect(
      studentRow.getByRole("cell", { name: "Girrawheen" }),
    ).toBeVisible();

    await studentRow.getByRole("link", { name: "Edit" }).click();

    await expect(page.getByLabel("First name")).toHaveValue("Import");
    await expect(page.getByLabel("Last name")).toHaveValue("Student");
    await expect(page.getByLabel("Gender")).toHaveValue("FEMALE");
    await expect(page.getByLabel("Name of the school")).toHaveValue(
      "Import school",
    );
    await expect(
      page.getByRole("row", { name: /Guardian One mother/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Guardian Two father/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Teacher One Import school/ }),
    ).toBeVisible();
  });

  test("should not import students that already exist", async ({ page }) => {
    await goToImportStudents(page);

    await importStudents(page, [EXISTING_STUDENT]);

    await expect(page.getByText("No new students to import.")).toBeVisible();
    await expect(page.getByText("No students imported")).toBeVisible();
  });

  test("should not import students with a wrong date of birth", async ({
    page,
  }) => {
    await goToImportStudents(page);

    await importStudents(page, [{ ...NEW_STUDENT, "Date of Birth": "wrong" }]);

    await expect(page.getByText("Error!")).toBeVisible();
    await expect(page.getByText("Incorrect date of birth")).toBeVisible();
    await expect(page.getByText("row number 1")).toBeVisible();
  });

  test("should not import without a file", async ({ page }) => {
    await goToImportStudents(page);

    // The browser sends an empty file when none has been chosen.
    await page.getByRole("button", { name: "Import" }).click();

    await expect(page.getByText("Error!")).toBeVisible();
    await expect(page.getByText("Nothing to import")).toBeVisible();
  });

  test("should export students", async ({ page }) => {
    await goToSidebarPage(page, "Students");

    await page.getByTitle("actions").click();

    const downloadPromise = page.waitForEvent("download");

    await page.getByRole("link", { name: "Export students" }).click();

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("SheetJSNode.xlsx");

    const workbook = read(readFileSync(await download.path()), {
      cellDates: true,
    });
    const rows = workbook.SheetNames.flatMap((name) =>
      utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name]),
    );

    expect(rows).toHaveLength(18);

    const firstStudent = rows.find((row) => row["First Name"] === "student_0");

    expect(firstStudent).toMatchObject({
      "Last Name": "student_lastname_0",
      Chapter: "Girrawheen",
      Address: "address",
      "Best Person to Contact": "Tony",
      "Name of School": "school_0",
      "Parent/Guardian 1 Relationship": "mother",
      "Parent/Guardian 1 Email": "asd@asd.com",
      "Teacher's Name (s)": "Pippo",
      "Teacher's Email": "asd@asd.com",
    });
  });

  test("should export the guardians full name", async ({ page }) => {
    await goToSidebarPage(page, "Students");

    await page.getByTitle("actions").click();

    const downloadPromise = page.waitForEvent("download");

    await page.getByRole("link", { name: "Export students" }).click();

    const download = await downloadPromise;
    const workbook = read(readFileSync(await download.path()));
    const rows = workbook.SheetNames.flatMap((name) =>
      utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name]),
    );

    expect(rows.find((row) => row["First Name"] === "student_0")).toMatchObject(
      {
        "Parent/Guardian 1 Full name": "Lolo",
        "Parent/Guardian 2 Full name": "Lolo2",
      },
    );
  });
});
