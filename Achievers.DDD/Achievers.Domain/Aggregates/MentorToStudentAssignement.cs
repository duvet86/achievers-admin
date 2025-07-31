namespace Achievers.Domain.Aggregates;

public sealed class MentorToStudentAssignement : Entity, IAggregateRoot
{
    public int MentorId { get; private set; }

    public int StudentId { get; private set; }

    public string AssignedBy { get; private set; } = null!;

    public DateTime AssignedAt { get; private set; }
}