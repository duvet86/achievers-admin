import type { IMentorStudentAssignmentRepository } from "~/domain/aggregates/mentorStudentAssignment/IMentorStudentAssignmentRepository";

import { prisma } from "~/db.server";
import { MentorStudentAssignment } from "~/domain/aggregates/mentorStudentAssignment/MentorStudentAssignment";

export class MentorStudentAssignmentRepository implements IMentorStudentAssignmentRepository {
  async findByPairAsync(
    mentorId: number,
    studentId: number,
  ): Promise<MentorStudentAssignment> {
    const dbPair = await prisma.mentorToStudentAssignement.findUniqueOrThrow({
      where: {
        mentorId_studentId: {
          mentorId,
          studentId,
        },
      },
      select: {
        id: true,
        mentorId: true,
        studentId: true,
        assignedBy: true,
      },
    });

    const pair = new MentorStudentAssignment(
      {
        mentorId,
        studentId,
        assignedByAzureId: dbPair.assignedBy,
      },
      dbPair.id,
    );

    return pair;
  }

  async saveAsync(entity: MentorStudentAssignment): Promise<void> {
    await prisma.mentorToStudentAssignement.create({
      data: {
        mentorId: entity.mentorId,
        studentId: entity.studentId,
        assignedBy: entity.assignedByAzureId,
      },
    });
  }

  async deleteAsync(id: number): Promise<void> {
    await prisma.mentorToStudentAssignement.delete({
      where: {
        id,
      },
    });
  }
}
