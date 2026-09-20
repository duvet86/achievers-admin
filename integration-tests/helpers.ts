import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";

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

// The app is server rendered. Interacting before hydration finishes can lose
// clicks and reset filled values, so wait for the page to settle after
// navigating.
export async function waitForHydration(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function goToSidebarPage(page: Page, name: string) {
  await page.goto("/");
  await waitForHydration(page);

  const link = page.getByRole("link", { name, exact: true });
  const href = await link.getAttribute("href");

  await link.click();
  // Waiting for the network alone can resolve before the navigation starts.
  await page.waitForURL((url) => url.pathname.startsWith(href!));
  await waitForHydration(page);
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
