import { prisma } from "~/db.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export async function getStudentsInChapterAsync(
  chapterId: number,
  mentorId: number,
) {
  return prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
      mentorToStudentAssignement: {
        none: {
          mentorId,
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
  return prisma.mentor.findFirstOrThrow({
    where: {
      endDate: null,
      id: mentorId,
    },
    select: {
      id: true,
      fullName: true,
      frequencyInDays: true,
      chapterId: true,
      mentorToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
              endDate: true,
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
      mentorId,
      assignedBy: loggedUser.oid,
    },
  });
}

export async function removeMentorStudentAssignement(
  mentorId: number,
  studentId: number,
) {
  return await prisma.mentorToStudentAssignement.delete({
    where: {
      mentorId_studentId: {
        mentorId,
        studentId,
      },
    },
  });
}
