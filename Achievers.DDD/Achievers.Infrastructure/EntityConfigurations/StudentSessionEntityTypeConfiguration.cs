using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class StudentSessionEntityTypeConfiguration : IEntityTypeConfiguration<StudentSession>
{
    public void Configure(EntityTypeBuilder<StudentSession> entity)
    {
        entity.ToTable("StudentSession");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => new { e.ChapterId, e.StudentId, e.AttendedOn }, "StudentSession_chapterId_studentId_attendedOn_key").IsUnique();

        entity.HasIndex(e => e.StudentId, "StudentSession_studentId_fkey");

        entity.Property(e => e.Id).HasColumnName("id");
        
        entity.Property(e => e.AttendedOn)
            .HasColumnType("date")
        
            .HasColumnName("attendedOn");
        entity.Property(e => e.ChapterId).HasColumnName("chapterId");
        
        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");
        
        entity.Property(e => e.Reason)
            .HasMaxLength(191)
            .HasColumnName("reason");
        
        entity.Property(e => e.Status)
            .HasDefaultValueSql("'AVAILABLE'")
            .HasColumnType("enum('AVAILABLE','UNAVAILABLE')")
            .HasColumnName("status");
        
        entity.Property(e => e.StudentId).HasColumnName("studentId");
        
        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");

        entity.HasOne<Chapter>().WithMany()
            .HasForeignKey(d => d.ChapterId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("StudentSession_chapterId_fkey");

        entity.HasOne<Student>().WithMany()
            .HasForeignKey(d => d.StudentId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("StudentSession_studentId_fkey");
    }
}
