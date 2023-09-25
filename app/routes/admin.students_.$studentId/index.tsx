import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";

import dayjs from "dayjs";
import { $Enums } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { BackHeader, Title } from "~/components";

import { getStudentByIdAsync, updateStudentByIdAsync } from "./services.server";
import { StudentForm } from "./components/StudentForm";
import { GuardianList } from "./components/GuardianList";
import { TeacherList } from "./components/TeacherList";

export async function loader({ params }: LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));
  if (student === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    student,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const gender = formData.get("gender")?.toString();
  const address = formData.get("address")?.toString();
  const allergies = formData.get("allergies")?.toString();
  const hasApprovedToPublishPhotos = formData
    .get("hasApprovedToPublishPhotos")
    ?.toString();
  const bestPersonToContact = formData.get("bestPersonToContact")?.toString();
  const bestContactMethod = formData.get("bestContactMethod")?.toString();
  const schoolName = formData.get("schoolName")?.toString();
  const yearLevel = formData.get("yearLevel")?.toString();
  const emergencyContactFullName = formData
    .get("emergencyContactFullName")
    ?.toString();
  const emergencyContactRelationship = formData
    .get("emergencyContactRelationship")
    ?.toString();
  const emergencyContactPhone = formData
    .get("emergencyContactPhone")
    ?.toString();
  const emergencyContactEmail = formData
    .get("emergencyContactEmail")
    ?.toString();
  const emergencyContactAddress = formData
    .get("emergencyContactAddress")
    ?.toString();
  const startDate = formData.get("startDate")?.toString();

  const dataCreate: Prisma.XOR<
    Prisma.StudentUpdateInput,
    Prisma.StudentUncheckedUpdateInput
  > = {
    firstName,
    lastName,
    dateOfBirth: dayjs(dateOfBirth).toDate(),
    gender: gender === "MALE" ? $Enums.Gender.MALE : $Enums.Gender.FEMALE,
    address,
    allergies: allergies === "true" ? true : false,
    hasApprovedToPublishPhotos:
      hasApprovedToPublishPhotos === "true" ? true : false,
    bestPersonToContact,
    bestContactMethod,
    schoolName,
    yearLevel,
    emergencyContactFullName,
    emergencyContactRelationship,
    emergencyContactPhone,
    emergencyContactEmail,
    emergencyContactAddress,
    startDate: dayjs(startDate).toDate(),
  };

  await updateStudentByIdAsync(Number(params.studentId), dataCreate);

  return null;
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <div className="flex h-full flex-col">
      <div className="h-1/6">
        <BackHeader />

        <Title>Edit student info</Title>
      </div>

      <div className="h-5/6 md:flex">
        <StudentForm transition={transition} loaderData={loaderData} />

        <hr className="my-8 md:hidden" />

        <div className="flex-1">
          <GuardianList loaderData={loaderData} />

          <hr className="my-8" />

          <TeacherList loaderData={loaderData} />
        </div>
      </div>
    </div>
  );
}
