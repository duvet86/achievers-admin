import type { TokenInfo } from "./models";

import path from "node:path";

import {
  createCookie,
  createFileSessionStorage,
  redirect,
} from "@remix-run/node";
import { Authenticator } from "remix-auth";
import invariant from "tiny-invariant";

import { MicrosoftStrategy, SCOPE } from "./auth.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
invariant(process.env.CLIENT_ID, "CLIENT_ID must be set");
invariant(process.env.CLIENT_SECRET, "CLIENT_SECRET must be set");
invariant(process.env.TENANT_ID, "TENANT_ID must be set");
invariant(process.env.REDIRECT_URI, "REDIRECT_URI must be set");

const sessionCookie = createCookie("__session", {
  sameSite: "lax", // this helps with CSRF
  path: "/", // remember to add this so the cookie will work in all routes
  httpOnly: true, // for security reasons, make this cookie http only
  secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
});

const sessionStorage_dev = createFileSessionStorage({
  cookie: sessionCookie,
  dir: path.join(process.cwd(), "dev_sessions"),
});

export const authenticator_dev = new Authenticator<TokenInfo>(
  sessionStorage_dev
);

export async function getSessionInfoAsync_dev(
  request: Request
): Promise<TokenInfo> {
  const tokenInfo = await authenticator_dev.isAuthenticated(request, {
    failureRedirect: "/auth/microsoft",
  });

  if (
    new Date() >=
    new Date(
      new Date(tokenInfo.issuedAt).setSeconds(Number(tokenInfo.expiresOn))
    )
  ) {
    throw redirect("/logout");
  }

  return tokenInfo;
}

export async function getSessionError_dev(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await sessionStorage_dev.getSession(cookie);

  const error = session.get(authenticator_dev.sessionErrorKey);

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
  async ({ extraParams, accessToken, refreshToken }) => ({
    idToken: extraParams.id_token,
    accessToken: accessToken,
    expiresOn: extraParams.expires_in.toString(),
    refreshToken: refreshToken,
    issuedAt: new Date().toISOString(),
  })
);

authenticator_dev.use(microsoftStrategy);
