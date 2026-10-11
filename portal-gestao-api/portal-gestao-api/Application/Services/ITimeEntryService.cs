using portal_gestao_api.Application.DTOs;
using portal_gestao_api.Domain.Entities;

namespace portal_gestao_api.Application.Services;

public interface ITimeEntryService
{
    Task<(bool Success, string? ErrorMessage, TimeEntry? TimeEntry)> CreateTimeEntryAsync(CreateTimeEntryDto request);
}
