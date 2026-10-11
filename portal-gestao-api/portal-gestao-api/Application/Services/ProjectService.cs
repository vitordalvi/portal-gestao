using portal_gestao_api.Application.DTOs;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Domain.Interfaces;

namespace portal_gestao_api.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task<object> GetAllProjectsAsync()
    {
        var projects = await _projectRepository.GetAllWithDetailsAsync();

        return projects.Select(p => new
        {
            p.Id,
            p.Name,
            ClientName = p.Client?.Name,
            SoldHours = p.SoldHours,
            ConsumedHours = p.GetConsumedHours(),
            HourBalance = p.GetHourBalance(),
            PhysicalProgressPercentage = p.GetPhysicalProgress(),
            HealthStatus = p.GetHealthStatus(),
            HealthReasons = p.GetHealthReasons(),
            FinancialMargin = p.GetFinancialMargin(),
            AllocatedUserIds = p.Allocations.Select(a => a.UserId).ToList(),
            p.ErpId,
            p.LastSyncDate,
            p.SyncStatus
        });
    }

    public async Task<object?> GetProjectByIdAsync(Guid id)
    {
        var p = await _projectRepository.GetByIdWithDetailsAsync(id);
        if (p == null) return null;

        return new
        {
            p.Id,
            p.Name,
            p.SoldHours,
            p.PlannedHours,
            p.TotalValue,
            p.StartDate,
            p.EndDate,
            p.Status,
            p.ErpId,
            p.LastSyncDate,
            p.SyncStatus,
            ConsumedHours = p.GetConsumedHours(),
            HourBalance = p.GetHourBalance(),
            PhysicalProgressPercentage = p.GetPhysicalProgress(),
            HealthStatus = p.GetHealthStatus(),
            HealthReasons = p.GetHealthReasons(),
            FinancialMargin = p.GetFinancialMargin(),
            RealizedCost = p.GetRealizedCost(),
            Client = p.Client == null ? null : new { p.Client.Id, p.Client.Name, p.Client.Cnpj, p.Client.Segment },
            Milestones = p.Milestones.Select(m => new { m.Id, m.Name, m.Weight, m.IsCompleted }),
            Allocations = p.Allocations.Select(a => new {
                a.Id,
                a.AllocatedHours,
                a.HourlyCost,
                a.StartDate,
                a.EndDate,
                ConsumedHours = a.TimeEntries.Sum(te => te.Hours),
                TotalCost = a.GetTotalCost(),
                User = a.User == null ? null : new { a.User.Id, a.User.Name, a.User.Role, a.User.Email }
            })
        };
    }

    public async Task<object> CreateProjectAsync(CreateProjectDto request)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ClientId = request.ClientId,
            SoldHours = request.SoldHours,
            PlannedHours = request.PlannedHours,
            TotalValue = request.TotalValue,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = "Active",
            ErpId = "N/A"
        };

        await _projectRepository.AddAsync(project);

        return await GetProjectByIdAsync(project.Id) ?? project;
    }

    public async Task<object> AllocateUserAsync(Guid projectId, CreateAllocationDto request)
    {
        var allocation = new Allocation
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = request.UserId,
            AllocatedHours = request.AllocatedHours,
            HourlyCost = request.HourlyCost,
            StartDate = request.StartDate ?? DateTime.UtcNow,
            EndDate = request.EndDate ?? DateTime.UtcNow.AddMonths(2)
        };

        await _projectRepository.AddAllocationAsync(allocation);

        return allocation;
    }

    /// <summary>
    /// Atualiza as horas alocadas, valor da hora e período de vigência de uma alocação.
    /// Como o cálculo de margem e custo realizado é dinâmico (Rich Domain Model),
    /// a atualização do HourlyCost reflete instantaneamente em GetFinancialMargin() e GetRealizedCost().
    /// </summary>
    public async Task<object?> UpdateAllocationAsync(Guid projectId, Guid allocationId, UpdateAllocationDto request)
    {
        var allocation = await _projectRepository.GetAllocationByIdAsync(allocationId);
        if (allocation == null || allocation.ProjectId != projectId)
            return null;

        allocation.AllocatedHours = request.AllocatedHours;
        allocation.HourlyCost = request.HourlyCost;
        if (request.StartDate.HasValue) allocation.StartDate = request.StartDate.Value;
        if (request.EndDate.HasValue) allocation.EndDate = request.EndDate.Value;

        await _projectRepository.UpdateAllocationAsync(allocation);
        return allocation;
    }

    /// <summary>
    /// Desaloca um analista do projeto.
    /// Regra de Integridade: Se o analista já possuir apontamentos de horas vinculados,
    /// a remoção é bloqueada para não corromper o histórico de custos realizados e auditoria contábil.
    /// </summary>
    public async Task<(bool Success, string? ErrorMessage)> DeleteAllocationAsync(Guid projectId, Guid allocationId)
    {
        var allocation = await _projectRepository.GetAllocationByIdAsync(allocationId);
        if (allocation == null || allocation.ProjectId != projectId)
            return (false, "Alocação ou projeto não encontrado.");

        // Bloqueio preventivo de exclusão para alocações com apontamentos ativos
        if (allocation.TimeEntries.Any())
        {
            return (false, $"Não é possível remover a alocação de {allocation.User?.Name ?? "analista"} pois já existem {allocation.TimeEntries.Sum(t => t.Hours)}h de apontamentos registradas.");
        }

        await _projectRepository.DeleteAllocationAsync(allocation);
        return (true, null);
    }

    /// <summary>
    /// Adiciona um novo marco de entrega com peso percentual ponderado.
    /// </summary>
    public async Task<object> AddMilestoneAsync(Guid projectId, CreateMilestoneDto request)
    {
        var milestone = new Milestone
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = request.Name,
            Weight = request.Weight,
            IsCompleted = false
        };

        await _projectRepository.AddMilestoneAsync(milestone);
        return milestone;
    }

    /// <summary>
    /// Atualiza o nome e o peso de um marco. O avanço físico do projeto é recalculado automaticamente.
    /// </summary>
    public async Task<object?> UpdateMilestoneAsync(Guid projectId, Guid milestoneId, UpdateMilestoneDto request)
    {
        var milestone = await _projectRepository.GetMilestoneByIdAsync(milestoneId);
        if (milestone == null || milestone.ProjectId != projectId)
            return null;

        milestone.Name = request.Name;
        milestone.Weight = request.Weight;
        await _projectRepository.UpdateMilestoneAsync(milestone);

        return milestone;
    }

    /// <summary>
    /// Remove um marco de entrega. A exclusão recalcula imediatamente o percentual de avanço físico ponderado.
    /// </summary>
    public async Task<bool> DeleteMilestoneAsync(Guid projectId, Guid milestoneId)
    {
        var milestone = await _projectRepository.GetMilestoneByIdAsync(milestoneId);
        if (milestone == null || milestone.ProjectId != projectId)
            return false;

        await _projectRepository.DeleteMilestoneAsync(milestone);
        return true;
    }

    /// <summary>
    /// Alterna a situação do marco entre concluído e pendente, atualizando o progresso e a saúde do projeto.
    /// </summary>
    public async Task<object?> ToggleMilestoneAsync(Guid projectId, Guid milestoneId)
    {
        var milestone = await _projectRepository.GetMilestoneByIdAsync(milestoneId);
        if (milestone == null || milestone.ProjectId != projectId)
            return null;

        milestone.IsCompleted = !milestone.IsCompleted;
        await _projectRepository.UpdateMilestoneAsync(milestone);

        return milestone;
    }

    /// <summary>
    /// Dispara a sincronização manual sob demanda com o ERP TOTVS RM / Protheus,
    /// atualizando a data e hora da última sincronização para agora e status 'Sincronizado'.
    /// </summary>
    public async Task<object?> SyncProjectWithErpAsync(Guid id)
    {
        var project = await _projectRepository.GetByIdWithDetailsAsync(id);
        if (project == null) return null;

        project.LastSyncDate = DateTime.UtcNow;
        project.SyncStatus = "Sincronizado";
        await _projectRepository.UpdateProjectAsync(project);

        return await GetProjectByIdAsync(id);
    }
}
