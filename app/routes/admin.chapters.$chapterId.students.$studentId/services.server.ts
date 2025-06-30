import { prisma } from "~/db.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export async function getMentorsInChapterAsync(
  chapterId: number,
  studentId: number,
) {
  return prisma.user.findMany({
    where: {
      endDate: null,
      chapterId,
      mentorToStudentAssignement: {
        none: {
          studentId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getStudentWithMentorsAsync(studentId: number) {
  return prisma.student.findFirstOrThrow({
    where: {
      endDate: null,
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              frequencyInDays: true,
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
  const loggedUser = await getLoggedUserInfoAsync(request);

  return await prisma.mentorToStudentAssignement.create({
    data: {
      studentId,
      userId: mentorId,
      assignedBy: loggedUser.oid,
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
        studentId,
        userId,
      },
    },
  });
}
