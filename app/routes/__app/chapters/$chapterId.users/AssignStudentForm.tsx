import type { MentoringStudent } from "@prisma/client";
import type {
  AppRoleAssignmentWithRoleName,
  AzureUser,
} from "~/models/azure.server";

import { useState } from "react";
import { Form } from "@remix-run/react";

import { XMarkIcon } from "@heroicons/react/24/solid";

import ButtonPrimary from "~/components/ButtonPrimary";

interface User extends AzureUser {
  mentoringStudents: {
    frequencyInDays: number;
    id: string;
    displayName: string;
    givenName: string | null;
    surname: string | null;
    mail: string | null;
    userPrincipalName: string;
    appRoleAssignments: AppRoleAssignmentWithRoleName[];
  }[];
}

interface Props {
  user: User;
  availableStudents: {
    frequencyInDays: number;
    id: string;
    displayName: string;
    givenName: string | null;
    surname: string | null;
    mail: string | null;
    userPrincipalName: string;
    appRoleAssignments: AppRoleAssignmentWithRoleName[];
  }[];
  removeStudent: (studentId: AzureUser["id"]) => () => void;
  assignStudent: (
    studentId: AzureUser["id"],
    frequency: MentoringStudent["frequencyInDays"]
  ) => void;
  isSubmitting: boolean;
}

export default function AssignStudentForm({
  user,
  availableStudents,
  removeStudent,
  assignStudent,
  isSubmitting,
}: Props) {
  const [studentId, setStudentId] = useState("");
  const [frequency, setFrequency] = useState("");

  return (
    <Form method="post" className="mt-4">
      <div className="rounded bg-gray-200 p-2">
        <label
          htmlFor="addChapter"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Assign a Student
        </label>
        <select
          className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={studentId}
          onChange={(event) => {
            setStudentId(event.target.value);
          }}
          disabled={isSubmitting}
        >
          <option value="">Select a Student</option>
          {availableStudents.map(({ id, displayName }) => (
            <option key={id} value={id}>
              {displayName}
            </option>
          ))}
        </select>
        <label
          htmlFor="frequency"
          className="mt-6 mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Frequency
        </label>
        <select
          className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={frequency}
          onChange={(event) => {
            setFrequency(event.target.value);
          }}
          disabled={isSubmitting}
        >
          <option value="">Select a Frequency</option>
          <option value="7">7</option>
          <option value="14">14</option>
        </select>

        <button
          disabled={studentId === "" || frequency === ""}
          className={
            studentId === "" || frequency === ""
              ? "mt-6 flex items-center rounded bg-blue-200 py-2 px-4 text-white "
              : "mt-6 flex items-center rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 "
          }
          onClick={(event) => {
            event.preventDefault();
            assignStudent(studentId, Number(frequency));

            setStudentId("");
            setFrequency("");
          }}
        >
          <span className="space-x-2">Add Student</span>
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Mentee
              </th>
              <th align="left" className="p-2">
                Frequency
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.mentoringStudents.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No Students assigned to this Mentor</i>
                </td>
              </tr>
            )}
            {user.mentoringStudents.map(
              ({ id, displayName, frequencyInDays }) => (
                <tr key={id}>
                  <td className="border p-2">
                    <span>{displayName}</span>
                    <input type="hidden" name="studentIds" value={id} />
                  </td>
                  <td className="border p-2">
                    <span>Every {frequencyInDays} days</span>
                  </td>
                  <td align="right" className="border p-2">
                    <button
                      onClick={removeStudent(id)}
                      className="align-center flex justify-center rounded bg-red-600 py-1 pl-2 pr-4 text-white"
                    >
                      <XMarkIcon className="mr-2 w-6" />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* <p className="text-red-900">{actionData?.error}</p> */}

      <ButtonPrimary className="mt-8" type="submit">
        Save
      </ButtonPrimary>
    </Form>
  );
}
