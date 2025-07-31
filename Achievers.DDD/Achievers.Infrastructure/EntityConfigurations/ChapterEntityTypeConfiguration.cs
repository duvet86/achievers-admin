using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class ChapterEntityTypeConfiguration : IEntityTypeConfiguration<Chapter>
{
    public void Configure(EntityTypeBuilder<Chapter> entity)
    {
        entity.ToTable("Chapter");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => e.Name, "Chapter_name_key").IsUnique();

        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.Address)
            .HasMaxLength(191)
            .HasColumnName("address");

        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");

        entity.Property(e => e.Name)
            .HasMaxLength(191)
            .HasColumnName("name");

        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");
    }
}
