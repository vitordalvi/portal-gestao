using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Domain.Interfaces;
using portal_gestao_api.Infrastructure.Data;

namespace portal_gestao_api.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Project>> GetAllWithDetailsAsync()
    {
        return await _context.Projects
            .Include(p => p.Client)
            .Include(p => p.Milestones)
            .Include(p => p.Allocations)
                .ThenInclude(a => a.TimeEntries)
            .ToListAsync();
    }

    public async Task<Project?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Projects
            .Include(p => p.Client)
            .Include(p => p.Milestones)
            .Include(p => p.Allocations)
                .ThenInclude(a => a.User)
            .Include(p => p.Allocations)
                .ThenInclude(a => a.TimeEntries)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Project project)
    {
        await _context.Projects.AddAsync(project);
        await _context.SaveChangesAsync();
    }

    public async Task AddAllocationAsync(Allocation allocation)
    {
        await _context.Allocations.AddAsync(allocation);
        await _context.SaveChangesAsync();
    }

    public async Task<Allocation?> GetAllocationByIdAsync(Guid allocationId)
    {
        return await _context.Allocations
            .Include(a => a.TimeEntries)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == allocationId);
    }

    public async Task UpdateAllocationAsync(Allocation allocation)
    {
        _context.Allocations.Update(allocation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAllocationAsync(Allocation allocation)
    {
        _context.Allocations.Remove(allocation);
        await _context.SaveChangesAsync();
    }

    public async Task AddMilestoneAsync(Milestone milestone)
    {
        await _context.Milestones.AddAsync(milestone);
        await _context.SaveChangesAsync();
    }

    public async Task<Milestone?> GetMilestoneByIdAsync(Guid milestoneId)
    {
        return await _context.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId);
    }

    public async Task UpdateMilestoneAsync(Milestone milestone)
    {
        _context.Milestones.Update(milestone);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteMilestoneAsync(Milestone milestone)
    {
        _context.Milestones.Remove(milestone);
        await _context.SaveChangesAsync();
    }
}
