using Achievers.Domain.Aggregates.Session;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class SessionCancelledReasonEntityTypeConfiguration : IEntityTypeConfiguration<SessionCancelledReason>
{
    public void Configure(EntityTypeBuilder<SessionCancelledReason> entity)
    {
        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.ToTable("SessionCancelledReason");

        entity.HasIndex(e => e.Reason, "SessionCancelledReason_reason_key").IsUnique();

        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Reason)
            .HasMaxLength(191)
            .HasColumnName("reason");
    }
}
