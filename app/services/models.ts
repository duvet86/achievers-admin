export type Result<T, E = string> =
  | { ok: true; value?: T }
  | { ok: false; error: E };

export interface TokenInfo {
  idToken: string;
  accessToken: string;
  expiresOn: string;
  refreshToken: string | null;
}

export type Environment = "local" | "staging" | "production";
