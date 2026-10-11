using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Domain.Interfaces;
using portal_gestao_api.Infrastructure.Data;

namespace portal_gestao_api.Infrastructure.Repositories;

public class TimeEntryRepository : ITimeEntryRepository
{
    private readonly AppDbContext _context;

    public TimeEntryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Allocation?> GetAllocationByProjectAndUserAsync(Guid projectId, Guid userId)
    {
        return await _context.Allocations
            .FirstOrDefaultAsync(a => a.ProjectId == projectId && a.UserId == userId);
    }

    public async Task<Allocation?> GetFirstAllocationByProjectAsync(Guid projectId)
    {
        return await _context.Allocations
            .FirstOrDefaultAsync(a => a.ProjectId == projectId);
    }

    public async Task AddAsync(TimeEntry timeEntry)
    {
        await _context.TimeEntries.AddAsync(timeEntry);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
