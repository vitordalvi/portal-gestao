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
            FinancialMargin = p.GetFinancialMargin(),
            AllocatedUserIds = p.Allocations.Select(a => a.UserId).ToList()
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
            ConsumedHours = p.GetConsumedHours(),
            HourBalance = p.GetHourBalance(),
            PhysicalProgressPercentage = p.GetPhysicalProgress(),
            HealthStatus = p.GetHealthStatus(),
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

    public async Task<object?> ToggleMilestoneAsync(Guid projectId, Guid milestoneId)
    {
        var milestone = await _projectRepository.GetMilestoneByIdAsync(milestoneId);
        if (milestone == null || milestone.ProjectId != projectId)
            return null;

        milestone.IsCompleted = !milestone.IsCompleted;
        await _projectRepository.UpdateMilestoneAsync(milestone);

        return milestone;
    }
}
