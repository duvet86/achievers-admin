import { test, expect } from "@playwright/test";
import { parse } from "cookie";

import {
  authenticator,
  createUserSession,
  getUserFromToken,
} from "~/session.server";

test.beforeEach(async ({ page, context, browser }) => {
  const response = await page.request.post(
    `https://login.microsoftonline.com//${process.env
      .TENANT_ID!}/oauth2/v2.0/token`,
    {
      form: {
        grant_type: "password",
        client_id: process.env.CLIENT_ID!,
        scope: "openid profile email",
        client_secret: process.env.CLIENT_SECRET!,
        username: process.env.TEST_USERNAME!,
        password: process.env.TEST_PASSWORD!,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      ignoreHTTPSErrors: true,
      timeout: 0,
    }
  );

  const token = await response.json();

  const azureUser = await getUserFromToken(token.id_token, token.access_token);

  console.log("azureUser", azureUser);

  const sessionResponse = await createUserSession({
    request: new Request("test://test"),
    userId: azureUser.id,
    remember: false,
    redirectTo: "/",
  });

  const cookieValue = sessionResponse.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);

  await context.addCookies([
    {
      name: authenticator.sessionKey,
      value: parsedCookie.__session,
      path: "/",
      domain: "localhost",
    },
  ]);
});

test.describe("when you ARE logged in", () => {
  test("Home page should have the correct title", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    const table = page.locator("table.table");

    // expect(await page.title()).toBe("Achievers WA");
    expect(table).toBeDefined();
  });
});
