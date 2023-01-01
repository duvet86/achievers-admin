import type { AzureUser } from "~/models/azure.server";

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import invariant from "tiny-invariant";

import { parseJwt } from "~/utils";
import { MicrosoftStrategy } from "~/services/auth.server";
import { getAzureUserByIdAsync } from "~/models/azure.server";

declare global {
  var __accessToken__: string | undefined;
}

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
invariant(process.env.CLIENT_ID, "CLIENT_ID must be set");
invariant(process.env.CLIENT_SECRET, "CLIENT_SECRET must be set");
invariant(process.env.TENANT_ID, "TENANT_ID must be set");
invariant(process.env.REDIRECT_URI, "REDIRECT_URI must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

export const authenticator = new Authenticator<AzureUser>(sessionStorage); // User is a custom user types you can define as you want

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getSessionUserAsync(
  request: Request
): Promise<AzureUser | undefined> {
  const session = await getSession(request);
  const userSession = session.get(authenticator.sessionKey);

  return userSession;
}

export async function requireSessionUserAsync(
  request: Request
): Promise<AzureUser> {
  const userSession = await getSessionUserAsync(request);

  if (!userSession) {
    throw redirect("/logout");
  }
  return userSession;
}

export async function getSessionError(request: Request) {
  const session = await getSession(request);
  const error = session.get(authenticator.sessionErrorKey);

  return error;
}

export async function logout(request: Request) {
  const session = await getSession(request);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

const microsoftStrategy = new MicrosoftStrategy(
  {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    tenantId: process.env.TENANT_ID, // optional - necessary for organization without multitenant (see below)
    scope: "openid profile email", // optional
    prompt: "login", // optional
  },
  async ({ extraParams, accessToken }) => {
    global.__accessToken__ = accessToken;

    const userInfo = parseJwt<{
      email?: string;
      preferred_username: string;
      roles: string[];
      oid: string;
    }>(extraParams.id_token);

    const azureUser = await getAzureUserByIdAsync(userInfo.oid);

    return azureUser;
  }
);

authenticator.use(microsoftStrategy);
