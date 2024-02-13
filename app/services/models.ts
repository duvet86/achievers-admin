export type Result<T, E = string> =
  | { ok: true; value?: T }
  | { ok: false; error: E };

export interface TokenInfo {
  idToken: string;
  accessToken: string;
  expiresOn: string;
  issuedAt: string;
  refreshToken: string | null;
}

export const Environments = {
  Local: "local",
  Staging: "staging",
  Production: "production",
} as const;
export type Environment = (typeof Environments)[keyof typeof Environments];

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
