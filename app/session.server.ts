import type { User } from "@prisma/client";

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import invariant from "tiny-invariant";

import { getOrCreateUserAsync, getUserByIdAsync } from "~/models/user.server";
import { MicrosoftStrategy } from "~/services/auth.server";
import { parseJwt } from "~/utils";

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

export const authenticator = new Authenticator<string>(sessionStorage); // User is a custom user types you can define as you want

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(authenticator.sessionKey);

  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) {
    return null;
  }

  const user = await getUserByIdAsync(userId);
  if (user === null) {
    throw await logout(request);
  }

  return user;
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
  async ({ accessToken }) => {
    const userInfo = parseJwt<{ email: string }>(accessToken);

    const user = await getOrCreateUserAsync(userInfo.email);

    return user.id;
  }
);

authenticator.use(microsoftStrategy);
