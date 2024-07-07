import type { TokenInfo } from "../models";

import { redirect } from "@remix-run/node";
import { RawRuleOf } from "@casl/ability";

import { getCurrentHost, parseJwt } from "../utils";

import { trackException } from "./appinsights-logging.server";
import { getSessionInfoAsync_dev } from "./session-dev.server";
import {
  Subject,
  AppAbility,
  createAbility,
  ROLES,
} from "./permissions.server";

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
  isAdmin: boolean;
  isMentor: boolean;
}

const loginPath = "/.auth/login/aad?post_login_redirect_uri=/";

export async function getTokenInfoAsync(request: Request): Promise<TokenInfo> {
  if (process.env.CI || process.env.NODE_ENV !== "production") {
    return await getSessionInfoAsync_dev(request);
  } else {
    const idToken = request.headers.get("X-MS-TOKEN-AAD-ID-TOKEN");
    const accessToken = request.headers.get("X-MS-TOKEN-AAD-ACCESS-TOKEN");
    const expiresOn = request.headers.get("X-MS-TOKEN-AAD-EXPIRES-ON");
    const refreshToken = request.headers.get("X-MS-TOKEN-AAD-REFRESH-TOKEN");

    if (refreshToken === null) {
      trackException(
        new Error(
          "Missing refresh token. See: https://learn.microsoft.com/en-us/azure/app-service/configure-authentication-oauth-tokens#refresh-auth-tokens",
        ),
      );
    }

    if (idToken === null || accessToken === null || expiresOn === null) {
      throw redirect(getCurrentHost(request) + loginPath);
    }

    if (refreshToken !== null && new Date() >= new Date(expiresOn)) {
      const resp = await fetch(getCurrentHost(request) + "/.auth/refresh");
      if (!resp.ok) {
        trackException(new Error(await resp.text()));

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

  const loggedUser = parseJwt<CurentUserInfo>(tokenInfo.idToken);

  if (!loggedUser.roles || loggedUser.roles.length === 0) {
    throw redirect("/403");
  }

  return {
    ...loggedUser,
    isAdmin:
      loggedUser.roles.findIndex(
        (role) => role.includes("Admin") || role.includes("ChapterCoordinator"),
      ) !== -1,
    isMentor: loggedUser.roles.includes("Mentor"),
  };
}

export function getPermissionsAbility(roles: ROLES[]) {
  const rules = roles.map<RawRuleOf<AppAbility>>((role) => {
    const parts = role.split(".");

    if (parts[0] === "ChapterCoordinator") {
      return {
        action: parts[1],
        subject: parts[3],
        conditions: { id: Number(parts[2]) },
      } as RawRuleOf<AppAbility>;
    }

    return {
      action: parts[1],
      subject: parts[2],
    } as RawRuleOf<AppAbility>;
  });

  const ability = createAbility(rules);

  return ability;
}

export async function isLoggedUserBlockedAsync(
  request: Request,
  subject: Subject,
): Promise<boolean> {
  const loggedUser = await getLoggedUserInfoAsync(request);

  const ability = getPermissionsAbility(loggedUser.roles);

  return ability.cannot("manage", subject);
}
