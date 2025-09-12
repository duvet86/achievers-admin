import { prisma } from "~/db.server";
import { MentorStudentAssignment } from "~/domain/aggregates/mentorStudentAssignment/MentorStudentAssignment";
import { MentorStudentAssignmentRepository } from "~/infra/repositories/MentorStudentAssignmentRepository";
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

  const pair = new MentorStudentAssignment({
    mentorId,
    studentId,
    assignedByAzureId: loggedUser.oid,
  });

  const repo = new MentorStudentAssignmentRepository();

  await repo.saveAsync(pair);

  return pair;
}

export async function removeMentorStudentAssignement(
  mentorId: number,
  studentId: number,
) {
  const repo = new MentorStudentAssignmentRepository();

  const pair = await repo.findByPairAsync(mentorId, studentId);

  await repo.deleteAsync(pair.id);

  return pair;
}
