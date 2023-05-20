import type { TokenInfo } from "./models";

import { redirect } from "@remix-run/node";

import { getCurrentHost, parseJwt } from "./utils";
import { getSessionInfoAsync_dev } from "./session-dev.server";
import { trackException, trackTrace } from "./appinsights-logging.server";

const loginPath = "/.auth/login/aad?post_login_redirect_uri=/";

export async function getTokenInfoAsync(request: Request): Promise<TokenInfo> {
  if (process.env.CI || process.env.NODE_ENV !== "production") {
    return await getSessionInfoAsync_dev(request);
  } else {
    const idToken = request.headers.get("X-MS-TOKEN-AAD-ID-TOKEN");
    const accessToken = request.headers.get("X-MS-TOKEN-AAD-ACCESS-TOKEN");
    const expiresOn = request.headers.get("X-MS-TOKEN-AAD-EXPIRES-ON");
    const refreshToken = request.headers.get("X-MS-TOKEN-AAD-REFRESH-TOKEN");

    trackTrace({
      message: "GET_TOKEN",
      properties: {
        "X-MS-TOKEN-AAD-ID-TOKEN": idToken,
        "X-MS-TOKEN-AAD-ACCESS-TOKEN": accessToken,
        "X-MS-TOKEN-AAD-EXPIRES-ON": expiresOn,
        "X-MS-TOKEN-AAD-REFRESH-TOKEN": refreshToken,
      },
    });

    if (
      idToken === null ||
      accessToken === null ||
      expiresOn === null ||
      refreshToken === null
    ) {
      throw redirect(getCurrentHost(request) + loginPath);
    }

    if (new Date() >= new Date(expiresOn)) {
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
    };
  }
}

export async function getCurrentUserADIdAsync(
  request: Request
): Promise<string> {
  const tokenInfo = await getTokenInfoAsync(request);

  const userInfo = parseJwt<{
    oid: string;
  }>(tokenInfo.idToken);

  return userInfo.oid; // Azure AD id for the current logged in user.
}
