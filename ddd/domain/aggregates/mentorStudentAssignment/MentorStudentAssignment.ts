import type { IAggregateRoot } from "../../IAggregateRoot";

import { Entity } from "../../Entity";

export interface MentorStudentAssignmentProps {
  mentorId: number;
  studentId: number;
  assignedByAzureId: string;
}

export class MentorStudentAssignment extends Entity implements IAggregateRoot {
  private _mentorId: number;
  private _studentId: number;
  private _assignedByAzureId: string;

  public get mentorId(): number {
    return this._mentorId;
  }

  public get studentId(): number {
    return this._studentId;
  }

  public get assignedByAzureId(): string {
    return this._assignedByAzureId;
  }

  public constructor(
    { mentorId, studentId, assignedByAzureId }: MentorStudentAssignmentProps,
    id?: number,
  ) {
    super(id);
    this._mentorId = mentorId;
    this._studentId = studentId;
    this._assignedByAzureId = assignedByAzureId;
  }
}
