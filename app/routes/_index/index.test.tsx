import { redirect } from "@remix-run/node";

import {
  getAzureUserWithRolesByIdAsync,
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services";

import { loader } from "./index";

vi.mock("~/services", async () => {
  process.env.SESSION_SECRET = "Test";
  process.env.CLIENT_ID = "Test";
  process.env.CLIENT_SECRET = "Test";
  process.env.TENANT_ID = "Test";
  process.env.REDIRECT_URI = "Test";

  const actual: any = await vi.importActual("~/services");

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
          appRoleId: "e567add0-fec3-4c87-941a-05dd2e18cdfd", // admin
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

    expect(response).toEqual(redirect("/users"));
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
          appRoleId: "a2ed7b54-4379-465d-873d-2e182e0bd8ef", // mentor
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
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/volunteer-agreement"));
  });

  it("should redirect to roster for mentor user", async () => {
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
          appRoleId: "a2ed7b54-4379-465d-873d-2e182e0bd8ef", // mentor
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
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/roster"));
  });
});
