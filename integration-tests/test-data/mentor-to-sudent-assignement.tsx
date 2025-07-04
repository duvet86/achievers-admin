import type { Prisma, PrismaClient } from "~/prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export async function assignMentorsToStudentsAsync(
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
) {
  await tx.mentorToStudentAssignement.deleteMany();

  const mentorsAtChapter = await tx.mentor.findMany();
  const studentsAtChapter = await tx.student.findMany();

  await tx.mentorToStudentAssignement.createMany({
    data: [
      {
        mentorId: mentorsAtChapter[0].id,
        studentId: studentsAtChapter[0].id,
        assignedBy: "test",
      },
      {
        mentorId: mentorsAtChapter[0].id,
        studentId: studentsAtChapter[1].id,
        assignedBy: "test",
      },

      {
        mentorId: mentorsAtChapter[1].id,
        studentId: studentsAtChapter[1].id,
        assignedBy: "test",
      },
      {
        mentorId: mentorsAtChapter[2].id,
        studentId: studentsAtChapter[2].id,
        assignedBy: "test",
      },
    ],
  });
}
