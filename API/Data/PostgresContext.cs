using System;
using System.Collections.Generic;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public partial class PostgresContext : DbContext
{
    public PostgresContext()
    {
    }

    public PostgresContext(DbContextOptions<PostgresContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Academician> Academicians { get; set; }

    public virtual DbSet<DocumentType> DocumentTypes { get; set; }

    public virtual DbSet<Scholar> Scholars { get; set; }

    public virtual DbSet<SystemConstant> SystemConstants { get; set; }

    public virtual DbSet<Term> Terms { get; set; }

    public virtual DbSet<TermDocumentType> TermDocumentTypes { get; set; }

    public virtual DbSet<TermsOfScholar> TermsOfScholars { get; set; }

    public virtual DbSet<TermsOfScholarsDocument> TermsOfScholarsDocuments { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql("Name=SupabaseConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<Academician>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ACADEMICIAN_pkey");

            entity.ToTable("ACADEMICIAN");

            entity.Property(e => e.Deleted)
                .HasDefaultValue(false)
                .HasColumnName("DELETED");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("EMAIL");
            entity.Property(e => e.NameSurname)
                .HasMaxLength(100)
                .HasColumnName("NAME_SURNAME");
        });

        modelBuilder.Entity<DocumentType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("DOCUMENT_TYPE_pkey");

            entity.ToTable("DOCUMENT_TYPE");

            entity.Property(e => e.Deleted)
                .HasDefaultValue(false)
                .HasColumnName("DELETED");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("NAME");
            entity.Property(e => e.UploadFrequency).HasColumnName("UPLOAD_FREQUENCY");
        });

        modelBuilder.Entity<Scholar>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("SCHOLAR_pkey");

            entity.ToTable("SCHOLAR");

            entity.HasIndex(e => e.Id, "SCHOLAR_Id_key").IsUnique();

            entity.Property(e => e.Deleted)
                .HasDefaultValue(false)
                .HasColumnName("DELETED");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("EMAIL");
            entity.Property(e => e.NameSurname)
                .HasMaxLength(100)
                .HasColumnName("NAME_SURNAME");
        });

        modelBuilder.Entity<SystemConstant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("SYSTEM_CONSTANTS_pkey");

            entity.ToTable("SYSTEM_CONSTANTS");

            entity.Property(e => e.ConstantName)
                .HasMaxLength(100)
                .HasColumnName("CONSTANT_NAME");
            entity.Property(e => e.ValueText)
                .HasMaxLength(100)
                .HasColumnName("VALUE_TEXT");
        });

        modelBuilder.Entity<Term>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TERM_pkey");

            entity.ToTable("TERM");

            entity.HasIndex(e => e.Id, "TERM_Id_key").IsUnique();

            entity.Property(e => e.Deleted)
                .HasDefaultValue(false)
                .HasColumnName("DELETED");
            entity.Property(e => e.EndDate).HasColumnName("END_DATE");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("NAME");
            entity.Property(e => e.ResponsibleAcademician).HasColumnName("RESPONSIBLE_ACADEMICIAN");
            entity.Property(e => e.StartDate).HasColumnName("START_DATE");

            entity.HasOne(d => d.ResponsibleAcademicianNavigation).WithMany(p => p.Terms)
                .HasForeignKey(d => d.ResponsibleAcademician)
                .HasConstraintName("TERM_RESPONSIBLE_ACADEMICIAN_fkey");
        });

        modelBuilder.Entity<TermDocumentType>(entity =>
        {
            entity.HasKey(e => new { e.TermId, e.DocumentTypeId }).HasName("TERM_DOCUMENT_TYPE_pkey");

            entity.ToTable("TERM_DOCUMENT_TYPE");

            entity.Property(e => e.TermId).HasColumnName("TERM_Id");
            entity.Property(e => e.DocumentTypeId).HasColumnName("DOCUMENT_TYPE_Id");
            entity.Property(e => e.ListType)
                .HasColumnType("character varying")
                .HasColumnName("LIST_TYPE");

            entity.HasOne(d => d.DocumentType).WithMany(p => p.TermDocumentTypes)
                .HasForeignKey(d => d.DocumentTypeId)
                .HasConstraintName("TERM_DOCUMENT_TYPE_DOCUMENT_TYPE_Id_fkey");

            entity.HasOne(d => d.Term).WithMany(p => p.TermDocumentTypes)
                .HasForeignKey(d => d.TermId)
                .HasConstraintName("TERM_DOCUMENT_TYPE_TERM_Id_fkey");
        });

        modelBuilder.Entity<TermsOfScholar>(entity =>
        {
            entity.HasKey(e => new { e.ScholarId, e.TermId }).HasName("TERMS_OF_SCHOLAR_pkey");

            entity.ToTable("TERMS_OF_SCHOLAR");

            entity.Property(e => e.ScholarId).HasColumnName("SCHOLAR_Id");
            entity.Property(e => e.TermId).HasColumnName("TERM_Id");
            entity.Property(e => e.Deleted)
                .HasDefaultValue(false)
                .HasColumnName("DELETED");
            entity.Property(e => e.EndDate).HasColumnName("END_DATE");
            entity.Property(e => e.StartDate).HasColumnName("START_DATE");

            entity.HasOne(d => d.Scholar).WithMany(p => p.TermsOfScholars)
                .HasForeignKey(d => d.ScholarId)
                .HasConstraintName("TERMS_OF_SCHOLAR_SCHOLAR_Id_fkey");

            entity.HasOne(d => d.Term).WithMany(p => p.TermsOfScholars)
                .HasForeignKey(d => d.TermId)
                .HasConstraintName("TERMS_OF_SCHOLAR_TERM_Id_fkey");
        });

        modelBuilder.Entity<TermsOfScholarsDocument>(entity =>
        {
            entity.HasKey(e => new { e.ScholarId, e.TermId, e.DocumentTypeId, e.ListType }).HasName("TERMS_OF_SCHOLARS_DOCUMENT_pkey");

            entity.ToTable("TERMS_OF_SCHOLARS_DOCUMENT");

            entity.Property(e => e.ScholarId).HasColumnName("SCHOLAR_Id");
            entity.Property(e => e.TermId).HasColumnName("TERM_Id");
            entity.Property(e => e.DocumentTypeId).HasColumnName("DOCUMENT_TYPE_Id");
            entity.Property(e => e.ListType)
                .HasColumnType("character varying")
                .HasColumnName("LIST_TYPE");
            entity.Property(e => e.Deleted)
                .HasDefaultValue(false)
                .HasColumnName("DELETED");
            entity.Property(e => e.ExpectedUploadDate).HasColumnName("EXPECTED_UPLOAD_DATE");
            entity.Property(e => e.RealUploadDate).HasColumnName("REAL_UPLOAD_DATE");

            entity.HasOne(d => d.DocumentType).WithMany(p => p.TermsOfScholarsDocuments)
                .HasForeignKey(d => d.DocumentTypeId)
                .HasConstraintName("TERMS_OF_SCHOLARS_DOCUMENT_DOCUMENT_TYPE_Id_fkey");

            entity.HasOne(d => d.Scholar).WithMany(p => p.TermsOfScholarsDocuments)
                .HasForeignKey(d => d.ScholarId)
                .HasConstraintName("TERMS_OF_SCHOLARS_DOCUMENT_SCHOLAR_Id_fkey");

            entity.HasOne(d => d.Term).WithMany(p => p.TermsOfScholarsDocuments)
                .HasForeignKey(d => d.TermId)
                .HasConstraintName("TERMS_OF_SCHOLARS_DOCUMENT_TERM_Id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("USER_pkey");

            entity.ToTable("USER");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Address).HasColumnName("ADDRESS");
            entity.Property(e => e.BillingNumber)
                .HasMaxLength(255)
                .HasColumnName("BILLING_NUMBER");
            entity.Property(e => e.CreDate).HasColumnName("CRE_DATE");
            entity.Property(e => e.CreUser).HasColumnName("CRE_USER");
            entity.Property(e => e.DelDate).HasColumnName("DEL_DATE");
            entity.Property(e => e.DelUser).HasColumnName("DEL_USER");
            entity.Property(e => e.Deleted).HasColumnName("DELETED");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .HasColumnName("EMAIL");
            entity.Property(e => e.FirmId).HasColumnName("FIRM_ID");
            entity.Property(e => e.FirmName)
                .HasMaxLength(255)
                .HasColumnName("FIRM_NAME");
            entity.Property(e => e.Language)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("LANGUAGE");
            entity.Property(e => e.NameSurname)
                .HasMaxLength(50)
                .HasColumnName("NAME_SURNAME");
            entity.Property(e => e.Password).HasColumnName("PASSWORD");
            entity.Property(e => e.PasswordSalt).HasColumnName("PASSWORD_SALT");
            entity.Property(e => e.Phone)
                .HasMaxLength(50)
                .HasColumnName("PHONE");
            entity.Property(e => e.TaxOfficeName)
                .HasMaxLength(255)
                .HasColumnName("TAX_OFFICE_NAME");
            entity.Property(e => e.UpdDate).HasColumnName("UPD_DATE");
            entity.Property(e => e.UpdUser).HasColumnName("UPD_USER");
            entity.Property(e => e.UserType)
                .HasMaxLength(255)
                .HasColumnName("USER_TYPE");
            entity.Property(e => e.Username)
                .HasMaxLength(255)
                .HasColumnName("USERNAME");
        });
        modelBuilder.HasSequence<int>("seq_schema_version", "graphql").IsCyclic();

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
