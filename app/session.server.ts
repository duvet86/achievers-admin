import type { AzureUserWithRole } from "~/services/azure.server";

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import invariant from "tiny-invariant";

import { parseJwt } from "~/utils";
import { MicrosoftStrategy } from "~/services/auth.server";
import { setAzureToken } from "~/services/azure-token.server";
import { getAzureUserWithRolesByIdAsync } from "~/services/azure.server";

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

export const authenticator = new Authenticator<AzureUserWithRole>(
  sessionStorage
); // User is a custom user types you can define as you want

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getSessionUserAsync(
  request: Request
): Promise<AzureUserWithRole | undefined> {
  const session = await getSession(request);
  const userSession = session.get(authenticator.sessionKey);

  return userSession;
}

export async function requireSessionUserAsync(
  request: Request
): Promise<AzureUserWithRole> {
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

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(authenticator.sessionKey, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function getUserFromToken(idToken: string, accessToken: string) {
  const userInfo = parseJwt<{
    email?: string;
    preferred_username: string;
    roles: string[];
    oid: string;
  }>(idToken);

  setAzureToken(accessToken);

  return await getAzureUserWithRolesByIdAsync(userInfo.oid);
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
  async ({ accessToken, extraParams }) => {
    try {
      const azureUser = await getUserFromToken(
        extraParams.id_token,
        accessToken
      );

      if (azureUser.appRoleAssignments.length === 0) {
        throw new AuthorizationError("nopermissions");
      }

      return azureUser;
    } catch (e: any) {
      throw new AuthorizationError(e.Message);
    }
  }
);

authenticator.use(microsoftStrategy);
