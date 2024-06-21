import { redirect } from "@remix-run/node";

import {
  getLoggedUserInfoAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";

import { loader } from "./route";

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
    });
    vi.mocked(getUserByAzureADIdAsync).mockResolvedValueOnce({
      id: 1,
      azureADId: null,
      email: "",
      firstName: "",
      lastName: "",
      fullName: "",
      mobile: "",
      addressStreet: "",
      addressSuburb: "",
      addressState: "",
      addressPostcode: "",
      additionalEmail: null,
      dateOfBirth: null,
      emergencyContactName: null,
      emergencyContactNumber: null,
      emergencyContactAddress: null,
      emergencyContactRelationship: null,
      nextOfKinName: null,
      nextOfKinNumber: null,
      nextOfKinAddress: null,
      nextOfKinRelationship: null,
      profilePicturePath: null,
      hasApprovedToPublishPhotos: null,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      volunteerAgreementSignedOn: null,
      frequencyInDays: 7,
      chapterId: 2,
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/mentor/volunteer-agreement"));
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
    });
    vi.mocked(getUserByAzureADIdAsync).mockResolvedValueOnce({
      id: 1,
      azureADId: null,
      email: "",
      firstName: "",
      lastName: "",
      fullName: "",
      mobile: "",
      addressStreet: "",
      addressSuburb: "",
      addressState: "",
      addressPostcode: "",
      additionalEmail: null,
      dateOfBirth: null,
      emergencyContactName: null,
      emergencyContactNumber: null,
      emergencyContactAddress: null,
      emergencyContactRelationship: null,
      nextOfKinName: null,
      nextOfKinNumber: null,
      nextOfKinAddress: null,
      nextOfKinRelationship: null,
      profilePicturePath: null,
      hasApprovedToPublishPhotos: null,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      volunteerAgreementSignedOn: new Date(),
      frequencyInDays: 7,
      chapterId: 2,
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/mentor/home"));
  });
});
