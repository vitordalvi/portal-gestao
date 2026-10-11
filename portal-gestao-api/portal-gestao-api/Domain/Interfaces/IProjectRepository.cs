using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Domain.Interfaces;

public interface IProjectRepository
{
    Task<IEnumerable<Project>> GetAllWithDetailsAsync();
    Task<Project?> GetByIdWithDetailsAsync(Guid id);
    Task AddAsync(Project project);
    Task AddAllocationAsync(Allocation allocation);
    Task AddMilestoneAsync(Milestone milestone);
    Task<Milestone?> GetMilestoneByIdAsync(Guid milestoneId);
    Task UpdateMilestoneAsync(Milestone milestone);
}
