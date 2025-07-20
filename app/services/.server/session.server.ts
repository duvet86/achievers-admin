import type { RawRuleOf } from "@casl/ability";
import type { TokenInfo } from "../models";
import type { Subject, AppAbility } from "./permissions.server";

import { createCookie, redirect } from "react-router";

import { getCurrentHost, parseJwt } from "../utils";

import { trackException } from "./appinsights-logging.server";
import { authenticator_dev, sessionStorage_dev } from "./session-dev.server";
import { createAbility } from "./permissions.server";

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
  roles: string[];
  sub: string;
  tid: string;
  uti: string;
  ver: string;
  isAdmin: boolean;
  isMentor: boolean;
  isAttendances: boolean;
  email?: string;
}

const loginPath = "/.auth/login/aad?post_login_redirect_uri=/";

export async function getTokenInfoAsync(request: Request): Promise<TokenInfo> {
  if (process.env.CI ?? process.env.NODE_ENV !== "production") {
    const session = await sessionStorage_dev.getSession(
      request.headers.get("cookie"),
    );
    const user = session.get("user") as TokenInfo | undefined;

    if (user === undefined) {
      await sessionStorage_dev.destroySession(session);

      try {
        return await authenticator_dev.authenticate("microsoft", request);
      } catch (error) {
        const returnTo = new URL(request.url).searchParams.get("returnTo");

        if (!returnTo) {
          throw error;
        }

        if (error instanceof Response && isRedirect(error)) {
          error.headers.append(
            "Set-Cookie",
            await returnToCookie.serialize(returnTo),
          );
        }

        throw error;
      }
    }

    return user;
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
    trackException(
      new Error(
        `getLoggedUserInfoAsync: loggedUser has incorrect roles: ${JSON.stringify(loggedUser)}`,
      ),
    );
    throw redirect("/403");
  }

  return {
    ...loggedUser,
    isAdmin:
      loggedUser.roles.findIndex(
        (role) => role.includes("Admin") || role.includes("ChapterCoordinator"),
      ) !== -1,
    isMentor: loggedUser.roles.includes("Mentor"),
    isAttendances:
      loggedUser.roles.findIndex((role) => role.includes("Attendances")) !== -1,
  };
}

export function getChapterFromAttendancesRole(roles: string[]) {
  if (roles.length === 0) {
    return null;
  }

  const attendancesRole = roles.find((r) => r.includes("Attendances"));
  if (!attendancesRole) {
    return null;
  }

  const parts = attendancesRole.split(".");

  return Number(parts[2]);
}

export function getPermissionsAbility(roles: string[]) {
  const rules = roles.map<RawRuleOf<AppAbility>[]>((role) => {
    const parts = role.split(".");

    if (parts[0] === "Attendances") {
      return [
        {
          action: parts[1],
          subject: "MentorAttendancesArea",
          conditions: { id: Number(parts[2]) },
        } as RawRuleOf<AppAbility>,
      ];
    }

    if (parts[0] === "ChapterCoordinator") {
      if (parts[3] === "all") {
        return [
          {
            action: parts[1],
            subject: "ChapterArea",
          } as RawRuleOf<AppAbility>,
          {
            action: parts[1],
            subject: "SessionArea",
          } as RawRuleOf<AppAbility>,
          {
            action: parts[1],
            subject: "StudentArea",
          } as RawRuleOf<AppAbility>,
          {
            action: parts[1],
            subject: "UserArea",
          } as RawRuleOf<AppAbility>,
          {
            action: parts[1],
            subject: "Chapter",
            conditions: { id: Number(parts[2]) },
          } as RawRuleOf<AppAbility>,
        ];
      }

      return [
        {
          action: parts[1],
          subject: parts[3],
        } as RawRuleOf<AppAbility>,
        {
          action: parts[1],
          subject: "Chapter",
          conditions: { id: Number(parts[2]) },
        } as RawRuleOf<AppAbility>,
      ];
    }

    return [
      {
        action: parts[1],
        subject: parts[2],
      } as RawRuleOf<AppAbility>,
      {
        action: parts[1],
        subject: "Chapter",
      } as RawRuleOf<AppAbility>,
    ];
  });

  const ability = createAbility(rules.flat());

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

export const returnToCookie = createCookie("return-to", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  secure: process.env.NODE_ENV === "production",
});

function isRedirect(response: Response) {
  if (response.status < 300 || response.status >= 400) return false;
  return response.headers.has("Location");
}
