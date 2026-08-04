import type { Route } from "./+types/route";
import type { CategoryOrderCommand } from "./services.server";

import { useRef, useState } from "react";
import { useFetcher } from "react-router";
import {
  EditPencil,
  FloppyDisk,
  InfoCircle,
  LineSpace,
  Plus,
} from "iconoir-react";

import { Message, StateLink, Title } from "~/components";

import {
  getMentorResourcesAsync,
  updateCategoryOrder,
} from "./services.server";

export async function loader() {
  const mentorResources = await getMentorResourcesAsync();

  return { mentorResources };
}

export async function action({ request }: Route.ActionArgs) {
  const jsonData = (await request.json()) as CategoryOrderCommand[];

  await updateCategoryOrder(jsonData);

  return { successMessage: "Success" };
}

export default function Index({
  loaderData: { mentorResources },
}: Route.ComponentProps) {
  const { Form, submit, state, data } = useFetcher<{
    successMessage: string;
  }>();
  const [list, setList] = useState(mentorResources);
  const draggingRowIndexRef = useRef<number | null>(null);

  const onDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    draggingRowIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    e.preventDefault();

    if (draggingRowIndexRef.current === index) {
      return;
    }

    const newList = [...list];
    const targetItem = newList.splice(draggingRowIndexRef.current!, 1)[0];
    newList.splice(index, 0, targetItem);

    draggingRowIndexRef.current = index;
    setList(newList);
  };

  const onDragEnd = () => {
    draggingRowIndexRef.current = null;
  };

  const onFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const orderJsonData = list.map((item, index) => ({
      id: Number(formData.get(`order[${index}]['id']`)!.toString()),
      order: Number(formData.get(`order[${index}]['order']`)!.toString()),
    }));

    void submit(orderJsonData, {
      method: "POST",
      encType: "application/json",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Configure mentor resources</Title>

        <Message key={Date.now()} successMessage={data?.successMessage} />
      </div>

      <p className="text-info mt-4 flex items-center gap-2">
        <InfoCircle /> Drag and drop the table rows to reorder mentor resources.
        Don't forget to click "Save order" after reordering.
      </p>

      <Form method="POST" onSubmit={onFormSubmit}>
        <div className="mt-4 overflow-auto bg-white">
          <table className="table-lg sm:table-md table">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Order
                </th>
                <th align="left" className="p-2">
                  Title
                </th>
                <th align="left" className="p-2">
                  Count Resources
                </th>
                <th align="right" className="hidden p-2 sm:table-cell">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td className="italic">No mentor resources available</td>
                </tr>
              )}
              {list.map(({ id, label, _count }, index) => (
                <tr
                  key={id}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className="hover:bg-base-200 cursor-move"
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <LineSpace /> {index + 1}
                    </div>
                    <input
                      type="hidden"
                      name={`order[${index}]['id']`}
                      value={id}
                    />
                    <input
                      type="hidden"
                      name={`order[${index}]['order']`}
                      value={index + 1}
                    />
                  </td>
                  <td className="p-2">{label}</td>
                  <td className="p-2">{_count.mentorResource}</td>
                  <td className="hidden p-2 sm:table-cell" align="right">
                    <StateLink
                      to={`/admin/config/mentor-resources/${id}`}
                      className="btn btn-neutral btn-xs btn-block"
                    >
                      <EditPencil className="h-4 w-4" />
                      Edit
                    </StateLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between">
          <StateLink
            to="/admin/config/mentor-resources/new"
            className="btn btn-primary w-36"
          >
            <Plus /> Add new
          </StateLink>
          <button className="btn btn-success w-36" disabled={state !== "idle"}>
            <FloppyDisk /> Save order
          </button>
        </div>
      </Form>
    </>
  );
}
