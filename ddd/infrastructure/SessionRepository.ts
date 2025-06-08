import type { IRepository } from "@core/IRepository";

import { Session } from "@domain/Session";
import { prisma } from "~/db.server";

export type ISessionRepository = IRepository<Session>;

export class SessionRepository implements ISessionRepository {
  findAllAsync(): Promise<Session[]> {
    throw new Error("Method not implemented.");
  }

  async findByIdAsync(id: number): Promise<Session> {
    const dbSession = await prisma.sessionAttendance.findUniqueOrThrow({
      where: { id },
    });

    return Session.init(dbSession.id, {
      chapterId: dbSession.chapterId,
      mentorSessionId: dbSession.mentorSessionId,
      studentSessionId: dbSession.studentSessionId,
      attendedOn: dbSession.attendedOn,
      report: dbSession.report,
      completedOn: dbSession.completedOn,
      notificationSentOn: dbSession.notificationSentOn,
      reportFeedback: dbSession.reportFeedback,
      signedOffOn: dbSession.signedOffOn,
      signedOffByAzureId: dbSession.signedOffByAzureId,
      writteOnBehalfByAzureId: dbSession.writteOnBehalfByAzureId,
      cancelledAt: dbSession.cancelledAt,
      cancelledReason: dbSession.cancelledReason,
      hasReport: dbSession.hasReport,
      isCancelled: dbSession.isCancelled,
    });
  }

  async saveAsync(entity: Session): Promise<number> {
    const dbSession = await prisma.sessionAttendance.create({
      data: {
        chapterId: entity.chapterId,
        mentorSessionId: entity.mentorSessionId,
        studentSessionId: entity.studentSessionId,
        attendedOn: entity.attendedOn,
        report: entity.report,
        completedOn: entity.completedOn,
        notificationSentOn: entity.notificationSentOn,
        reportFeedback: entity.reportFeedback,
        signedOffOn: entity.signedOffOn,
        signedOffByAzureId: entity.signedOffByAzureId,
        writteOnBehalfByAzureId: entity.writteOnBehalfByAzureId,
        cancelledAt: entity.cancelledAt,
        cancelledReason: entity.cancelledReason,
      },
    });

    return dbSession.id;
  }

  async deleteAsync(id: number): Promise<number> {
    const dbSession = await prisma.sessionAttendance.delete({
      where: { id },
      select: { id: true },
    });

    return dbSession.id;
  }
}
