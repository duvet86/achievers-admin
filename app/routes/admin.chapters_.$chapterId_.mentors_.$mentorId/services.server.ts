import { prisma } from "~/db.server";
import { getCurrentUserADIdAsync } from "~/services/.server";

export async function getStudentsInChapterAsync(
  chapterId: number,
  mentorId: number,
) {
  return prisma.student.findMany({
    where: {
      chapterId,
      mentorToStudentAssignement: {
        none: {
          userId: mentorId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getMentorWithStudentsAsync(mentorId: number) {
  return prisma.user.findFirstOrThrow({
    where: {
      id: mentorId,
    },
    select: {
      id: true,
      fullName: true,
      frequencyInDays: true,
      mentorToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });
}

export async function assignStudentToMentorAsync(
  request: Request,
  mentorId: number,
  studentId: number,
) {
  const currentUserAzureId = await getCurrentUserADIdAsync(request);

  return await prisma.mentorToStudentAssignement.create({
    data: {
      studentId,
      userId: mentorId,
      assignedBy: currentUserAzureId,
    },
  });
}

export async function removeMentorStudentAssignement(
  userId: number,
  studentId: number,
) {
  return await prisma.mentorToStudentAssignement.delete({
    where: {
      userId_studentId: {
        userId,
        studentId,
      },
    },
  });
}
