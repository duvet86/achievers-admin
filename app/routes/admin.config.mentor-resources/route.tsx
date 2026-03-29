import type { Route } from "./+types/route";

import { Form, useNavigation } from "react-router";
import { Bin, FloppyDiskArrowIn } from "iconoir-react";

import { Title } from "~/components";

import {
  addResource,
  getMentorResourcesAsync,
  updateCategory,
  updateResource,
} from "./services.server";

export async function loader() {
  const mentorResources = await getMentorResourcesAsync();

  return { mentorResources };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const action = formData.get("action")!.toString();

  switch (action) {
    case "updateCategory": {
      const categoryId = formData.get("categoryId")!.toString();
      const label = formData.get("label")!.toString();

      await updateCategory(Number(categoryId), label);

      break;
    }

    case "updateResource": {
      const resourceId = formData.get("resourceId")!.toString();
      const label = formData.get("label")!.toString();
      const url = formData.get("url")!.toString();

      await updateResource(Number(resourceId), label, url);

      break;
    }

    case "addResource": {
      const categoryId = formData.get("categoryId")!.toString();
      const order = formData.get("order")!.toString();
      const label = formData.get("label")!.toString();
      const url = formData.get("url")!.toString();

      await addResource(Number(categoryId), label, url, Number(order));

      break;
    }
  }

  return { submissionId: Date.now().toString() };
}

export default function Index({
  loaderData: { mentorResources },
  actionData,
}: Route.ComponentProps) {
  const { state } = useNavigation();

  return (
    <>
      <Title>Configure mentor resources</Title>

      <fieldset disabled={state !== "idle"}>
        {mentorResources.map(({ id: categoryId, label, mentorResource }) => (
          <div key={categoryId} className="mt-4">
            <Form
              method="POST"
              className="border-primary flex gap-4 border-b py-4 font-bold"
            >
              <div className="indicator w-full">
                <span className="indicator-item badge text-error">*</span>
                <label className="input w-full">
                  <span className="label">Category</span>
                  <input
                    type="text"
                    placeholder="Category"
                    defaultValue={label}
                    name="label"
                    required
                  />
                </label>
              </div>
              <input type="hidden" name="categoryId" value={categoryId} />
              <button
                className="btn btn-primary w-44"
                name="action"
                value="updateCategory"
                type="submit"
              >
                <FloppyDiskArrowIn /> Save category
              </button>
            </Form>

            <ul className="m-4">
              <li className="flex gap-4 p-2">
                <span className="input ml-2 flex-1 border-0 font-bold">
                  Label
                </span>
                <span className="input ml-2 flex-1 border-0 font-bold">
                  Link
                </span>
                <div className="w-80"></div>
              </li>
              {mentorResource.map(({ id: resourceId, order, label, url }) => (
                <li key={resourceId} className="p-2">
                  <Form method="POST" className="flex items-center gap-4">
                    <span className="w-8">{order})</span>
                    <div className="indicator flex-1">
                      <span className="indicator-item badge text-error">*</span>
                      <input
                        type="text"
                        placeholder="Label"
                        className="input w-full"
                        defaultValue={label}
                        name="label"
                        required
                      />
                    </div>
                    <div className="indicator flex-1">
                      <span className="indicator-item badge text-error">*</span>
                      <input
                        type="text"
                        placeholder="Link"
                        className="input w-full"
                        defaultValue={url}
                        name="url"
                        required
                      />
                    </div>
                    <input type="hidden" name="resourceId" value={resourceId} />
                    <div className="flex w-80 gap-2">
                      <button
                        className="btn btn-primary flex-1"
                        name="action"
                        value="updateResource"
                        type="submit"
                      >
                        <FloppyDiskArrowIn /> Save
                      </button>
                      <button
                        className="btn btn-error flex-1"
                        name="action"
                        value="deleteCategory"
                        type="submit"
                      >
                        <Bin /> Delete
                      </button>
                    </div>
                  </Form>
                </li>
              ))}
              <li className="p-2">
                <Form
                  method="POST"
                  className="flex items-center gap-4"
                  key={actionData?.submissionId}
                >
                  <span className="w-8">{mentorResource.length + 1})</span>
                  <div className="indicator flex-1">
                    <span className="indicator-item badge text-error">*</span>
                    <input
                      type="text"
                      placeholder="Label"
                      className="input w-full"
                      name="label"
                      required
                    />
                  </div>
                  <div className="indicator flex-1">
                    <span className="indicator-item badge text-error">*</span>
                    <input
                      type="text"
                      placeholder="Link"
                      className="input w-full"
                      name="url"
                      required
                    />
                  </div>
                  <input type="hidden" name="categoryId" value={categoryId} />
                  <input
                    type="hidden"
                    name="order"
                    value={mentorResource.length + 1}
                  />
                  <button
                    className="btn btn-primary w-80"
                    name="action"
                    value="addResource"
                    type="submit"
                  >
                    <FloppyDiskArrowIn /> Add new
                  </button>
                </Form>
              </li>
            </ul>
          </div>
        ))}
      </fieldset>
    </>
  );
}
