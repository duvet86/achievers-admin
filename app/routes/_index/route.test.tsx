import { redirect } from "@remix-run/node";

import {
  ROLES,
  getAzureUserWithRolesByIdAsync,
  getCurrentUserADIdAsync,
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
    getCurrentUserADIdAsync: vi.fn(),
    getAzureUserWithRolesByIdAsync: vi.fn(),
    getUserByAzureADIdAsync: vi.fn(),
  };
});

describe("Loader", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUserADIdAsync).mockReset();
    vi.mocked(getAzureUserWithRolesByIdAsync).mockReset();
    vi.mocked(getUserByAzureADIdAsync).mockReset();
  });

  it("should redirect to users page for admin user", async () => {
    vi.mocked(getCurrentUserADIdAsync).mockResolvedValueOnce("id");
    vi.mocked(getAzureUserWithRolesByIdAsync).mockResolvedValueOnce({
      id: "1",
      displayName: "1",
      givenName: "1",
      surname: "1",
      mail: "1",
      userPrincipalName: "1",
      appRoleAssignments: [
        {
          id: "",
          principalDisplayName: "",
          principalId: "",
          resourceDisplayName: "",
          appRoleId: ROLES.Admin,
          roleName: "",
        },
      ],
      email: "",
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/admin/home"));
  });

  it("should redirect to volunteer-agreement for mentor user", async () => {
    vi.mocked(getCurrentUserADIdAsync).mockResolvedValueOnce("id");
    vi.mocked(getAzureUserWithRolesByIdAsync).mockResolvedValueOnce({
      id: "1",
      displayName: "1",
      givenName: "1",
      surname: "1",
      mail: "1",
      userPrincipalName: "1",
      appRoleAssignments: [
        {
          id: "",
          principalDisplayName: "",
          principalId: "",
          resourceDisplayName: "",
          appRoleId: ROLES.Mentor,
          roleName: "",
        },
      ],
      email: "",
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
    vi.mocked(getCurrentUserADIdAsync).mockResolvedValueOnce("id");
    vi.mocked(getAzureUserWithRolesByIdAsync).mockResolvedValueOnce({
      id: "1",
      displayName: "1",
      givenName: "1",
      surname: "1",
      mail: "1",
      userPrincipalName: "1",
      appRoleAssignments: [
        {
          id: "",
          principalDisplayName: "",
          principalId: "",
          resourceDisplayName: "",
          appRoleId: ROLES.Mentor,
          roleName: "",
        },
      ],
      email: "",
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
