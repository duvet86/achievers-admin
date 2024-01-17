import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";

import dayjs from "dayjs";
import { $Enums } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { areEqualIgnoreCase } from "~/services";
import { BackHeader, Title } from "~/components";

import {
  createNewStudentAsync,
  getStudentByIdAsync,
  updateStudentByIdAsync,
} from "./services.server";
import { StudentForm } from "./components/StudentForm";
import { GuardianList } from "./components/GuardianList";
import { TeacherList } from "./components/TeacherList";
import { AssignedChapterList } from "./components/AssignedChapterList";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const isNewStudent = areEqualIgnoreCase(params.studentId, "new");

  if (isNewStudent) {
    return json({
      title: "Add new student",
      student: null,
      isNewStudent,
    });
  }

  const student = await getStudentByIdAsync(Number(params.studentId));
  if (student === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    title: "Edit student info",
    student,
    isNewStudent,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
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

  let studentId: number;

  if (areEqualIgnoreCase(params.studentId, "new")) {
    if (firstName === undefined || lastName === undefined) {
      throw new Error();
    }

    const dataCreate: Prisma.XOR<
      Prisma.StudentCreateInput,
      Prisma.StudentUncheckedCreateInput
    > = {
      firstName,
      lastName,
      gender: gender === "MALE" ? $Enums.Gender.MALE : $Enums.Gender.FEMALE,
      dateOfBirth: dateOfBirth ? dayjs(dateOfBirth).toDate() : null,
      address,
      allergies: allergies ? (allergies === "true" ? true : false) : undefined,
      hasApprovedToPublishPhotos: hasApprovedToPublishPhotos
        ? hasApprovedToPublishPhotos === "true"
          ? true
          : false
        : undefined,
      bestPersonToContact,
      bestContactMethod,
      schoolName,
      yearLevel,
      emergencyContactFullName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      emergencyContactAddress,
      startDate: startDate ? dayjs(startDate).toDate() : null,
    };

    studentId = await createNewStudentAsync(dataCreate);
  } else {
    const dataCreate: Prisma.XOR<
      Prisma.StudentUpdateInput,
      Prisma.StudentUncheckedUpdateInput
    > = {
      firstName,
      lastName,
      gender: gender === "MALE" ? $Enums.Gender.MALE : $Enums.Gender.FEMALE,
      dateOfBirth: dateOfBirth ? dayjs(dateOfBirth).toDate() : null,
      address,
      allergies: allergies ? (allergies === "true" ? true : false) : undefined,
      hasApprovedToPublishPhotos: hasApprovedToPublishPhotos
        ? hasApprovedToPublishPhotos === "true"
          ? true
          : false
        : undefined,
      bestPersonToContact,
      bestContactMethod,
      schoolName,
      yearLevel,
      emergencyContactFullName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      emergencyContactAddress,
      startDate: startDate ? dayjs(startDate).toDate() : null,
    };

    studentId = await updateStudentByIdAsync(
      Number(params.studentId),
      dataCreate,
    );
  }

  return redirect(`/admin/students/${studentId}`);
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <div className="flex h-full flex-col">
      <div className="h-36">
        <BackHeader to="/admin/students" />

        <Title>{loaderData.title}</Title>
      </div>

      <div className="content-area md:flex">
        <StudentForm transition={transition} loaderData={loaderData} />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto pb-4 lg:pb-0">
          <AssignedChapterList loaderData={loaderData} />

          <GuardianList loaderData={loaderData} />

          <TeacherList loaderData={loaderData} />
        </div>
      </div>
    </div>
  );
}
