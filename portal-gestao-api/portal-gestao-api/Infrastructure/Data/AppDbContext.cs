using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Allocation> Allocations => Set<Allocation>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<Milestone> Milestones => Set<Milestone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Precision configurations
        modelBuilder.Entity<Project>().Property(p => p.TotalValue).HasPrecision(18, 2);
        modelBuilder.Entity<Allocation>().Property(a => a.HourlyCost).HasPrecision(18, 2);
        modelBuilder.Entity<TimeEntry>().Property(t => t.Hours).HasPrecision(18, 2);

        // Relationships
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Client)
            .WithMany(c => c.Projects)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Allocation>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed Deterministic Data - Mock TOTVS ERP
        var clientValeId = Guid.Parse("aaaaaaaa-1111-1111-1111-111111111111");
        var clientAmbevId = Guid.Parse("aaaaaaaa-2222-2222-2222-222222222222");
        var clientNaturaId = Guid.Parse("aaaaaaaa-3333-3333-3333-333333333333");

        modelBuilder.Entity<Client>().HasData(
            new Client
            {
                Id = clientValeId,
                Name = "Vale do Rio Doce S.A.",
                Cnpj = "33.592.510/0001-54",
                Segment = "Mineração & Siderurgia"
            },
            new Client
            {
                Id = clientAmbevId,
                Name = "Ambev S.A.",
                Cnpj = "56.228.356/0001-65",
                Segment = "Bebidas & Consumo"
            },
            new Client
            {
                Id = clientNaturaId,
                Name = "Natura Cosméticos",
                Cnpj = "71.673.990/0001-77",
                Segment = "Varejo & Cosméticos"
            }
        );

        // Users & Roles (Simulação TOTVS Team & RBAC)
        var userDirectorId = Guid.Parse("bbbbbbbb-1111-1111-1111-111111111111");
        var userManagerId = Guid.Parse("bbbbbbbb-2222-2222-2222-222222222222");
        var userLucasId = Guid.Parse("bbbbbbbb-3333-3333-3333-333333333333");
        var userBeatrizId = Guid.Parse("bbbbbbbb-4444-4444-4444-444444444444");
        var userRodrigoId = Guid.Parse("bbbbbbbb-5555-5555-5555-555555555555");

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = userDirectorId,
                Name = "Carlos Silva (Diretor)",
                Email = "carlos.silva@empresa.com",
                Role = UserRole.Director
            },
            new User
            {
                Id = userManagerId,
                Name = "Mariana Costa (Gerente de Projetos)",
                Email = "mariana.costa@empresa.com",
                Role = UserRole.ProjectManager
            },
            new User
            {
                Id = userLucasId,
                Name = "Lucas Mendes (Consultor Protheus Sênior)",
                Email = "lucas.mendes@empresa.com",
                Role = UserRole.Analyst
            },
            new User
            {
                Id = userBeatrizId,
                Name = "Beatriz Ferreira (Dev ADVPL / React)",
                Email = "beatriz.ferreira@empresa.com",
                Role = UserRole.Analyst
            },
            new User
            {
                Id = userRodrigoId,
                Name = "Rodrigo Alencar (Consultor Fiscal)",
                Email = "rodrigo.alencar@empresa.com",
                Role = UserRole.Analyst
            }
        );

        // Projects
        var proj1Id = Guid.Parse("cccccccc-1111-1111-1111-111111111111");
        var proj2Id = Guid.Parse("cccccccc-2222-2222-2222-222222222222");
        var proj3Id = Guid.Parse("cccccccc-3333-3333-3333-333333333333");

        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = proj1Id,
                ClientId = clientValeId,
                Name = "Implantação ERP Protheus V12",
                SoldHours = 160,
                PlannedHours = 160,
                TotalValue = 96000m,
                StartDate = DateTime.UtcNow.AddMonths(-2),
                EndDate = DateTime.UtcNow.AddMonths(2),
                Status = "Active",
                ErpId = "TOTVS-PRJ-001",
                LastSyncDate = DateTime.UtcNow.AddMinutes(-14),
                SyncStatus = "Sincronizado"
            },
            new Project
            {
                Id = proj2Id,
                ClientId = clientAmbevId,
                Name = "Migração Cloud & TOTVS Fluig",
                SoldHours = 80,
                PlannedHours = 80,
                TotalValue = 48000m,
                StartDate = DateTime.UtcNow.AddMonths(-1),
                EndDate = DateTime.UtcNow.AddMonths(1),
                Status = "Active",
                ErpId = "TOTVS-PRJ-002",
                LastSyncDate = DateTime.UtcNow.AddHours(-1).AddMinutes(-25),
                SyncStatus = "Sincronizado"
            },
            new Project
            {
                Id = proj3Id,
                ClientId = clientNaturaId,
                Name = "Otimização Fiscal & REINF TOTVS",
                SoldHours = 50,
                PlannedHours = 50,
                TotalValue = 32000m,
                StartDate = DateTime.UtcNow.AddMonths(-2),
                EndDate = DateTime.UtcNow.AddDays(-5),
                Status = "Active",
                ErpId = "TOTVS-PRJ-003",
                LastSyncDate = DateTime.UtcNow.AddHours(-3).AddMinutes(-10),
                SyncStatus = "Sincronizado"
            }
        );

        // Milestones
        modelBuilder.Entity<Milestone>().HasData(
            // Proj 1 (Total Weight 100, Concluído: 70%)
            new Milestone { Id = Guid.Parse("dddddddd-1111-1111-1111-111111111111"), ProjectId = proj1Id, Name = "Levantamento e Blueprint", Weight = 30, IsCompleted = true },
            new Milestone { Id = Guid.Parse("dddddddd-1111-1111-1111-111111111112"), ProjectId = proj1Id, Name = "Parametrizações Core MATA010/020", Weight = 40, IsCompleted = true },
            new Milestone { Id = Guid.Parse("dddddddd-1111-1111-1111-111111111113"), ProjectId = proj1Id, Name = "Go-Live & Suporte Assistido", Weight = 30, IsCompleted = false },
            
            // Proj 2 (Total Weight 100, Concluído: 40%)
            new Milestone { Id = Guid.Parse("dddddddd-2222-2222-2222-222222222221"), ProjectId = proj2Id, Name = "Arquitetura Cloud & Instalação", Weight = 40, IsCompleted = true },
            new Milestone { Id = Guid.Parse("dddddddd-2222-2222-2222-222222222222"), ProjectId = proj2Id, Name = "Workflows de Aprovação Fluig", Weight = 60, IsCompleted = false },

            // Proj 3 (Total Weight 100, Concluído: 50%)
            new Milestone { Id = Guid.Parse("dddddddd-3333-3333-3333-333333333331"), ProjectId = proj3Id, Name = "Diagnóstico de Obrigações Fiscais", Weight = 50, IsCompleted = true },
            new Milestone { Id = Guid.Parse("dddddddd-3333-3333-3333-333333333332"), ProjectId = proj3Id, Name = "Transmissão TSS / REINF", Weight = 50, IsCompleted = false }
        );

        // Allocations
        var alloc1Id = Guid.Parse("eeeeeeee-1111-1111-1111-111111111111");
        var alloc2Id = Guid.Parse("eeeeeeee-1111-1111-1111-111111111112");
        var alloc3Id = Guid.Parse("eeeeeeee-2222-2222-2222-222222222221");
        var alloc4Id = Guid.Parse("eeeeeeee-2222-2222-2222-222222222222");
        var alloc5Id = Guid.Parse("eeeeeeee-3333-3333-3333-333333333331");

        modelBuilder.Entity<Allocation>().HasData(
            // Proj 1
            new Allocation { Id = alloc1Id, ProjectId = proj1Id, UserId = userLucasId, AllocatedHours = 100, HourlyCost = 180m, StartDate = DateTime.UtcNow.AddMonths(-2), EndDate = DateTime.UtcNow.AddMonths(2) },
            new Allocation { Id = alloc2Id, ProjectId = proj1Id, UserId = userBeatrizId, AllocatedHours = 60, HourlyCost = 150m, StartDate = DateTime.UtcNow.AddMonths(-2), EndDate = DateTime.UtcNow.AddMonths(2) },
            
            // Proj 2
            new Allocation { Id = alloc3Id, ProjectId = proj2Id, UserId = userBeatrizId, AllocatedHours = 50, HourlyCost = 150m, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(1) },
            new Allocation { Id = alloc4Id, ProjectId = proj2Id, UserId = userRodrigoId, AllocatedHours = 30, HourlyCost = 130m, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(1) },

            // Proj 3
            new Allocation { Id = alloc5Id, ProjectId = proj3Id, UserId = userLucasId, AllocatedHours = 50, HourlyCost = 180m, StartDate = DateTime.UtcNow.AddMonths(-2), EndDate = DateTime.UtcNow.AddDays(-5) }
        );

        // Time Entries
        modelBuilder.Entity<TimeEntry>().HasData(
            // Proj 1: Lucas (45h) + Beatriz (25h) = 70h (Sold: 160h) -> Saudável
            new TimeEntry { Id = Guid.Parse("ffffffff-1111-1111-1111-111111111111"), AllocationId = alloc1Id, Date = DateTime.UtcNow.AddDays(-10), Hours = 25m, Description = "Parametrização MATA010 e testes integrados" },
            new TimeEntry { Id = Guid.Parse("ffffffff-1111-1111-1111-111111111112"), AllocationId = alloc1Id, Date = DateTime.UtcNow.AddDays(-5), Hours = 20m, Description = "Ajustes de regras tributárias no configurador" },
            new TimeEntry { Id = Guid.Parse("ffffffff-1111-1111-1111-111111111113"), AllocationId = alloc2Id, Date = DateTime.UtcNow.AddDays(-3), Hours = 25m, Description = "Desenvolvimento de APIs REST ADVPL para e-Commerce" },

            // Proj 2: Beatriz (48h) + Rodrigo (20h) = 68h (Sold: 80h -> 85% consumido vs 40% físico) -> Atenção!
            new TimeEntry { Id = Guid.Parse("ffffffff-2222-2222-2222-222222222221"), AllocationId = alloc3Id, Date = DateTime.UtcNow.AddDays(-8), Hours = 28m, Description = "Construção de formulários e schemas Fluig" },
            new TimeEntry { Id = Guid.Parse("ffffffff-2222-2222-2222-222222222222"), AllocationId = alloc3Id, Date = DateTime.UtcNow.AddDays(-4), Hours = 20m, Description = "Configuração do Identity Provider e SSO" },
            new TimeEntry { Id = Guid.Parse("ffffffff-2222-2222-2222-222222222223"), AllocationId = alloc4Id, Date = DateTime.UtcNow.AddDays(-2), Hours = 20m, Description = "Validação de permissões e segurança" },

            // Proj 3: Lucas (55h) (Sold: 50h, EndDate no passado) -> Crítico!
            new TimeEntry { Id = Guid.Parse("ffffffff-3333-3333-3333-333333333331"), AllocationId = alloc5Id, Date = DateTime.UtcNow.AddDays(-12), Hours = 30m, Description = "Análise de inconsistências e layouts SPED" },
            new TimeEntry { Id = Guid.Parse("ffffffff-3333-3333-3333-333333333332"), AllocationId = alloc5Id, Date = DateTime.UtcNow.AddDays(-6), Hours = 25m, Description = "Tentativa de envio dos lotes ao TSS" }
        );
    }
}
