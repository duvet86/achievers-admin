import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";
import { utils, write } from "xlsx";

interface FieldOptions {
  // Use when a label is a substring of another one, e.g. "Address" and
  // "Emergency contact address".
  exact?: boolean;
}

export async function fillFields(
  page: Page,
  fields: Record<string, string>,
  { exact = false }: FieldOptions = {},
) {
  for (const [label, value] of Object.entries(fields)) {
    await page.getByLabel(label, { exact }).fill(value);
  }
}

export async function expectFields(
  page: Page,
  fields: Record<string, string>,
  { exact = false }: FieldOptions = {},
) {
  for (const [label, value] of Object.entries(fields)) {
    await expect(page.getByLabel(label, { exact })).toHaveValue(value);
  }
}

export async function goToSidebarPage(
  page: Page,
  name: string,
  startPath = "/",
) {
  await page.goto(startPath);

  const link = page.getByRole("link", { name, exact: true });
  const href = await link.getAttribute("href");

  await link.click();
  // The link is handled on the client, wait for the navigation to finish.
  await page.waitForURL((url) => url.pathname.startsWith(href!));
}

// Accept the `confirm()` dialogs used before destructive actions.
export function acceptDialogs(page: Page) {
  page.on("dialog", (dialog) => {
    void dialog.accept();
  });
}

// Pick an option of the custom searchable select (`SelectSearch`).
export async function selectSearchOption(
  page: Page,
  input: string,
  option: string,
) {
  await page.getByPlaceholder(input, { exact: true }).click();
  await page.getByRole("button", { name: option, exact: true }).click();
}

export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Build an `.xlsx` file in memory, one row per object.
export function buildSpreadsheet(rows: Record<string, unknown>[]) {
  const workbook = utils.book_new();

  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(rows, { cellDates: true }),
    "Sheet1",
  );

  return write(workbook, {
    type: "buffer",
    bookType: "xlsx",
    cellDates: true,
  }) as Buffer;
}

// Upload a file through the custom file input, which opens a file chooser.
export async function uploadFile(
  page: Page,
  label: string,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  const fileChooserPromise = page.waitForEvent("filechooser");

  await page.getByLabel(label).click();

  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles(file);
}

// The logged in user is a mentor and an admin, the mentor view starts here.
export async function goToMentorPage(page: Page, name: string) {
  await goToSidebarPage(page, name, "/mentor/home");
}

// The server date is mocked to 2024-11-24, keep the browser in sync.
export async function setMentorClock(page: Page) {
  await page.clock.setFixedTime(new Date("2024-11-24T00:00:00.000Z"));
}
