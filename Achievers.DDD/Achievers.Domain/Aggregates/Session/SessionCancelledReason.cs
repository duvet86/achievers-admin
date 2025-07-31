namespace Achievers.Domain.Aggregates.Session;

public sealed class SessionCancelledReason : Entity
{
    public string Reason { get; set; } = null!;
}
