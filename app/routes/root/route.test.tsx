import { redirect } from "react-router";

import { getLoggedUserInfoAsync } from "~/services/.server";

import { getUserByAzureADIdAsync } from "./services.server";
import { loader } from "./route";

vi.mock("./services.server");
vi.mock("~/services/.server", async () => {
  process.env.SESSION_SECRET = "Test";
  process.env.CLIENT_ID = "Test";
  process.env.CLIENT_SECRET = "Test";
  process.env.TENANT_ID = "Test";
  process.env.REDIRECT_URI = "Test";

  const actual: object = await vi.importActual("~/services/.server");

  return {
    ...actual,
    getLoggedUserInfoAsync: vi.fn(),
    getUserByAzureADIdAsync: vi.fn(),
  };
});

describe("Loader", () => {
  beforeEach(() => {
    vi.mocked(getLoggedUserInfoAsync).mockReset();
    vi.mocked(getUserByAzureADIdAsync).mockReset();
  });

  it("should redirect to users page for admin user", async () => {
    vi.mocked(getLoggedUserInfoAsync).mockResolvedValueOnce({
      aud: "",
      iss: "",
      iat: 1,
      nbf: 1,
      exp: 1,
      aio: "",
      name: "",
      oid: "",
      preferred_username: "test",
      rh: "",
      roles: ["Admin"],
      sub: "",
      tid: "",
      uti: "",
      ver: "",
      isAdmin: true,
      isMentor: false,
      isAttendances: false,
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/admin/home"));
  });

  it("should redirect to volunteer-agreement for mentor user", async () => {
    vi.mocked(getLoggedUserInfoAsync).mockResolvedValueOnce({
      aud: "",
      iss: "",
      iat: 1,
      nbf: 1,
      exp: 1,
      aio: "",
      name: "",
      oid: "",
      preferred_username: "test",
      rh: "",
      roles: ["Mentor"],
      sub: "",
      tid: "",
      uti: "",
      ver: "",
      isAdmin: false,
      isMentor: true,
      isAttendances: false,
    });
    vi.mocked(getUserByAzureADIdAsync).mockResolvedValueOnce({
      volunteerAgreementSignedOn: null,
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/volunteer-agreement"));
  });

  it("should redirect to home for mentor user", async () => {
    vi.mocked(getLoggedUserInfoAsync).mockResolvedValueOnce({
      aud: "",
      iss: "",
      iat: 1,
      nbf: 1,
      exp: 1,
      aio: "",
      name: "",
      oid: "",
      preferred_username: "test",
      rh: "",
      roles: ["Mentor"],
      sub: "",
      tid: "",
      uti: "",
      ver: "",
      isAdmin: false,
      isMentor: true,
      isAttendances: false,
    });
    vi.mocked(getUserByAzureADIdAsync).mockResolvedValueOnce({
      volunteerAgreementSignedOn: new Date(),
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/mentor/home"));
  });
});
