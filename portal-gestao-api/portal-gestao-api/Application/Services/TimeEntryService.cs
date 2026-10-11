using portal_gestao_api.Application.DTOs;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Domain.Interfaces;

namespace portal_gestao_api.Application.Services;

public class TimeEntryService : ITimeEntryService
{
    private readonly ITimeEntryRepository _timeEntryRepository;

    public TimeEntryService(ITimeEntryRepository timeEntryRepository)
    {
        _timeEntryRepository = timeEntryRepository;
    }

    public async Task<(bool Success, string? ErrorMessage, TimeEntry? TimeEntry)> CreateTimeEntryAsync(CreateTimeEntryDto request)
    {
        if (request.Hours <= 0)
        {
            return (false, "As horas apontadas devem ser maiores que zero.", null);
        }

        var allocation = await _timeEntryRepository.GetAllocationByProjectAndUserAsync(request.ProjectId, request.UserId);

        if (allocation == null)
        {
            // Fallback para projetos onde o UserId não foi especificado no frontend
            allocation = await _timeEntryRepository.GetFirstAllocationByProjectAsync(request.ProjectId);
        }

        if (allocation == null)
        {
            return (false, "Este projeto ainda não possui analistas alocados na equipe. Cadastre uma alocação antes de apontar horas.", null);
        }

        var timeEntry = new TimeEntry
        {
            Id = Guid.NewGuid(),
            AllocationId = allocation.Id,
            Date = request.Date,
            Hours = request.Hours,
            Description = request.Description
        };

        await _timeEntryRepository.AddAsync(timeEntry);
        await _timeEntryRepository.SaveChangesAsync();

        return (true, null, timeEntry);
    }
}
