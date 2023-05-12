import type { TokenInfo } from "./models";

import invariant from "tiny-invariant";

import { parseJwt } from "./utils";
import { getSessionInfoAsync_dev } from "./session-dev.server";

export async function getTokenInfoAsync(request: Request): Promise<TokenInfo> {
  if (process.env.CI || process.env.NODE_ENV !== "production") {
    return await getSessionInfoAsync_dev(request);
  } else {
    const idToken = request.headers.get("X-MS-TOKEN-AAD-ID-TOKEN");
    const accessToken = request.headers.get("X-MS-TOKEN-AAD-ACCESS-TOKEN");
    const expiresOn = request.headers.get("X-MS-TOKEN-AAD-EXPIRES-ON");
    const refreshToken = request.headers.get("X-MS-TOKEN-AAD-REFRESH-TOKEN");

    invariant(idToken);
    invariant(accessToken);
    invariant(expiresOn);
    invariant(refreshToken);

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
