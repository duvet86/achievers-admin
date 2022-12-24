import type { StrategyVerifyCallback } from "remix-auth";
import type {
  OAuth2Profile,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";

import { OAuth2Strategy } from "remix-auth-oauth2";

interface MicrosoftStrategyOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string;
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

export class MicrosoftStrategy<User> extends OAuth2Strategy<
  User,
  MicrosoftProfile,
  MicrosoftExtraParams
> {
  name = "microsoft";

  private scope: string;
  private prompt: string;

  constructor(
    {
      clientId,
      clientSecret,
      redirectUri,
      scope,
      prompt,
      tenantId = "common",
    }: MicrosoftStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<MicrosoftProfile, MicrosoftExtraParams>
    >
  ) {
    super(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: redirectUri,
        authorizationURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        tokenURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      },
      verify
    );
    this.scope = scope ?? "openid profile email";
    this.prompt = prompt ?? "none";
  }

  protected authorizationParams() {
    return new URLSearchParams({
      scope: this.scope,
      prompt: this.prompt,
    });
  }
}
