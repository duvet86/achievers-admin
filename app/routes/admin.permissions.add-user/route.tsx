import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import {
  useLoaderData,
  Form,
  useFetcher,
  useSearchParams,
  redirect,
  useActionData,
} from "@remix-run/react";
import { json } from "@remix-run/node";

import { Input, Select, SubmitFormButton, Title } from "~/components";
import {
  ROLES,
  SUBJECTS_CHAPTERCOORDINATOR,
  SUBJECTS_ADMIN,
} from "~/services/.server";

import { getChaptersAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const selectedRole = url.searchParams.get("role") ?? "Admin";

  if (selectedRole === "Admin") {
    return json({
      selectedRole,
      roles: ROLES.map((role) => ({
        label: role,
        value: role,
      })),
      permissions: SUBJECTS_ADMIN.map((subject) => ({
        label: subject,
        value: subject,
      })),
      chapters: null,
    });
  }

  const chapters = await getChaptersAsync();

  return json({
    selectedRole,
    roles: ROLES.map((role) => ({
      label: role,
      value: role,
    })),
    permissions: SUBJECTS_CHAPTERCOORDINATOR.map((subject) => ({
      label: subject,
      value: subject,
    })),
    chapters: chapters.map(({ id, name }) => ({
      label: name,
      value: id.toString(),
    })),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // const displayName = formData.get("displayName");
  // const email = formData.get("email");
  const role = formData.get("role");

  const permissions = formData.getAll("permissions");
  const chapter = formData.getAll("chapter");

  if (permissions.length === 0) {
    return json({
      errorMessage: "At least one permission has to be selected.",
    });
  }

  if (role === "ChapterCoordinator" && chapter.length === 0) {
    return json({
      errorMessage: "At least one chapter has to be selected.",
    });
  }

  return redirect("/admin/permissions");
}

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const { data, state, load } = useFetcher<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [searchParams] = useSearchParams();

  const { selectedRole, roles, permissions, chapters } = data ?? initialData;

  const isLoading = state === "loading";

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("role", event.target.value);
    load(`?${searchParams.toString()}`);
  };

  return (
    <>
      <Title to="/admin/permissions">Add user</Title>

      <hr className="my-4" />

      <Form method="post" className="flex flex-col gap-4">
        <fieldset disabled={isLoading}>
          <Input
            label="Full name"
            name="displayName"
            defaultValue=""
            placeholder="Full name"
            required
          />

          <Input
            label="Email"
            name="email"
            defaultValue=""
            placeholder="Email"
            type="email"
            required
          />

          <Select
            label="Roles"
            name="role"
            defaultValue=""
            options={roles}
            onChange={handleRoleChange}
            required
          />

          <p className="label my-2">
            <span className="label-text">Permissions</span>
          </p>

          <div key={selectedRole} className="flex flex-wrap gap-4">
            {permissions.map(({ label, value }) => (
              <div key={value} className="form-control rounded bg-gray-100 p-2">
                <label className="label cursor-pointer gap-4">
                  <span className="label-text">{label}</span>
                  <input
                    type="checkbox"
                    name="permissions"
                    value={value}
                    className="checkbox"
                  />
                </label>
              </div>
            ))}
          </div>

          {chapters && (
            <>
              <p className="label my-2">
                <span className="label-text">Chapters</span>
              </p>

              <div className="flex flex-wrap gap-4">
                {chapters.map(({ label, value }) => (
                  <div
                    key={value}
                    className="form-control rounded bg-gray-100 p-2"
                  >
                    <label className="label cursor-pointer gap-4">
                      <span className="label-text">{label}</span>
                      <input
                        type="checkbox"
                        name="chapter"
                        className="checkbox"
                        value={value}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          <SubmitFormButton
            errorMessage={actionData?.errorMessage}
            className="mt-4 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
