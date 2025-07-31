namespace Achievers.Domain.Aggregates;

public sealed class Chapter : Entity, IAggregateRoot
{
    public string Name { get; private set; } = null!;
    public string Address { get; private set; } = null!;
}
