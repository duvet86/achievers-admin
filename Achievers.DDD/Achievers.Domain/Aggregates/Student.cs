namespace Achievers.Domain.Aggregates;

public sealed class Student : Entity, IAggregateRoot
{
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public DateTime? StartDate { get; private set; }
    public DateTime? DateOfBirth { get; private set; }
    public string? Gender { get; private set; }
    public string? Address { get; private set; }
    public bool Allergies { get; private set; }
    public bool HasApprovedToPublishPhotos { get; private set; }
    public string? BestPersonToContact { get; private set; }
    public string? BestContactMethod { get; private set; }
    public string? SchoolName { get; private set; }
    public string? EmergencyContactFullName { get; private set; }
    public string? EmergencyContactRelationship { get; private set; }
    public string? EmergencyContactPhone { get; private set; }
    public string? EmergencyContactEmail { get; private set; }
    public string? EmergencyContactAddress { get; private set; }
    public DateTime? EndDate { get; private set; }
    public int ChapterId { get; private set; }
    public string FullName { get; private set; } = null!;
    public int? YearLevel { get; private set; }
    public int? EoiStudentProfileId { get; private set; }
    public string? ProfilePicturePath { get; private set; }
}
