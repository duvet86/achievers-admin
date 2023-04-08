import { redirect } from "@remix-run/node";

import {
  authenticator,
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  getUserByAzureADIdAsync,
} from "~/services";

import { loader } from "./index";

vi.mock("~/services", async () => {
  const actual: any = await vi.importActual("~/services");

  return {
    ...actual,
    authenticator: {
      isAuthenticated: vi.fn(),
    },
    getSessionUserAsync: vi.fn(),
    getAzureUserWithRolesByIdAsync: vi.fn(),
    getUserByAzureADIdAsync: vi.fn(),
  };
});

describe("Loader", () => {
  beforeEach(() => {
    vi.mocked(authenticator.isAuthenticated).mockReset();
    vi.mocked(getSessionUserAsync).mockReset();
    vi.mocked(getAzureUserWithRolesByIdAsync).mockReset();
    vi.mocked(getUserByAzureADIdAsync).mockReset();
  });

  it("should redirect to auth for unauthenticated user", async () => {
    vi.mocked(authenticator.isAuthenticated).mockResolvedValueOnce(null);

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/auth/microsoft"));
  });

  it("should redirect to users for admin user", async () => {
    vi.mocked(authenticator.isAuthenticated).mockResolvedValueOnce({
      azureADId: "",
      accessToken: "",
      refreshToken: "",
      expiresIn: 1,
    } as any);
    vi.mocked(getSessionUserAsync).mockResolvedValueOnce({
      azureADId: "",
      accessToken: "",
      refreshToken: "",
      expiresIn: 1,
    });
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
    vi.mocked(authenticator.isAuthenticated).mockResolvedValueOnce({
      azureADId: "",
      accessToken: "",
      refreshToken: "",
      expiresIn: 1,
    } as any);
    vi.mocked(getSessionUserAsync).mockResolvedValueOnce({
      azureADId: "",
      accessToken: "",
      refreshToken: "",
      expiresIn: 1,
    });
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
      volunteerAgreement: null,
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/volunteer-agreement"));
  });

  it("should redirect to roster for mentor user", async () => {
    vi.mocked(authenticator.isAuthenticated).mockResolvedValueOnce({
      azureADId: "",
      accessToken: "",
      refreshToken: "",
      expiresIn: 1,
    } as any);
    vi.mocked(getSessionUserAsync).mockResolvedValueOnce({
      azureADId: "",
      accessToken: "",
      refreshToken: "",
      expiresIn: 1,
    });
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
      volunteerAgreement: {
        createdAt: new Date(),
        hasAcceptedNoLegalResp: true,
        hasApprovedSafetyDirections: true,
        id: 1,
        isInformedOfConstitution: true,
        signedOn: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
    });

    const response = await loader({
      request: new Request("http://app.com/test"),
      params: {},
      context: {},
    });

    expect(response).toEqual(redirect("/roster"));
  });
});
