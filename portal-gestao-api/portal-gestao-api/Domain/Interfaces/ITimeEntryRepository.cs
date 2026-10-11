using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Domain.Interfaces;

public interface ITimeEntryRepository
{
    Task<Allocation?> GetAllocationByProjectAndUserAsync(Guid projectId, Guid userId);
    Task<Allocation?> GetFirstAllocationByProjectAsync(Guid projectId);
    Task AddAsync(TimeEntry timeEntry);
    Task SaveChangesAsync();
}
