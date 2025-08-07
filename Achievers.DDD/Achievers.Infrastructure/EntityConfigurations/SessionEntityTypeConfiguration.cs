using Achievers.Domain.Aggregates;
using Achievers.Domain.Aggregates.Session;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class SessionEntityTypeConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> entity)
    {
        entity.ToTable("Session");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => e.MentorSessionId, "SessionAttendance_mentorSessionId_fkey");

        entity.HasIndex(e => e.StudentSessionId, "SessionAttendance_studentSessionId_fkey");

        entity.HasIndex(e => e.CancelledReasonId, "Session_cancelledReasonId_key").IsUnique();

        entity.HasIndex(e => new { e.ChapterId, e.MentorSessionId, e.StudentSessionId }, "Session_chapterId_mentorSessionId_studentSessionId_key").IsUnique();

        entity.Property(e => e.Id).HasColumnName("id");
        
        entity.Property(e => e.AttendedOn)
            .HasColumnType("date")
            .HasColumnName("attendedOn");
        
        entity.Property(e => e.CancelledAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("cancelledAt");
        
        entity.Property(e => e.CancelledBecauseOf)
            .HasColumnType("enum('MENTOR','STUDENT')")
            .HasColumnName("cancelledBecauseOf");
        
        entity.Property(e => e.CancelledExtendedReason)
            .HasMaxLength(191)
            .HasColumnName("cancelledExtendedReason");
        
        entity.Property(e => e.CancelledReasonId).HasColumnName("cancelledReasonId");
        
        entity.Property(e => e.ChapterId).HasColumnName("chapterId");
        
        entity.Property(e => e.CompletedOn)
            .HasColumnType("datetime(3)")
            .HasColumnName("completedOn");
        
        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");
        
        entity.Property(e => e.HasReport).HasColumnName("hasReport");
        
        entity.Property(e => e.IsCancelled).HasColumnName("isCancelled");
        
        entity.Property(e => e.MentorSessionId).HasColumnName("mentorSessionId");
        
        entity.Property(e => e.NotificationSentOn)
            .HasColumnType("datetime(3)")
            .HasColumnName("notificationSentOn");
        
        entity.Property(e => e.Report)
            .HasColumnType("text")
            .HasColumnName("report");
        
        entity.Property(e => e.ReportFeedback)
            .HasColumnType("text")
            .HasColumnName("reportFeedback");
        
        entity.Property(e => e.SignedOffByAzureId)
            .HasMaxLength(191)
            .HasColumnName("signedOffByAzureId");
        
        entity.Property(e => e.SignedOffOn)
            .HasColumnType("datetime(3)")
            .HasColumnName("signedOffOn");
        
        entity.Property(e => e.StudentSessionId).HasColumnName("studentSessionId");
        
        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");
        
        entity.Property(e => e.WritteOnBehalfByAzureId)
            .HasMaxLength(191)
            .HasColumnName("writteOnBehalfByAzureId");

        entity.HasOne<SessionCancelledReason>().WithOne()
            .HasForeignKey<Session>(d => d.CancelledReasonId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("Session_cancelledReasonId_fkey");

        entity.HasOne<Chapter>().WithMany()
            .HasForeignKey(d => d.ChapterId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("Session_chapterId_fkey");

        entity.HasOne<MentorSession>().WithMany()
            .HasForeignKey(d => d.MentorSessionId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("Session_mentorSessionId_fkey");

        entity.HasOne<StudentSession>().WithMany()
            .HasForeignKey(d => d.StudentSessionId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("Session_studentSessionId_fkey");
    }
}
