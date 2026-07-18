/* eslint-disable @eslint-react/purity */
import type { $Enums } from "~/prisma/client";

import { useEffect } from "react";
import { Form, Link, useFetcher } from "react-router";
import { EditPencil, FloppyDiskArrowIn, Send, Xmark } from "iconoir-react";

import { DateInput, Input, Message, Radio, Select } from "~/components";

import { ProfileInput } from "./ProfileInput";

interface Props {
  isFormEditable: boolean;
  user: {
    id: number;
    profilePicturePath: string | null;
    fullName: string;
    email: string;
    azureADId: string | null;
    chapterId: number;
    note: string | null;
    firstName: string;
    lastName: string;
    preferredName: string | null;
    gender: $Enums.Gender | null;
    mobile: string;
    addressStreet: string;
    addressSuburb: string;
    addressState: string;
    addressPostcode: string;
    dateOfBirth: Date | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
    emergencyContactAddress: string | null;
    emergencyContactRelationship: string | null;
    additionalEmail: string | null;
    hasApprovedToPublishPhotos: boolean | null;
    frequency: string;
  };
  chapters: {
    id: number;
    name: string;
  }[];
  successMessage: string | undefined;
}

export function UserForm({
  isFormEditable,
  user,
  chapters,
  successMessage,
}: Props) {
  const { submit, data, state } = useFetcher<{ message: string }>();

  useEffect(() => {
    if (data) {
      onCloseModalClick();
      alert(data.message);
    }
  }, [data]);

  const isLoading = state !== "idle";

  const onUpdateEmailClick = () =>
    (
      document.getElementById("update-mentor-email-dialog") as HTMLDialogElement
    ).showModal();

  const onCloseModalClick = () =>
    (
      document.getElementById("update-mentor-email-dialog") as HTMLDialogElement
    ).close();

  const handleEmailUpdate = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const newEmail = formData.get("email")!.toString();
    if (newEmail.trim() === user.email) {
      alert("New email and current are one are the same. No action taken.");
      return;
    }

    void submit(
      { email: newEmail },
      {
        method: "POST",
        action: `/api/v1/mentors/${user.id}/update-email`,
        encType: "application/json",
      },
    );

    onCloseModalClick();
  };

  return (
    <>
      <Form
        method="post"
        encType="multipart/form-data"
        className="border-primary relative mb-8 flex-1 overflow-y-auto md:mr-8 md:mb-0 md:border-r md:pr-4"
      >
        <fieldset
          disabled={!isFormEditable || isLoading}
          className="fieldset relative"
        >
          {isLoading && (
            <div className="absolute z-10 flex h-full w-full justify-center bg-slate-300/50">
              <span className="loading loading-spinner loading-xl text-primary"></span>
            </div>
          )}

          <ProfileInput
            defaultValue={user.profilePicturePath}
            fullName={user.fullName}
          />

          <label htmlFor="email" className="fieldset-label">
            Email
          </label>
          <div className="indicator w-full">
            <span className="indicator-item badge text-error text-xl">*</span>
            <div className="join w-full">
              <input
                type="email"
                name="email"
                placeholder="Email"
                defaultValue={user.email}
                required
                disabled={user.azureADId !== null}
                className="input w-full"
              />
              {user.azureADId !== null && (
                <button
                  type="button"
                  className="btn btn-neutral join-item"
                  onClick={onUpdateEmailClick}
                >
                  <EditPencil />
                  Update
                </button>
              )}
            </div>
          </div>

          <Select
            name="chapterId"
            label="Chapter"
            defaultValue={user.chapterId.toString()}
            required
            options={[{ value: "", label: "Select a chapter" }].concat(
              chapters.map(({ id, name }) => ({
                label: name,
                value: id.toString(),
              })),
            )}
          />
          <Select
            name="frequency"
            label="Preferred frequency"
            defaultValue={user.frequency}
            options={[
              { value: "", label: "Not specified" },
              { value: "FORTNIGHTLY", label: "Fortnightly" },
              { value: "WEEKLY", label: "Weekly" },
            ]}
          />
          <Input
            defaultValue={user.note ?? ""}
            label="Title/Note"
            name="note"
          />
          <Input
            defaultValue={user.firstName}
            label="First name"
            name="firstName"
            required
          />
          <Input
            defaultValue={user.preferredName ?? ""}
            label="Preferred name"
            name="preferredName"
          />
          <Input
            defaultValue={user.lastName}
            label="Last name"
            name="lastName"
            required
          />
          <Select
            label="Gender"
            name="gender"
            defaultValue={user.gender ?? ""}
            options={[
              { value: "", label: "Select a gender" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
              { value: "PREFER_NOT_TO_SAY", label: "Rather not answer" },
            ]}
          />
          <Input
            defaultValue={user.mobile}
            label="Mobile"
            name="mobile"
            required
          />
          <Input
            defaultValue={user.addressStreet}
            label="Address street"
            name="addressStreet"
            required
          />
          <Input
            defaultValue={user.addressSuburb}
            label="Address suburb"
            name="addressSuburb"
            required
          />
          <Input
            defaultValue={user.addressState}
            label="Address state"
            name="addressState"
            required
          />
          <Input
            defaultValue={user.addressPostcode}
            label="Address postcode"
            name="addressPostcode"
            required
          />
          <DateInput
            defaultValue={user.dateOfBirth ?? ""}
            label="Date of birth"
            name="dateOfBirth"
          />
          <Input
            defaultValue={user.emergencyContactName ?? ""}
            label="Emergency contact name"
            name="emergencyContactName"
          />
          <Input
            defaultValue={user.emergencyContactNumber ?? ""}
            label="Emergency contact number"
            name="emergencyContactNumber"
          />
          <Input
            defaultValue={user.emergencyContactAddress ?? ""}
            label="Emergency contact address"
            name="emergencyContactAddress"
          />
          <Input
            defaultValue={user.emergencyContactRelationship ?? ""}
            label="Emergency contact relationship"
            name="emergencyContactRelationship"
          />
          <Input
            type="email"
            defaultValue={user.additionalEmail ?? ""}
            label="Additional email"
            name="additionalEmail"
          />
          <Radio
            label="Permission to publish photos?"
            name="hasApprovedToPublishPhotos"
            defaultValue={user.hasApprovedToPublishPhotos?.toString()}
            options={[
              {
                label: "Yes",
                value: "true",
              },
              {
                label: "No",
                value: "false",
              },
            ]}
          />
          <div
            data-testid="container"
            className="sticky bottom-0 z-10 flex justify-between"
          >
            <Message key={Date.now()} successMessage={successMessage} />

            {!isFormEditable ? (
              <Link
                className="btn btn-primary w-48"
                type="button"
                to={`/admin/mentors/${user.id}?isFormEditable=true`}
              >
                <EditPencil />
                Edit
              </Link>
            ) : (
              <button className="btn btn-primary w-48" type="submit">
                <FloppyDiskArrowIn />
                Save
              </button>
            )}
          </div>
        </fieldset>
      </Form>

      <dialog id="update-mentor-email-dialog" className="modal">
        <Form onSubmit={handleEmailUpdate} className="modal-box">
          <h3 className="text-lg font-bold">Update email</h3>
          <p className="py-4">
            Changing the email will require the mentor to use the new version to
            login.
          </p>

          <Input
            type="email"
            defaultValue={user.email ?? ""}
            label="Email"
            name="email"
          />

          <div className="modal-action gap-8">
            <button className="btn" type="button" onClick={onCloseModalClick}>
              <Xmark />
              Close
            </button>

            <button className="btn btn-primary" type="submit">
              <Send />
              Submit
            </button>
          </div>
        </Form>
      </dialog>
    </>
  );
}
