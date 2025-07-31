namespace Achievers.Domain.Aggregates;

public sealed class Mentor : Entity, IAggregateRoot
{
    public string? AzureAdid { get; private set; }
    public string Email { get; private set; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string Mobile { get; private set; } = null!;
    public string AddressStreet { get; private set; } = null!;
    public string AddressSuburb { get; private set; } = null!;
    public string AddressState { get; private set; } = null!;
    public string AddressPostcode { get; private set; } = null!;
    public string? AdditionalEmail { get; private set; }
    public DateTime? DateOfBirth { get; private set; }
    public string? EmergencyContactName { get; private set; }
    public string? EmergencyContactNumber { get; private set; }
    public string? EmergencyContactAddress { get; private set; }
    public string? EmergencyContactRelationship { get; private set; }
    public string? NextOfKinName { get; private set; }
    public string? NextOfKinNumber { get; private set; }
    public string? NextOfKinAddress { get; private set; }
    public string? NextOfKinRelationship { get; private set; }
    public string? ProfilePicturePath { get; private set; }
    public bool? HasApprovedToPublishPhotos { get; private set; }
    public DateTime? EndDate { get; private set; }
    public DateTime? VolunteerAgreementSignedOn { get; private set; }
    public int? FrequencyInDays { get; private set; }
    public int ChapterId { get; private set; }
    public string FullName { get; private set; } = null!;
    public string? EndReason { get; private set; }
    public string? PreferredName { get; private set; }
}
