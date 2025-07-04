import { prisma } from "~/db.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export async function getMentorsInChapterAsync(
  chapterId: number,
  studentId: number,
) {
  return prisma.mentor.findMany({
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
          mentor: {
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
        studentId,
        mentorId,
      },
    },
  });
}
