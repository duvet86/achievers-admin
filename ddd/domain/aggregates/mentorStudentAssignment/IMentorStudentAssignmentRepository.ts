import type { MentorStudentAssignment } from "./MentorStudentAssignment";

export interface IMentorStudentAssignmentRepository {
  findByPairAsync(
    mentorId: number,
    studentId: number,
  ): Promise<MentorStudentAssignment>;
  saveAsync(entity: MentorStudentAssignment): Promise<void>;
  deleteAsync(id: number): Promise<void>;
}
