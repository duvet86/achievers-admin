import type { Student, Chapter, Prisma } from "@prisma/client";
import { prisma } from "~/db.server";
import { getCurrentUserADIdAsync } from "~/services";

export async function getStudentAsync(id: Student["id"]) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
      endDate: null,
    },
    select: {
      firstName: true,
      lastName: true,
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function getMentorsInChapterAsync(chapterId: Chapter["id"]) {
  return await prisma.user.findMany({
    where: {
      chapterId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

export async function asssignMentorAsync(
  request: Request,
  {
    attendedOn,
    studentId,
    chapterId,
    userId,
  }: Prisma.MentorToStudentSessionUserIdStudentIdChapterIdAttendedOnCompoundUniqueInput,
  data: Prisma.XOR<
    Prisma.MentorToStudentSessionCreateInput,
    Prisma.MentorToStudentSessionUncheckedCreateInput
  >,
) {
  const currentUserAzureId = await getCurrentUserADIdAsync(request);

  return await prisma.$transaction(async (tx) => {
    await tx.mentorToStudentAssignement.create({
      data: {
        studentId: studentId,
        userId: userId,
        assignedBy: currentUserAzureId,
      },
    });

    await tx.mentorToStudentSession.deleteMany({
      where: {
        attendedOn,
        studentId,
        chapterId,
      },
    });

    return await tx.mentorToStudentSession.create({
      data,
    });
  });
}
