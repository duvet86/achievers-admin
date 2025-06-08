import type { IAggregateRoot } from "ddd/core/IAggregateRoot";

import { Entity } from "@core/Entity";

export interface ISessionProps {
  chapterId: number;
  mentorSessionId: number;
  studentSessionId: number;
  attendedOn: Date;
  report: string | null;
  completedOn: Date | null;
  notificationSentOn: Date | null;
  reportFeedback: string | null;
  signedOffOn: Date | null;
  signedOffByAzureId: string | null;
  writteOnBehalfByAzureId: string | null;
  cancelledAt: Date | null;
  cancelledReason: string | null;
  hasReport: boolean;
  isCancelled: boolean;
}

export class Session extends Entity<ISessionProps> implements IAggregateRoot {
  private _chapterId: number;
  private _mentorSessionId: number;
  private _studentSessionId: number;
  private _attendedOn: Date;
  private _report: string | null;
  private _completedOn: Date | null;
  private _notificationSentOn: Date | null;
  private _reportFeedback: string | null;
  private _signedOffOn: Date | null;
  private _signedOffByAzureId: string | null;
  private _writteOnBehalfByAzureId: string | null;
  private _cancelledAt: Date | null;
  private _cancelledReason: string | null;

  private _hasReport: boolean;
  private _isCancelled: boolean;

  private constructor(
    {
      chapterId,
      mentorSessionId,
      studentSessionId,
      attendedOn,
      report,
      completedOn,
      notificationSentOn,
      reportFeedback,
      signedOffOn,
      signedOffByAzureId,
      writteOnBehalfByAzureId,
      cancelledAt,
      cancelledReason,
      hasReport,
      isCancelled,
    }: ISessionProps,
    id?: number,
  ) {
    super(id);
    this._chapterId = chapterId;
    this._mentorSessionId = mentorSessionId;
    this._studentSessionId = studentSessionId;
    this._attendedOn = attendedOn;
    this._report = report;
    this._completedOn = completedOn;
    this._notificationSentOn = notificationSentOn;
    this._reportFeedback = reportFeedback;
    this._signedOffOn = signedOffOn;
    this._signedOffByAzureId = signedOffByAzureId;
    this._writteOnBehalfByAzureId = writteOnBehalfByAzureId;
    this._cancelledAt = cancelledAt;
    this._cancelledReason = cancelledReason;

    this._hasReport = hasReport;
    this._isCancelled = isCancelled;
  }

  get chapterId() {
    return this._chapterId;
  }
  get mentorSessionId() {
    return this._mentorSessionId;
  }
  get studentSessionId() {
    return this._studentSessionId;
  }
  get attendedOn() {
    return this._attendedOn;
  }
  get report() {
    return this._report;
  }
  get completedOn() {
    return this._completedOn;
  }
  get notificationSentOn() {
    return this._notificationSentOn;
  }
  get reportFeedback() {
    return this._reportFeedback;
  }
  get signedOffOn() {
    return this._signedOffOn;
  }
  get signedOffByAzureId() {
    return this._signedOffByAzureId;
  }
  get writteOnBehalfByAzureId() {
    return this._writteOnBehalfByAzureId;
  }
  get cancelledAt() {
    return this._cancelledAt;
  }
  get cancelledReason() {
    return this._cancelledReason;
  }
  get hasReport() {
    return this._hasReport;
  }
  get isCancelled() {
    return this._isCancelled;
  }

  public static create(props: ISessionProps) {
    return new Session(props);
  }

  public static init(id: number, props: ISessionProps) {
    return new Session(props, id);
  }

  public isSessionFinalised() {
    return this._completedOn !== null;
  }
}
