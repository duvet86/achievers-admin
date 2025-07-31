using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class MentorEntityTypeConfiguration : IEntityTypeConfiguration<Mentor>
{
    public void Configure(EntityTypeBuilder<Mentor> entity)
    {
        entity.ToTable("Mentor");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => e.AzureAdid, "Mentor_azureADId_key").IsUnique();

        entity.HasIndex(e => e.Email, "Mentor_email_key").IsUnique();

        entity.HasIndex(e => e.ChapterId, "User_chapterId_fkey");

        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.AdditionalEmail)
            .HasMaxLength(191)
            .HasColumnName("additionalEmail");

        entity.Property(e => e.AddressPostcode)
            .HasMaxLength(191)
            .HasColumnName("addressPostcode");

        entity.Property(e => e.AddressState)
            .HasMaxLength(191)
            .HasColumnName("addressState");

        entity.Property(e => e.AddressStreet)
            .HasMaxLength(2000)
            .HasColumnName("addressStreet");

        entity.Property(e => e.AddressSuburb)
            .HasMaxLength(191)
            .HasColumnName("addressSuburb");

        entity.Property(e => e.AzureAdid)
            .HasMaxLength(191)
            .HasColumnName("azureADId");

        entity.Property(e => e.ChapterId).HasColumnName("chapterId");

        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");

        entity.Property(e => e.DateOfBirth)
            .HasColumnType("datetime(3)")
            .HasColumnName("dateOfBirth");

        entity.Property(e => e.Email)
            .HasMaxLength(191)
            .HasColumnName("email");

        entity.Property(e => e.EmergencyContactAddress)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactAddress");

        entity.Property(e => e.EmergencyContactName)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactName");

        entity.Property(e => e.EmergencyContactNumber)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactNumber");

        entity.Property(e => e.EmergencyContactRelationship)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactRelationship");

        entity.Property(e => e.EndDate)
            .HasColumnType("datetime(3)")
            .HasColumnName("endDate");

        entity.Property(e => e.EndReason)
            .HasColumnType("text")
            .HasColumnName("endReason");

        entity.Property(e => e.FirstName)
            .HasMaxLength(191)
            .HasColumnName("firstName");

        entity.Property(e => e.FrequencyInDays).HasColumnName("frequencyInDays");

        entity.Property(e => e.FullName)
            .HasMaxLength(191)
            .HasColumnName("fullName");

        entity.Property(e => e.HasApprovedToPublishPhotos).HasColumnName("hasApprovedToPublishPhotos");
        entity.Property(e => e.LastName)
            .HasMaxLength(191)
            .HasColumnName("lastName");

        entity.Property(e => e.Mobile)
            .HasMaxLength(191)
            .HasColumnName("mobile");

        entity.Property(e => e.NextOfKinAddress)
            .HasMaxLength(191)
            .HasColumnName("nextOfKinAddress");
        
        entity.Property(e => e.NextOfKinName)
            .HasMaxLength(191)
            .HasColumnName("nextOfKinName");
        entity.Property(e => e.NextOfKinNumber)
            .HasMaxLength(191)
            .HasColumnName("nextOfKinNumber");

        entity.Property(e => e.NextOfKinRelationship)
            .HasMaxLength(191)
            .HasColumnName("nextOfKinRelationship");

        entity.Property(e => e.PreferredName)
            .HasMaxLength(191)
            .HasColumnName("preferredName");

        entity.Property(e => e.ProfilePicturePath)
            .HasMaxLength(191)
            .HasColumnName("profilePicturePath");

        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");

        entity.Property(e => e.VolunteerAgreementSignedOn)
            .HasColumnType("datetime(3)")
            .HasColumnName("volunteerAgreementSignedOn");

        entity.HasOne<Chapter>().WithMany()
            .HasForeignKey(d => d.ChapterId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("Mentor_chapterId_fkey");
    }
}
