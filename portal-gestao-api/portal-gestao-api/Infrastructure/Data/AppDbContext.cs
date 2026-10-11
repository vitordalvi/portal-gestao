using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Allocation> Allocations => Set<Allocation>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<Milestone> Milestones => Set<Milestone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // EF Core configurações de precisão para decimais
        modelBuilder.Entity<Project>().Property(p => p.TotalValue).HasPrecision(18, 2);
        modelBuilder.Entity<Allocation>().Property(a => a.HourlyCost).HasPrecision(18, 2);
        modelBuilder.Entity<TimeEntry>().Property(t => t.Hours).HasPrecision(18, 2);
        
        // Seed Mock Data - Como pedido na Parte 2 do Case PDF
        var projectId = Guid.NewGuid();
        var allocationId = Guid.NewGuid();
        
        modelBuilder.Entity<Project>().HasData(new Project
        {
            Id = projectId,
            ClientId = Guid.NewGuid(),
            Name = "Projeto PVT WebApp",
            SoldHours = 100, // 100 horas vendidas
            PlannedHours = 100,
            TotalValue = 50000m, // Margem bruta
            StartDate = DateTime.UtcNow.AddMonths(-1),
            EndDate = DateTime.UtcNow.AddMonths(2)
        });

        modelBuilder.Entity<Milestone>().HasData(
            new Milestone { Id = Guid.NewGuid(), ProjectId = projectId, Name = "Design UI", Weight = 50, IsCompleted = true },
            new Milestone { Id = Guid.NewGuid(), ProjectId = projectId, Name = "Backend API", Weight = 50, IsCompleted = false }
        );

        modelBuilder.Entity<Allocation>().HasData(new Allocation
        {
            Id = allocationId,
            ProjectId = projectId,
            UserId = Guid.NewGuid(), // Mock Analista
            AllocatedHours = 80,
            HourlyCost = 150m,
            StartDate = DateTime.UtcNow.AddMonths(-1),
            EndDate = DateTime.UtcNow.AddMonths(2)
        });

        // Simulando apontamentos (40 horas apontadas no total)
        modelBuilder.Entity<TimeEntry>().HasData(
            new TimeEntry { Id = Guid.NewGuid(), AllocationId = allocationId, Date = DateTime.UtcNow.AddDays(-2), Hours = 10m, Description = "Design System" },
            new TimeEntry { Id = Guid.NewGuid(), AllocationId = allocationId, Date = DateTime.UtcNow.AddDays(-1), Hours = 30m, Description = "Telas React" }
        );
    }
}
