import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client/index.js";

import dayjs from "dayjs";
import { $Enums } from "@prisma/client/index.js";
import { Link, redirect, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { NavArrowRight } from "iconoir-react";

import { areEqualIgnoreCase, calculateYearLevel } from "~/services";

import {
  createNewStudentAsync,
  deleteGuardianByIdAsync,
  deleteTeacherByIdAsync,
  getChaptersAsync,
  getStudentByIdAsync,
  updateStudentByIdAsync,
} from "./services.server";
import { StudentForm, GuardianList, TeacherList, Header } from "./components";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const isNewStudent = areEqualIgnoreCase(params.studentId, "new");

  if (isNewStudent) {
    const chapters = await getChaptersAsync();

    return {
      title: "Add new student",
      student: null,
      yearLevelCalculated: null,
      isNewStudent,
      chapters,
    };
  }

  const student = await getStudentByIdAsync(Number(params.studentId));
  if (student === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const chapters = await getChaptersAsync();

  return {
    title: "Edit student info",
    student,
    yearLevelCalculated:
      student.yearLevel === null
        ? calculateYearLevel(student.dateOfBirth)
        : null,
    isNewStudent,
    chapters,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();

  if (request.method === "DELETE") {
    const guardianId = formData.get("guardianId")?.toString();
    const teacherId = formData.get("teacherId")?.toString();

    if (guardianId) {
      await deleteGuardianByIdAsync(Number(guardianId));
    } else if (teacherId) {
      await deleteTeacherByIdAsync(Number(teacherId));
    }

    return null;
  }

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const yearLevel = formData.get("yearLevel")?.toString();
  const gender = formData.get("gender")?.toString();
  const address = formData.get("address")?.toString();
  const allergies = formData.get("allergies")?.toString();
  const hasApprovedToPublishPhotos = formData
    .get("hasApprovedToPublishPhotos")
    ?.toString();
  const bestPersonToContact = formData.get("bestPersonToContact")?.toString();
  const bestContactMethod = formData.get("bestContactMethod")?.toString();
  const schoolName = formData.get("schoolName")?.toString();
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
  const chapterId = formData.get("chapterId")?.toString();

  let studentId;

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
      yearLevel: yearLevel ? Number(yearLevel) : null,
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
      emergencyContactFullName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      emergencyContactAddress,
      startDate: startDate ? dayjs(startDate).toDate() : null,
      chapterId: Number(chapterId),
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
      yearLevel: yearLevel ? Number(yearLevel) : null,
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
      emergencyContactFullName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      emergencyContactAddress,
      startDate: startDate ? dayjs(startDate).toDate() : null,
      chapterId: Number(chapterId),
    };

    studentId = await updateStudentByIdAsync(
      Number(params.studentId),
      dataCreate,
    );
  }

  return redirect(`/admin/students/${studentId}`);
}

export default function Index() {
  const { chapters, isNewStudent, student, title, yearLevelCalculated } =
    useLoaderData<typeof loader>();
  const transition = useNavigation();

  const isLoading = transition.state !== "idle";

  return (
    <div className="flex h-full flex-col">
      <Header title={title} endDate={student?.endDate} />

      <hr className="my-4" />

      <div className="content-area md:flex">
        <StudentForm
          isLoading={isLoading}
          student={student}
          chapters={chapters}
          yearLevelCalculated={yearLevelCalculated}
        />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto pb-4 lg:pb-0">
          {student && (
            <Link
              className="btn btn-block mb-4 sm:w-52"
              to={`/admin/students/${student.id}/school-reports`}
            >
              School reports <NavArrowRight />
            </Link>
          )}

          <GuardianList
            isNewStudent={isNewStudent}
            guardian={student?.guardian ?? []}
          />

          <TeacherList
            isNewStudent={isNewStudent}
            studentTeacher={student?.studentTeacher ?? []}
          />
        </div>
      </div>
    </div>
  );
}
