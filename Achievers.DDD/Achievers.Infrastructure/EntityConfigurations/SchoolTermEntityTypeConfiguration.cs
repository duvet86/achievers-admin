using Achievers.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Achievers.Infrastructure.EntityConfigurations;

public sealed class SchoolTermEntityTypeConfiguration : IEntityTypeConfiguration<SchoolTerm>
{
    public void Configure(EntityTypeBuilder<SchoolTerm> entity)
    {
        entity.ToTable("SchoolTerm");

        entity.HasKey(e => e.Id).HasName("PRIMARY");

        entity.HasIndex(e => new { e.StartDate, e.EndDate }, "SchoolTerm_startDate_endDate_key").IsUnique();

        entity.HasIndex(e => e.Year, "SchoolTerm_year_idx");

        entity.Property(e => e.Id).HasColumnName("id");
        
        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
            .HasColumnType("datetime(3)")
            .HasColumnName("createdAt");
        
        entity.Property(e => e.EndDate)
            .HasColumnType("datetime(3)")
            .HasColumnName("endDate");
        
        entity.Property(e => e.StartDate)
            .HasColumnType("datetime(3)")
            .HasColumnName("startDate");
        
        entity.Property(e => e.UpdatedAt)
            .HasColumnType("datetime(3)")
            .HasColumnName("updatedAt");
        
        entity.Property(e => e.Year).HasColumnName("year");
    }
}
