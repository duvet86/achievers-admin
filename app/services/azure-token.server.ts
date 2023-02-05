declare global {
  var __accessToken__: string | undefined;
}

export function setAzureToken(accessToken: string | undefined) {
  global.__accessToken__ = accessToken;
}

export function getAzureToken() {
  if (!global.__accessToken__) {
    throw new Error("_accessToken must be defined.");
  }

  return global.__accessToken__;
}
