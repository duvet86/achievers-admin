import type { TokenInfo } from "../models";

import { redirect } from "@remix-run/node";

import { getCurrentHost, parseJwt } from "../utils";
import { trackException } from "./appinsights-logging.server";
import { getSessionInfoAsync_dev } from "./session-dev.server";

export type ROLES = "Admin" | "Mentor";

export interface CurentUserInfo {
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  aio: string;
  name: string;
  oid: string;
  preferred_username: string;
  rh: string;
  roles: ROLES[];
  sub: string;
  tid: string;
  uti: string;
  ver: string;
}

const loginPath = "/.auth/login/aad?post_login_redirect_uri=/";

const IS_DEV = process.env.NODE_ENV === "development";
const IS_CI = !!process.env.CI;

export const ROLE_MAPPINGS: Record<ROLES, string> = {
  Admin:
    IS_DEV || IS_CI
      ? "f1f43596-ed2b-4044-8979-dd78ec6ebe08"
      : "e567add0-fec3-4c87-941a-05dd2e18cdfd",
  Mentor:
    IS_DEV || IS_CI
      ? "83c9c558-9bbb-498d-8082-fc9dc1884618"
      : "a2ed7b54-4379-465d-873d-2e182e0bd8ef",
} as const;

export async function getTokenInfoAsync(request: Request): Promise<TokenInfo> {
  if (process.env.CI || process.env.NODE_ENV !== "production") {
    return await getSessionInfoAsync_dev(request);
  } else {
    const idToken = request.headers.get("X-MS-TOKEN-AAD-ID-TOKEN");
    const accessToken = request.headers.get("X-MS-TOKEN-AAD-ACCESS-TOKEN");
    const expiresOn = request.headers.get("X-MS-TOKEN-AAD-EXPIRES-ON");
    const refreshToken = request.headers.get("X-MS-TOKEN-AAD-REFRESH-TOKEN");

    if (refreshToken === null) {
      trackException({
        exception: new Error(
          "Missing refresh token. See: https://learn.microsoft.com/en-us/azure/app-service/configure-authentication-oauth-tokens#refresh-auth-tokens",
        ),
      });
    }

    if (idToken === null || accessToken === null || expiresOn === null) {
      throw redirect(getCurrentHost(request) + loginPath);
    }

    if (refreshToken !== null && new Date() >= new Date(expiresOn)) {
      const resp = await fetch(getCurrentHost(request) + "/.auth/refresh");
      if (!resp.ok) {
        trackException({
          exception: new Error(await resp.text()),
        });

        throw redirect(getCurrentHost(request) + loginPath);
      }
    }

    return {
      idToken,
      accessToken,
      expiresOn,
      refreshToken,
      issuedAt: new Date().toISOString(),
    };
  }
}

export async function getLoggedUserInfoAsync(
  request: Request,
): Promise<CurentUserInfo> {
  const tokenInfo = await getTokenInfoAsync(request);

  return parseJwt<CurentUserInfo>(tokenInfo.idToken);
}
