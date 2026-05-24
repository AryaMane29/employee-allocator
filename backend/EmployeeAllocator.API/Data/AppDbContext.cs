using Microsoft.EntityFrameworkCore;
using EmployeeAllocator.API.Models;

namespace EmployeeAllocator.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectAllocation> ProjectAllocations => Set<ProjectAllocation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>()
            .Property(e => e.Rating)
            .HasPrecision(3, 1);

        modelBuilder.Entity<ProjectAllocation>()
            .HasIndex(pa => new { pa.ProjectId, pa.EmployeeId })
            .IsUnique();

        modelBuilder.Entity<Admin>().HasData(new Admin
        {
            Id = 1,
            Username = "admin",
            Email = "admin@allocator.com",
            PasswordHash = "$2a$11$9e8V9sGvKkMfQv6BB7.OneC24paeplFa6NvzoJMRMvpTGELMaIO9K",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}