using portal_gestao_api.Application.DTOs;

namespace portal_gestao_api.Application.Services;

public interface IProjectService
{
    Task<object> GetAllProjectsAsync();
    Task<object?> GetProjectByIdAsync(Guid id);
    Task<object> CreateProjectAsync(CreateProjectDto request);
    Task<object> AllocateUserAsync(Guid projectId, CreateAllocationDto request);
    Task<object> AddMilestoneAsync(Guid projectId, CreateMilestoneDto request);
    Task<object?> ToggleMilestoneAsync(Guid projectId, Guid milestoneId);
}
