import type { TokenInfo } from "../models";

import path from "node:path";

import { Authenticator } from "remix-auth";
import invariant from "tiny-invariant";

import { OAuth2Strategy } from "remix-auth-oauth2";
import { createCookie, redirect } from "react-router";
import { createFileSessionStorage } from "@react-router/node";

invariant(process.env.CLIENT_ID, "CLIENT_ID must be set");
invariant(process.env.CLIENT_SECRET, "CLIENT_SECRET must be set");
invariant(process.env.TENANT_ID, "TENANT_ID must be set");
invariant(process.env.REDIRECT_URI, "REDIRECT_URI must be set");
invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

const sessionCookie = createCookie("__session", {
  sameSite: "lax", // this helps with CSRF
  path: "/", // remember to add this so the cookie will work in all routes
  httpOnly: true, // for security reasons, make this cookie http only
  secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
});

export const sessionStorage_dev = createFileSessionStorage({
  cookie: sessionCookie,
  dir: path.join(process.cwd(), "dev_sessions"),
});

export const authenticator_dev = new Authenticator<TokenInfo>();

export const strategy_dev = new OAuth2Strategy(
  {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,

    authorizationEndpoint: `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
    redirectURI: process.env.REDIRECT_URI,
    scopes: ["openid", "profile", "email", "offline_access"],

    tokenRevocationEndpoint: `https://login.windows.net/${process.env.TENANT_ID}/oauth2/logout`,
  },
  ({ tokens }) => {
    if (new Date() >= tokens.accessTokenExpiresAt()) {
      throw redirect("/logout");
    }

    return Promise.resolve({
      idToken: tokens.idToken(),
      accessToken: tokens.accessToken(),
      expiresOn: tokens.accessTokenExpiresAt().toISOString(),
      refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
      issuedAt: new Date().toISOString(),
    });
  },
);

authenticator_dev.use(strategy_dev, "microsoft");
