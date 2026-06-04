import type { TokenInfo } from "../models";
import type { CurentUserInfo } from "./session.server";

export const DEV_BYPASS_OID = "00000000-0000-0000-0000-000000000001";
export const DEV_BYPASS_EMAIL = "dev-admin@local.test";

const DEV_ADMIN_ROLES = [
  "Admin.manage.UserArea",
  "Admin.manage.StudentArea",
  "Admin.manage.SessionArea",
  "Admin.manage.ChapterArea",
  "Admin.manage.SchoolTermArea",
  "Admin.manage.ConfigArea",
  "Admin.manage.PermissionsArea",
  "Admin.manage.GoalsArea",
  "Mentor",
];

export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_AUTH_BYPASS === "true"
  );
}

export function buildDevTokenInfo(): TokenInfo {
  const now = Math.floor(Date.now() / 1000);
  const oneYear = 60 * 60 * 24 * 365;

  const payload: CurentUserInfo = {
    aud: "dev",
    iss: "dev",
    iat: now,
    nbf: now,
    exp: now + oneYear,
    aio: "dev",
    name: "Dev Admin",
    oid: DEV_BYPASS_OID,
    preferred_username: DEV_BYPASS_EMAIL,
    rh: "dev",
    roles: DEV_ADMIN_ROLES,
    sub: DEV_BYPASS_OID,
    tid: "dev",
    uti: "dev",
    ver: "2.0",
    email: DEV_BYPASS_EMAIL,
    isAdmin: true,
    isMentor: true,
    isAttendances: false,
  };

  // parseJwt() base64-decodes segment [1] only; signature is never verified.
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  const idToken = `${header}.${body}.`;

  const expiresOn = new Date((now + oneYear) * 1000).toISOString();

  return {
    idToken,
    accessToken: "dev-bypass-access-token",
    expiresOn,
    issuedAt: new Date(now * 1000).toISOString(),
    refreshToken: null,
  };
}
