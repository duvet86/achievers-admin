using Achievers.Domain.Aggregates;
using Achievers.Domain.Aggregates.Session;
using Microsoft.EntityFrameworkCore;

namespace Achievers.Infrastructure;

public partial class DBContext : DbContext
{
    public DBContext()
    {
    }

    public DBContext(DbContextOptions<DBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Chapter> Chapters { get; set; }
    public virtual DbSet<Mentor> Mentors { get; set; }
    public virtual DbSet<MentorSession> Mentorsessions { get; set; }
    public virtual DbSet<MentorToStudentAssignement> Mentortostudentassignements { get; set; }
    public virtual DbSet<SchoolTerm> Schoolterms { get; set; }
    public virtual DbSet<Session> Sessions { get; set; }
    public virtual DbSet<Student> Students { get; set; }
    public virtual DbSet<StudentSession> Studentsessions { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseMySQL("Server=localhost;Database=achievers;User=root;Password=my-secret-pw;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        

        //modelBuilder.Entity<Chapter>(entity =>
        //{
        //    entity.HasKey(e => e.Id).HasName("PRIMARY");

        //    entity.ToTable("chapter");

        //    entity.HasIndex(e => e.Name, "Chapter_name_key").IsUnique();

        //    entity.Property(e => e.Id).HasColumnName("id");
        //    entity.Property(e => e.Address)
        //        .HasMaxLength(191)
        //        .HasColumnName("address");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("createdAt");
        //    entity.Property(e => e.Name)
        //        .HasMaxLength(191)
        //        .HasColumnName("name");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("updatedAt");
        //});

        //modelBuilder.Entity<Mentor>(entity =>
        //{
        //    entity.HasKey(e => e.Id).HasName("PRIMARY");

        //    entity.ToTable("mentor");

        //    entity.HasIndex(e => e.AzureAdid, "Mentor_azureADId_key").IsUnique();

        //    entity.HasIndex(e => e.Email, "Mentor_email_key").IsUnique();

        //    entity.HasIndex(e => e.ChapterId, "User_chapterId_fkey");

        //    entity.Property(e => e.Id).HasColumnName("id");
        //    entity.Property(e => e.AdditionalEmail)
        //        .HasMaxLength(191)
        //        .HasColumnName("additionalEmail");
        //    entity.Property(e => e.AddressPostcode)
        //        .HasMaxLength(191)
        //        .HasColumnName("addressPostcode");
        //    entity.Property(e => e.AddressState)
        //        .HasMaxLength(191)
        //        .HasColumnName("addressState");
        //    entity.Property(e => e.AddressStreet)
        //        .HasMaxLength(2000)
        //        .HasColumnName("addressStreet");
        //    entity.Property(e => e.AddressSuburb)
        //        .HasMaxLength(191)
        //        .HasColumnName("addressSuburb");
        //    entity.Property(e => e.AzureAdid)
        //        .HasMaxLength(191)
        //        .HasColumnName("azureADId");
        //    entity.Property(e => e.ChapterId).HasColumnName("chapterId");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("createdAt");
        //    entity.Property(e => e.DateOfBirth)
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("dateOfBirth");
        //    entity.Property(e => e.Email)
        //        .HasMaxLength(191)
        //        .HasColumnName("email");
        //    entity.Property(e => e.EmergencyContactAddress)
        //        .HasMaxLength(191)
        //        .HasColumnName("emergencyContactAddress");
        //    entity.Property(e => e.EmergencyContactName)
        //        .HasMaxLength(191)
        //        .HasColumnName("emergencyContactName");
        //    entity.Property(e => e.EmergencyContactNumber)
        //        .HasMaxLength(191)
        //        .HasColumnName("emergencyContactNumber");
        //    entity.Property(e => e.EmergencyContactRelationship)
        //        .HasMaxLength(191)
        //        .HasColumnName("emergencyContactRelationship");
        //    entity.Property(e => e.EndDate)
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("endDate");
        //    entity.Property(e => e.EndReason)
        //        .HasColumnType("text")
        //        .HasColumnName("endReason");
        //    entity.Property(e => e.FirstName)
        //        .HasMaxLength(191)
        //        .HasColumnName("firstName");
        //    entity.Property(e => e.FrequencyInDays).HasColumnName("frequencyInDays");
        //    entity.Property(e => e.FullName)
        //        .HasMaxLength(191)
        //        .HasColumnName("fullName");
        //    entity.Property(e => e.HasApprovedToPublishPhotos).HasColumnName("hasApprovedToPublishPhotos");
        //    entity.Property(e => e.LastName)
        //        .HasMaxLength(191)
        //        .HasColumnName("lastName");
        //    entity.Property(e => e.Mobile)
        //        .HasMaxLength(191)
        //        .HasColumnName("mobile");
        //    entity.Property(e => e.NextOfKinAddress)
        //        .HasMaxLength(191)
        //        .HasColumnName("nextOfKinAddress");
        //    entity.Property(e => e.NextOfKinName)
        //        .HasMaxLength(191)
        //        .HasColumnName("nextOfKinName");
        //    entity.Property(e => e.NextOfKinNumber)
        //        .HasMaxLength(191)
        //        .HasColumnName("nextOfKinNumber");
        //    entity.Property(e => e.NextOfKinRelationship)
        //        .HasMaxLength(191)
        //        .HasColumnName("nextOfKinRelationship");
        //    entity.Property(e => e.PreferredName)
        //        .HasMaxLength(191)
        //        .HasColumnName("preferredName");
        //    entity.Property(e => e.ProfilePicturePath)
        //        .HasMaxLength(191)
        //        .HasColumnName("profilePicturePath");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("updatedAt");
        //    entity.Property(e => e.VolunteerAgreementSignedOn)
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("volunteerAgreementSignedOn");

        //    entity.HasOne(d => d.Chapter).WithMany(p => p.Mentors)
        //        .HasForeignKey(d => d.ChapterId)
        //        .OnDelete(DeleteBehavior.Restrict)
        //        .HasConstraintName("Mentor_chapterId_fkey");
        //});

        

        //modelBuilder.Entity<MentorSession>(entity =>
        //{
        //    entity.HasKey(e => e.Id).HasName("PRIMARY");

        //    entity.ToTable("mentorsession");

        //    entity.HasIndex(e => new { e.ChapterId, e.MentorId, e.AttendedOn }, "MentorSession_chapterId_mentorId_attendedOn_key").IsUnique();

        //    entity.HasIndex(e => e.MentorId, "MentorSession_mentorId_fkey");

        //    entity.Property(e => e.Id).HasColumnName("id");
        //    entity.Property(e => e.AttendedOn)
        //        .HasColumnType("date")
        //        .HasColumnName("attendedOn");
        //    entity.Property(e => e.ChapterId).HasColumnName("chapterId");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("createdAt");
        //    entity.Property(e => e.MentorId).HasColumnName("mentorId");
        //    entity.Property(e => e.Status)
        //        .HasDefaultValueSql("'AVAILABLE'")
        //        .HasColumnType("enum('AVAILABLE','UNAVAILABLE')")
        //        .HasColumnName("status");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasColumnType("datetime(3)")
        //        .HasColumnName("updatedAt");

        //    entity.HasOne(d => d.Chapter).WithMany(p => p.Mentorsessions)
        //        .HasForeignKey(d => d.ChapterId)
        //        .OnDelete(DeleteBehavior.Restrict)
        //        .HasConstraintName("MentorSession_chapterId_fkey");

        //    entity.HasOne(d => d.Mentor).WithMany(p => p.Mentorsessions)
        //        .HasForeignKey(d => d.MentorId)
        //        .OnDelete(DeleteBehavior.Restrict)
        //        .HasConstraintName("MentorSession_mentorId_fkey");
        //});

        

        modelBuilder.Entity<MentorToStudentAssignement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("mentortostudentassignement");

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

            entity.HasOne(d => d.Mentor).WithMany(p => p.Mentortostudentassignements)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("MentorToStudentAssignement_mentorId_fkey");

            entity.HasOne(d => d.Student).WithMany(p => p.Mentortostudentassignements)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("MentorToStudentAssignement_studentId_fkey");
        });

        

        modelBuilder.Entity<SchoolTerm>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("schoolterm");

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
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("session");

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

            entity.HasOne(d => d.CancelledReason).WithOne(p => p.Session)
                .HasForeignKey<Session>(d => d.CancelledReasonId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Session_cancelledReasonId_fkey");

            entity.HasOne(d => d.Chapter).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("Session_chapterId_fkey");

            entity.HasOne(d => d.MentorSession).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.MentorSessionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("Session_mentorSessionId_fkey");

            entity.HasOne(d => d.StudentSession).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.StudentSessionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("Session_studentSessionId_fkey");
        });

        modelBuilder.Entity<SessionCancelledReason>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("sessioncancelledreason");

            entity.HasIndex(e => e.Reason, "SessionCancelledReason_reason_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Reason)
                .HasMaxLength(191)
                .HasColumnName("reason");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("student");

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

            entity.HasOne(d => d.Chapter).WithMany(p => p.Students)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("Student_chapterId_fkey");

            entity.HasOne(d => d.EoiStudentProfile).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.EoiStudentProfileId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Student_eoiStudentProfileId_fkey");
        });

        

        modelBuilder.Entity<StudentSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("studentsession");

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

            entity.HasOne(d => d.Chapter).WithMany(p => p.Studentsessions)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("StudentSession_chapterId_fkey");

            entity.HasOne(d => d.Student).WithMany(p => p.Studentsessions)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("StudentSession_studentId_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
