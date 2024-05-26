import type { StrategyVerifyCallback } from "remix-auth";
import type {
  OAuth2Profile,
  OAuth2StrategyOptions,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";

import { OAuth2Strategy } from "remix-auth-oauth2";

export const SCOPE = ["openid", "profile", "email", "offline_access"];

interface MicrosoftStrategyOptions
  extends Omit<
    OAuth2StrategyOptions,
    | "authorizationEndpoint"
    | "tokenEndpoint"
    | "authenticateWith"
    | "codeChallengeMethod"
  > {
  tenantId?: string;
  prompt?: string;
}

interface MicrosoftProfile extends OAuth2Profile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: [{ value: string }];
  _json: {
    sub: string;
    name: string;
    family_name: string;
    given_name: string;
    email: string;
  };
}

interface MicrosoftExtraParams extends Record<string, string | number> {
  expires_in: 3599;
  token_type: "Bearer";
  scope: string;
  id_token: string;
}

export interface RefreshTokenResponse {
  token_type: string;
  scope: string;
  expires_in: string;
  access_token: string;
  refresh_token: string;
}

export class MicrosoftStrategy<TUser> extends OAuth2Strategy<
  TUser,
  MicrosoftProfile,
  MicrosoftExtraParams
> {
  private prompt: string;

  name = "microsoft";

  constructor(
    {
      clientId,
      clientSecret,
      redirectURI,
      scopes,
      prompt,
      tenantId = "common",
    }: MicrosoftStrategyOptions,
    verify: StrategyVerifyCallback<
      TUser,
      OAuth2StrategyVerifyParams<MicrosoftProfile, MicrosoftExtraParams>
    >,
  ) {
    super(
      {
        clientId,
        clientSecret,
        redirectURI,
        authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        authenticateWith: "request_body",
        codeChallengeMethod: "S256",
        scopes,
      },
      verify,
    );
    this.prompt = prompt ?? "none";
  }

  protected authorizationParams(params: URLSearchParams): URLSearchParams {
    params.set("prompt", this.prompt);

    return params;
  }
}
