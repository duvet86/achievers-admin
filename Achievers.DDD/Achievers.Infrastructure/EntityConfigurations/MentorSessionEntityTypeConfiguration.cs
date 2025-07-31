using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class MentorSessionEntityTypeConfiguration : IEntityTypeConfiguration<MentorSession>
{
    public void Configure(EntityTypeBuilder<MentorSession> entity)
    {
        entity.ToTable("MentorSession");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => new { e.ChapterId, e.MentorId, e.AttendedOn }, "MentorSession_chapterId_mentorId_attendedOn_key").IsUnique();

        entity.HasIndex(e => e.MentorId, "MentorSession_mentorId_fkey");

        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.AttendedOn)
            .HasColumnType("date")
            .HasColumnName("attendedOn");

        entity.Property(e => e.ChapterId).HasColumnName("chapterId");

        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");

        entity.Property(e => e.MentorId).HasColumnName("mentorId");

        entity.Property(e => e.Status)
            .HasDefaultValueSql("'AVAILABLE'")
            .HasColumnType("enum('AVAILABLE','UNAVAILABLE')")
            .HasColumnName("status");

        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");

        entity.HasOne<Chapter>().WithMany()
            .HasForeignKey(d => d.ChapterId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("MentorSession_chapterId_fkey");

        entity.HasOne<Mentor>().WithMany()
            .HasForeignKey(d => d.MentorId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("MentorSession_mentorId_fkey");
    }
}
