using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class MentorToStudentAssignementEntityTypeConfiguration : IEntityTypeConfiguration<MentorToStudentAssignement>
{
    public void Configure(EntityTypeBuilder<MentorToStudentAssignement> entity)
    {
        entity.ToTable("MentorToStudentAssignement");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => new { e.MentorId, e.StudentId }, "MentorToStudentAssignement_mentorId_studentId_key").IsUnique();

        entity.HasIndex(e => e.StudentId, "MentorToStudentAssignement_studentId_fkey");

        entity.Property(e => e.Id).HasColumnName("id");
        
        entity.Property(e => e.AssignedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("assignedAt");
        
        entity.Property(e => e.AssignedBy)
            .HasMaxLength(191)
            .HasColumnName("assignedBy");
        
        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");
        
        entity.Property(e => e.MentorId).HasColumnName("mentorId");
        
        entity.Property(e => e.StudentId).HasColumnName("studentId");
        
        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");

        entity.HasOne<Mentor>().WithMany()
            .HasForeignKey(d => d.MentorId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("MentorToStudentAssignement_mentorId_fkey");

        entity.HasOne<Student>().WithMany()
            .HasForeignKey(d => d.StudentId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("MentorToStudentAssignement_studentId_fkey");
    }
}
