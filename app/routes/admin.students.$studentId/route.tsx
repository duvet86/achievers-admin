import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";
import type { Route } from "./+types/route";

import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { NavArrowRight } from "iconoir-react";
import { parseFormData } from "@mjackson/form-data-parser";

import { $Enums } from "~/prisma/client";
import {
  deleteStudentProfilePicture,
  getStudentProfilePictureUrl,
  memoryHandlerDispose,
  saveStudentProfilePicture,
  uploadHandler,
} from "~/services/.server";
import { areEqualIgnoreCase, calculateYearLevel } from "~/services";
import { StateLink } from "~/components";

import {
  createNewStudentAsync,
  deleteGuardianByIdAsync,
  deleteTeacherByIdAsync,
  getChaptersAsync,
  getStudentByIdAsync,
  updateStudentByIdAsync,
} from "./services.server";
import { StudentForm, GuardianList, TeacherList, Header } from "./components";

export async function loader({ params }: Route.LoaderArgs) {
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
  const chapters = await getChaptersAsync();

  const profilePicturePath = student?.profilePicturePath
    ? getStudentProfilePictureUrl(student.profilePicturePath)
    : null;

  return {
    title: "Edit student info",
    student: {
      ...student,
      profilePicturePath,
    },
    yearLevelCalculated:
      student.yearLevel === null
        ? calculateYearLevel(student.dateOfBirth)
        : null,
    isNewStudent,
    chapters,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  const formData = await parseFormData(request, uploadHandler);

  const profilePicure = formData.get("profilePicure");
  if (profilePicure === "DELETE") {
    await deleteStudentProfilePicture(Number(params.studentId));

    return {
      successMessage: "Profile picture deleted successfully!",
      errorMessage: null,
    };
  } else if (profilePicure instanceof File) {
    await saveStudentProfilePicture(Number(params.studentId), profilePicure);

    memoryHandlerDispose("profilePicure");

    return {
      successMessage: "Profile picture updated successfully!",
      errorMessage: null,
    };
  }

  if (request.method === "DELETE") {
    const guardianId = formData.get("guardianId")?.toString();
    const teacherId = formData.get("teacherId")?.toString();

    if (guardianId) {
      await deleteGuardianByIdAsync(Number(guardianId));
    } else if (teacherId) {
      await deleteTeacherByIdAsync(Number(teacherId));
    }

    return {
      successMessage: "Deleted successfully",
    };
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

  if (areEqualIgnoreCase(params.studentId, "new")) {
    if (firstName === undefined || lastName === undefined) {
      throw new Error();
    }

    const dataCreate: XOR<
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

    await createNewStudentAsync(dataCreate);
  } else {
    const dataCreate: XOR<
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

    await updateStudentByIdAsync(Number(params.studentId), dataCreate);
  }

  return {
    successMessage: "Student updated successfully",
  };
}

export default function Index({
  loaderData: { chapters, isNewStudent, student, title, yearLevelCalculated },
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="flex h-full flex-col">
      <Header
        title={title}
        endDate={student?.endDate}
        successMessage={actionData?.successMessage}
      />

      <hr className="my-4" />

      <div className="content-area md:flex">
        <StudentForm
          student={student}
          chapters={chapters}
          yearLevelCalculated={yearLevelCalculated}
        />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto pb-4 lg:pb-0">
          {student && (
            <StateLink
              className="btn btn-block mb-4 sm:w-52"
              to={`/admin/students/${student.id}/school-reports`}
            >
              School reports <NavArrowRight />
            </StateLink>
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
