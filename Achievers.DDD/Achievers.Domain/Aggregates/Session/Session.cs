namespace Achievers.Domain.Aggregates.Session;

public sealed class Session : Entity, IAggregateRoot
{
    public int MentorSessionId { get; private set; }
    public int StudentSessionId { get; private set; }
    public int ChapterId { get; private set; }
    public DateTime AttendedOn { get; private set; }
    public string? Report { get; private set; }
    public bool? HasReport { get; private set; }
    public DateTime? CompletedOn { get; private set; }
    public DateTime? NotificationSentOn { get; private set; }
    public string? ReportFeedback { get; private set; }
    public DateTime? SignedOffOn { get; private set; }
    public string? SignedOffByAzureId { get; private set; }
    public string? WritteOnBehalfByAzureId { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancelledExtendedReason { get; private set; }
    public bool? IsCancelled { get; private set; }
    public string? CancelledBecauseOf { get; private set; }
    public int? CancelledReasonId { get; private set; }

    public SessionCancelledReason? SessionCancelledReason { get; private set; }
}
