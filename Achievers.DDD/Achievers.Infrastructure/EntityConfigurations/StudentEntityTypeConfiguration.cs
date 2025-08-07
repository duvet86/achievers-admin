using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class StudentEntityTypeConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> entity)
    {
        entity.ToTable("Student");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => e.ChapterId, "Student_chapterId_fkey");

        entity.HasIndex(e => e.EoiStudentProfileId, "Student_eoiStudentProfileId_key").IsUnique();

        entity.Property(e => e.Id).HasColumnName("id");
        
        entity.Property(e => e.Address)
            .HasMaxLength(191)
            .HasColumnName("address");
        
        entity.Property(e => e.Allergies).HasColumnName("allergies");
        
        entity.Property(e => e.BestContactMethod)
            .HasMaxLength(191)
            .HasColumnName("bestContactMethod");
        
        entity.Property(e => e.BestPersonToContact)
            .HasMaxLength(191)
            .HasColumnName("bestPersonToContact");
        
        entity.Property(e => e.ChapterId).HasColumnName("chapterId");
        
        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");
        
        entity.Property(e => e.DateOfBirth)
            .HasColumnType("datetime(3)")
            .HasColumnName("dateOfBirth");
        
        entity.Property(e => e.EmergencyContactAddress)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactAddress");
        
        entity.Property(e => e.EmergencyContactEmail)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactEmail");
        
        entity.Property(e => e.EmergencyContactFullName)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactFullName");
        
        entity.Property(e => e.EmergencyContactPhone)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactPhone");
        
        entity.Property(e => e.EmergencyContactRelationship)
            .HasMaxLength(191)
            .HasColumnName("emergencyContactRelationship");
        
        entity.Property(e => e.EndDate)
            .HasColumnType("datetime(3)")
            .HasColumnName("endDate");
        
        entity.Property(e => e.EoiStudentProfileId).HasColumnName("eoiStudentProfileId");
        
        entity.Property(e => e.FirstName)
            .HasMaxLength(191)
            .HasColumnName("firstName");
        
        entity.Property(e => e.FullName)
            .HasMaxLength(191)
            .HasColumnName("fullName");
        
        entity.Property(e => e.Gender)
            .HasColumnType("enum('MALE','FEMALE')")
            .HasColumnName("gender");
        
        entity.Property(e => e.HasApprovedToPublishPhotos).HasColumnName("hasApprovedToPublishPhotos");
        
        entity.Property(e => e.LastName)
            .HasMaxLength(191)
            .HasColumnName("lastName");
        
        entity.Property(e => e.ProfilePicturePath)
            .HasMaxLength(191)
            .HasColumnName("profilePicturePath");
        
        entity.Property(e => e.SchoolName)
            .HasMaxLength(191)
            .HasColumnName("schoolName");
        
        entity.Property(e => e.StartDate)
            .HasColumnType("datetime(3)")
            .HasColumnName("startDate");
        
        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");
        
        entity.Property(e => e.YearLevel).HasColumnName("yearLevel");

        entity.HasOne<Chapter>().WithMany()
            .HasForeignKey(d => d.ChapterId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("Student_chapterId_fkey");

        //entity.HasOne<EoiStudentProfile>().WithOne()
        //    .HasForeignKey<Student>(d => d.EoiStudentProfileId)
        //    .OnDelete(DeleteBehavior.SetNull)
        //    .HasConstraintName("Student_eoiStudentProfileId_fkey");
    }
}
