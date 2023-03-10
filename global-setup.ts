import type { FullConfig } from "@playwright/test";

import { chromium } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/");

  const loginButton = page.locator("button");
  await loginButton.click();

  const usernameInput = page.locator("input[type='email']");
  await usernameInput.fill(process.env.TEST_USERNAME!);

  let submit = page.locator("input[type='submit']");
  await submit.click();

  const passwordInput = page.locator("input[type='password']");
  await passwordInput.fill(process.env.TEST_PASSWORD!);

  submit = page.locator("input[type='submit']");
  await submit.click();

  const remindMe = page.locator("input[type='button']");
  await remindMe.click();

  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: "storageState.json" });
  await browser.close();
}

export default globalSetup;
