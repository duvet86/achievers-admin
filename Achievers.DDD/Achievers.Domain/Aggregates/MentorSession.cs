namespace Achievers.Domain.Aggregates;

public sealed class MentorSession : Entity, IAggregateRoot
{
    public int ChapterId { get; set; }
    public int MentorId { get; set; }
    public DateTime AttendedOn { get; set; }
    public string Status { get; set; } = null!;
}
