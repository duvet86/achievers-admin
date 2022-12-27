import { safeRedirect, parseJwt } from "./utils";

test("safeRedirect returns default redirect", () => {
  expect(safeRedirect("test")).toBe("/");
});

test("safeRedirect returns path", () => {
  expect(safeRedirect("/test")).toBe("/test");
});

test("parseJwt returns JWT object", () => {
  expect(
    parseJwt<{
      email?: string;
      preferred_username: string;
      roles: string[];
      oid: string;
    }>(
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIyZjg1NGE1Ni0xMWE3LTRlODItOTFmNy0yODdhYWQ1MTViYjQiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNTlmZWVjODQtODA4YS00NWI4LTlkZTUtNTA3ZTJkNWQ3Y2U5L3YyLjAiLCJpYXQiOjE2NzIxMzk2NjQsIm5iZiI6MTY3MjEzOTY2NCwiZXhwIjoxNjcyMTQzNTY0LCJlbWFpbCI6Imx1Y2FtYXJhbmdvbjg2QGdtYWlsLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkxODgwNDBkLTZjNjctNGM1Yi1iMTEyLTM2YTMwNGI2NmRhZC8iLCJuYW1lIjoiTHVjYSBNYXJhbmdvbiIsIm9pZCI6IjUyMjM3OGRiLWQ1NDYtNDM5MC04NzM1LWE1Y2JhYWQxZTU5YSIsInByZWZlcnJlZF91c2VybmFtZSI6Imx1Y2FtYXJhbmdvbjg2QGdtYWlsLmNvbSIsInJoIjoiMC5BV1lBaE96LVdZcUF1RVdkNVZCLUxWMTg2VlpLaFMtbkVZSk9rZmNvZXExUlc3Um1BRlEuIiwicm9sZXMiOlsiQWRtaW4iXSwic3ViIjoiRTVVbm52Z2ZwVW5xU3JhYWQ2dHNUaUhnT3VBa1dZRGVGc2RTSDM5VVplMCIsInRpZCI6IjU5ZmVlYzg0LTgwOGEtNDViOC05ZGU1LTUwN2UyZDVkN2NlOSIsInV0aSI6IlA0TFgzcU40cTBLSWNaSzgtdUU2QVEiLCJ2ZXIiOiIyLjAifQ.d6sNpOJ5ucodCbYIFT-Uj6aSPkv0mnNDbMyKD6aWUWawZ6OC08vQXvdF8VeQiaR3OjQdA06OwD3PL8Cy83uMbMT6pIh9IUokZSdwqDi3IqNbtT9x0uSSkM7k4z69MPYNqUUbaTgeBP23LAfB005AURtAGPAyB0zFx1P6tLMcpZm7_olJ_HY5MpIp-0RU9EHWdx2ztiJGzxPTAFZ2b4vGVBvQRd6MqjaOd2CA8wZUBtt1vx_1qjCAAfDvXHuZY_Ydxoj7w6JkRlrIl2CalrggcQpm5UMGZGYHiyIkMhK0d7ORUkEO1bYUiCJn4TIZPzSTdIOQBntPjjSWtkT5yQS_bg"
    )
  ).toStrictEqual({
    aud: "2f854a56-11a7-4e82-91f7-287aad515bb4",
    iss: "https://login.microsoftonline.com/59feec84-808a-45b8-9de5-507e2d5d7ce9/v2.0",
    iat: 1672139664,
    nbf: 1672139664,
    exp: 1672143564,
    email: "lucamarangon86@gmail.com",
    idp: "https://sts.windows.net/9188040d-6c67-4c5b-b112-36a304b66dad/",
    name: "Luca Marangon",
    oid: "522378db-d546-4390-8735-a5cbaad1e59a",
    preferred_username: "lucamarangon86@gmail.com",
    rh: "0.AWYAhOz-WYqAuEWd5VB-LV186VZKhS-nEYJOkfcoeq1RW7RmAFQ.",
    roles: ["Admin"],
    sub: "E5UnnvgfpUnqSraad6tsTiHgOuAkWYDeFsdSH39UZe0",
    tid: "59feec84-808a-45b8-9de5-507e2d5d7ce9",
    uti: "P4LX3qN4q0KIcZK8-uE6AQ",
    ver: "2.0",
  });
});
