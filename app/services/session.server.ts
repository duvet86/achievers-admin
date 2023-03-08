import type { AzureUserWebAppWithRole } from "./azure.server";

import { createSessionStorage, redirect } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";
import { parseJwt } from "~/utils";

import { MicrosoftStrategy, SCOPE } from "./auth.server";
import { getAzureUserWithRolesByIdAsync } from "./azure.server";
import { refreshTokenAsync } from "./auth.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
invariant(process.env.CLIENT_ID, "CLIENT_ID must be set");
invariant(process.env.CLIENT_SECRET, "CLIENT_SECRET must be set");
invariant(process.env.TENANT_ID, "TENANT_ID must be set");
invariant(process.env.REDIRECT_URI, "REDIRECT_URI must be set");

export interface SessionUser {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const sessionStorage = createSessionStorage({
  cookie: {
    name: "__session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
  async createData(data, expires) {
    return data["oauth2:state"];
  },
  async readData(id) {
    const session = await prisma.session.findUnique({
      where: {
        id,
      },
    });

    return {
      "oauth2:state": id,
      user: session,
      strategy: "microsoft",
    };
  },
  async updateData(id, data, expires) {
    const user = data["user"];

    if (
      user &&
      user["userId"] &&
      user["accessToken"] &&
      user["refreshToken"] &&
      user["expiresIn"]
    ) {
      const userId = user["userId"];
      const accessToken = user["accessToken"];
      const refreshToken = user["refreshToken"];
      const expiresIn = user["expiresIn"];

      await prisma.session.upsert({
        where: {
          id,
        },
        create: {
          id,
          userId,
          accessToken,
          refreshToken,
          expiresIn,
        },
        update: {
          userId,
          accessToken,
          refreshToken,
          expiresIn,
        },
      });
    }
  },
  async deleteData(id) {
    try {
      await prisma.session.delete({
        where: {
          id,
        },
      });
    } catch {}
  },
});

export const authenticator = new Authenticator<SessionUser>(sessionStorage, {
  sessionKey: "user",
});

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");

  return sessionStorage.getSession(cookie);
}

export async function getSessionUserAsync(
  request: Request
): Promise<SessionUser> {
  const session = await getSession(request);

  const sessionUser = session.get(authenticator.sessionKey);

  if (
    !sessionUser.accessToken ||
    !sessionUser.expiresIn ||
    !sessionUser.refreshToken ||
    !sessionUser.userId
  ) {
    throw redirect("/logout");
  }

  const currentSession: SessionUser = {
    accessToken: sessionUser.accessToken,
    expiresIn: sessionUser.expiresIn,
    refreshToken: sessionUser.refreshToken,
    userId: sessionUser.userId,
  };

  const expiresInDate = new Date(
    new Date().setSeconds(new Date().getSeconds() + sessionUser.expiresIn)
  );

  if (expiresInDate >= new Date()) {
    return currentSession;
  }

  invariant(process.env.TENANT_ID, "TENANT_ID must be set");
  invariant(process.env.CLIENT_ID, "CLIENT_ID must be set");
  invariant(process.env.CLIENT_SECRET, "CLIENT_SECRET must be set");
  invariant(process.env.REDIRECT_URI, "REDIRECT_URI must be set");

  let { access_token, refresh_token, expires_in } = await refreshTokenAsync(
    process.env.TENANT_ID,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    sessionUser.refreshToken,
    process.env.REDIRECT_URI
  );

  const newSessionUser: SessionUser = {
    userId: sessionUser.userId,
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
  };

  session.set(authenticator.sessionKey, newSessionUser);

  await sessionStorage.commitSession(session);

  return newSessionUser;
}

export async function getSessionError(request: Request) {
  const session = await getSession(request);
  const error = session.get(authenticator.sessionErrorKey);

  return error;
}
const microsoftStrategy = new MicrosoftStrategy(
  {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    tenantId: process.env.TENANT_ID, // optional - necessary for organization without multitenant (see below)
    scope: SCOPE, // optional
    prompt: "login", // optional
  },
  async ({ extraParams, accessToken, refreshToken }) => {
    const userInfo = parseJwt<{
      oid: string;
    }>(extraParams.id_token);

    let azureUser: AzureUserWebAppWithRole;
    try {
      azureUser = await getAzureUserWithRolesByIdAsync(
        accessToken,
        userInfo.oid
      );
    } catch (e: any) {
      throw new AuthorizationError(e);
    }

    if (azureUser.appRoleAssignments.length === 0) {
      throw new AuthorizationError("NoPermissions");
    }

    return {
      userId: userInfo.oid,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: extraParams.expires_in,
    };
  }
);

authenticator.use(microsoftStrategy);
