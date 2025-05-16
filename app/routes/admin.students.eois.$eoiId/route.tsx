import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";
import type { Route } from "./+types/route";

import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { ThumbsUp } from "iconoir-react";

import { $Enums } from "~/prisma/client";
import { Message, StateLink, Title } from "~/components";

import {
  getChaptersAsync,
  getStudentEOIByIdAsync,
  updateStudentEOIByIdAsync,
} from "./services.server";
import { StudentForm, GuardianList, TeacherList } from "./components";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.eoiId, "eoiId not found");

  const eoiStudent = await getStudentEOIByIdAsync(Number(params.eoiId));

  const chapters = await getChaptersAsync();

  return {
    eoiStudent,
    chapters,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.eoiId, "eoiId not found");

  const formData = await request.formData();

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const yearLevel = formData.get("yearLevel")!.toString();
  const gender = formData.get("gender")?.toString();
  const address = formData.get("address")!.toString();
  const hasApprovedToPublishPhotos = formData
    .get("hasApprovedToPublishPhotos")
    ?.toString();
  const chapterId = formData.get("chapterId")?.toString();

  const email = formData.get("email")?.toString();
  const dietaryRequirements = formData.get("dietaryRequirements")?.toString();
  const bestPersonToContact = formData.get("bestPersonToContact")?.toString();
  const preferredName = formData.get("preferredName")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const isEnglishMainLanguage = formData
    .get("isEnglishMainLanguage")
    ?.toString();
  const otherLanguagesSpoken = formData.get("otherLanguagesSpoken")?.toString();
  const bestPersonToContactForEmergency = formData
    .get("bestPersonToContactForEmergency")
    ?.toString();
  const favouriteSchoolSubject = formData
    .get("favouriteSchoolSubject")
    ?.toString();
  const leastFavouriteSchoolSubject = formData
    .get("leastFavouriteSchoolSubject")
    ?.toString();
  const supportReason = formData.get("supportReason")?.toString();
  const otherSupport = formData.get("otherSupport")?.toString();
  const alreadyInAchievers = formData.get("alreadyInAchievers")?.toString();
  const heardAboutUs = formData.get("heardAboutUs")?.toString();
  const weeklyCommitment = formData.get("weeklyCommitment")?.toString();

  const dataCreate: XOR<
    Prisma.EoiStudentProfileUpdateInput,
    Prisma.EoiStudentProfileUncheckedUpdateInput
  > = {
    firstName,
    lastName,
    gender: gender === "MALE" ? $Enums.Gender.MALE : $Enums.Gender.FEMALE,
    dateOfBirth: dateOfBirth ? dayjs(dateOfBirth).toDate() : undefined,
    hasApprovedToPublishPhotos: hasApprovedToPublishPhotos === "on",
    bestPersonToContact,
    chapterId: Number(chapterId),
    yearLevel,
    address,
    email,
    dietaryRequirements,
    preferredName,
    mobile,
    isEnglishMainLanguage: isEnglishMainLanguage === "on",
    otherLanguagesSpoken,
    bestPersonToContactForEmergency,
    favouriteSchoolSubject,
    leastFavouriteSchoolSubject,
    supportReason,
    otherSupport,
    alreadyInAchievers,
    heardAboutUs,
    weeklyCommitment: weeklyCommitment === "on",
  };

  await updateStudentEOIByIdAsync(Number(params.eoiId), dataCreate);

  return {
    successMessage: "Student EOI updated successfully",
  };
}

export default function Index({
  loaderData: { chapters, eoiStudent },
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:gap-10">
        <Title>Student Expression Of Interest</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />

        {eoiStudent.Student ? (
          <p className="bg-success mb-4 flex items-center gap-2 rounded-sm px-6 py-2">
            <ThumbsUp />
            This student is already part of the Achievers!
          </p>
        ) : (
          <StateLink
            to="promote"
            relative="path"
            className="btn btn-success gap-4"
          >
            <ThumbsUp />
            Promote student
          </StateLink>
        )}
      </div>

      <hr className="my-4" />

      <div className="content-area md:flex">
        <StudentForm eoiStudent={eoiStudent} chapters={chapters} />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto pb-4 lg:pb-0">
          <GuardianList studentGuardian={eoiStudent.studentGuardian} />

          <TeacherList studentTeacher={eoiStudent.studentTeacher} />
        </div>
      </div>
    </div>
  );
}
