import type { Route } from "./+types/route";
import type { ResourceCommand } from "./services.server";

import { redirect, useFetcher } from "react-router";
import { useRef, useState } from "react";
import { BinHalf, FloppyDisk, LineSpace, Plus } from "iconoir-react";

import { isStringNullOrEmpty } from "~/services";
import { Message, Textarea, Title } from "~/components";

import {
  getMentorResourceByIdAsync,
  upsertMentorResourcesAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  if (params.resourceId === "new") {
    return {
      mentorResource: {
        id: 0,
        label: "",
        mentorResource: [
          {
            id: 0,
            label: "",
            url: "",
            description: "",
            order: 1,
          },
        ],
      },
    };
  }

  const mentorResource = await getMentorResourceByIdAsync(
    Number(params.resourceId),
  );

  return { mentorResource };
}

export async function action({ request, params }: Route.ActionArgs) {
  const jsonData = (await request.json()) as ResourceCommand;

  try {
    const { id } = await upsertMentorResourcesAsync(
      Number(params.resourceId),
      jsonData,
    );
    if (params.resourceId === "new") {
      return redirect(`/admin/config/mentor-resources/${id}`);
    }
  } catch {
    return {
      errorMessage: `Category label "${jsonData.label}" already exists. Please choose a different label.`,
    };
  }

  return { successMessage: "Success" };
}

export default function Index({
  loaderData: { mentorResource },
}: Route.ComponentProps) {
  const { Form, submit, state, data } = useFetcher<{
    successMessage: string;
    errorMessage: string;
  }>();
  const [resource, setResource] = useState(mentorResource);
  const draggingRowIndexRef = useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    draggingRowIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();

    if (draggingRowIndexRef.current === index) {
      return;
    }

    const newList = [...resource.mentorResource];
    const targetItem = newList.splice(draggingRowIndexRef.current!, 1)[0];
    newList.splice(index, 0, targetItem);

    draggingRowIndexRef.current = index;
    setResource({ ...resource, mentorResource: newList });
  };

  const onDragEnd = () => {
    draggingRowIndexRef.current = null;
  };

  const onFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const mentorResourceJsonData = resource.mentorResource.map((_, index) => {
      const description = formData
        .get(`resource[${index}]['description']`)
        ?.toString();

      return {
        id: Number(formData.get(`resource[${index}]['id']`)!.toString()),
        label: formData.get(`resource[${index}]['label']`)!.toString(),
        url: formData.get(`resource[${index}]['url']`)!.toString(),
        description: isStringNullOrEmpty(description) ? null : description,
        order: index + 1,
      };
    });

    void submit(
      {
        id: resource.id,
        label: formData.get("label")!.toString(),
        mentorResource: mentorResourceJsonData,
      },
      { method: "POST", encType: "application/json" },
    );
  };

  const onDeleteItemBtnClick = (index: number) => () => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setResource((prev) => ({
      ...prev,
      mentorResource: prev.mentorResource.filter((_, i) => i !== index),
    }));
  };

  const onAddNewBtnClick = () => {
    setResource((prev) => ({
      ...prev,
      mentorResource: [
        ...prev.mentorResource,
        {
          id: 0,
          label: "",
          url: "",
          description: "",
          order: prev.mentorResource.length + 1,
        },
      ],
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Configure mentor resource</Title>

        <Message
          key={Date.now()}
          successMessage={data?.successMessage}
          errorMessage={data?.errorMessage}
        />
      </div>

      <Form onSubmit={onFormSubmit}>
        <fieldset disabled={state !== "idle"}>
          <div className="mt-4">
            <div className="border-primary flex gap-4 border-b py-4 font-bold">
              <div className="indicator w-full">
                <span className="indicator-item badge text-error">*</span>
                <label className="input w-full">
                  <span className="label">Category label</span>
                  <input
                    type="text"
                    placeholder="Category"
                    defaultValue={resource.label}
                    name="label"
                    required
                  />
                </label>
              </div>
            </div>

            <ul>
              {resource.mentorResource.map(
                ({ id, label, url, description }, index) => (
                  <li
                    key={id}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className="hover:bg-base-400 bg-base-200 my-4 flex cursor-move items-center gap-2 p-2"
                  >
                    <div className="flex w-12 items-center gap-2">
                      <LineSpace /> {index + 1}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="indicator flex-1">
                          <span className="indicator-item badge text-error">
                            *
                          </span>
                          <input
                            type="text"
                            placeholder="Label"
                            className="input w-full"
                            defaultValue={label}
                            name={`resource[${index}]['label']`}
                            required
                          />
                        </div>
                        <div className="indicator flex-1">
                          <span className="indicator-item badge text-error">
                            *
                          </span>
                          <input
                            type="url"
                            placeholder="Link"
                            className="input w-full"
                            defaultValue={url}
                            name={`resource[${index}]['url']`}
                            required
                          />
                        </div>
                        <input type="hidden" name="resourceId" value={id} />
                      </div>

                      <Textarea
                        placeholder="Description"
                        maxLength={191}
                        name={`resource[${index}]['description']`}
                        defaultValue={description ?? ""}
                      />
                    </div>

                    <input
                      type="hidden"
                      name={`resource[${index}]['id']`}
                      value={id}
                    />

                    <button
                      className="btn btn-error w-36"
                      onClick={onDeleteItemBtnClick(index)}
                      type="button"
                    >
                      <BinHalf /> Delete
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="mt-2 flex justify-between">
            <button
              className="btn btn-neutral"
              type="button"
              onClick={onAddNewBtnClick}
            >
              <Plus /> Add new link
            </button>

            <button className="btn btn-primary w-36" type="submit">
              <FloppyDisk /> Save
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
