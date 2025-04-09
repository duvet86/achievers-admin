import type { Prisma, PrismaClient } from "~/prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export async function assignMentorsToStudentsAsync(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  await prisma.$transaction(async (tx) => {
    await tx.mentorToStudentAssignement.deleteMany();

    const mentorsAtChapter = await tx.user.findMany();
    const studentsAtChapter = await tx.student.findMany();

    await tx.mentorToStudentAssignement.createMany({
      data: [
        {
          userId: mentorsAtChapter[0].id,
          studentId: studentsAtChapter[0].id,
          assignedBy: "test",
        },
        {
          userId: mentorsAtChapter[0].id,
          studentId: studentsAtChapter[1].id,
          assignedBy: "test",
        },

        {
          userId: mentorsAtChapter[1].id,
          studentId: studentsAtChapter[1].id,
          assignedBy: "test",
        },
        {
          userId: mentorsAtChapter[2].id,
          studentId: studentsAtChapter[2].id,
          assignedBy: "test",
        },
      ],
    });
  });
}
