using Achievers.Domain;
using Achievers.Domain.Aggregates;
using Achievers.Domain.Aggregates.Session;
using Achievers.Infrastructure.EntityConfigurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;

namespace Achievers.Infrastructure;

public partial class DBContext : DbContext, IUnitOfWork
{
    private IDbContextTransaction? _currentTransaction;

    public DBContext()
    {
    }

    public DBContext(DbContextOptions<DBContext> options)
        : base(options)
    {
    }

    public IDbContextTransaction? GetCurrentTransaction() => _currentTransaction;
    public bool HasActiveTransaction => _currentTransaction != null;

    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Mentor> Mentors { get; set; }
    public DbSet<MentorSession> MentorSessions { get; set; }
    public DbSet<MentorToStudentAssignement> MentorToStudentAssignements { get; set; }
    public DbSet<SchoolTerm> SchoolTerms { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<StudentSession> StudentSessions { get; set; }

    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        // After executing this line all the changes (from the Command Handler and Domain Event Handlers) 
        // performed through the DbContext will be committed
        _ = await base.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<IDbContextTransaction?> BeginTransactionAsync()
    {
        if (_currentTransaction != null)
        {
            return null;
        }

        _currentTransaction = await Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        return _currentTransaction;
    }

    public async Task CommitTransactionAsync(IDbContextTransaction transaction)
    {
        ArgumentNullException.ThrowIfNull(transaction);

        if (transaction != _currentTransaction)
        {
            throw new InvalidOperationException($"Transaction {transaction.TransactionId} is not current");
        }

        try
        {
            await SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            RollbackTransaction();
            throw;
        }
        finally
        {
            if (HasActiveTransaction)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public void RollbackTransaction()
    {
        try
        {
            _currentTransaction?.Rollback();
        }
        finally
        {
            if (HasActiveTransaction)
            {
                _currentTransaction!.Dispose();
                _currentTransaction = null;
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("Achievers");

        modelBuilder.ApplyConfiguration(new ChapterEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new MentorEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new MentorSessionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new MentorToStudentAssignementEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new SchoolTermEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new SessionCancelledReasonEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new SessionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new StudentEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new StudentSessionEntityTypeConfiguration());
    }
}
