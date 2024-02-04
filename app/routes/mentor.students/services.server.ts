import type { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { calculateYearLevel } from "~/services";

export async function getMentorStudentsAsync(mentorId: User["id"]) {
  const students = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentorId,
    },
    select: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
        },
      },
    },
  });

  return students.map(({ student }) => ({
    ...student,
    yearLevel: calculateYearLevel(student.dateOfBirth),
  }));
}
