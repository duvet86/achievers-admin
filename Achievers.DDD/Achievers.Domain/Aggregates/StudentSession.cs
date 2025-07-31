namespace Achievers.Domain.Aggregates;

public sealed class StudentSession : Entity, IAggregateRoot
{
    public int ChapterId { get; private set; }
    public int StudentId { get; private set; }
    public DateTime AttendedOn { get; private set; }
    public string Status { get; private set; } = null!;
    public string? Reason { get; private set; }
}