namespace Achievers.Domain.Aggregates;

public sealed class SchoolTerm : Entity, IAggregateRoot
{
    public int Year { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
}