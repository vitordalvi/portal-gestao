using Microsoft.AspNetCore.Mvc;
using portal_gestao_api.Application.DTOs;
using portal_gestao_api.Application.Services;

namespace portal_gestao_api.Controllers;

[ApiController]
[Route("api/time-entries")]
public class TimeEntriesController : ControllerBase
{
    private readonly ITimeEntryService _timeEntryService;

    public TimeEntriesController(ITimeEntryService timeEntryService)
    {
        _timeEntryService = timeEntryService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTimeEntry([FromBody] CreateTimeEntryDto request)
    {   
        var result = await _timeEntryService.CreateTimeEntryAsync(request);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Created($"/api/time-entries/{result.TimeEntry?.Id}", new
        {
            id = result.TimeEntry?.Id,
            allocationId = result.TimeEntry?.AllocationId,
            date = result.TimeEntry?.Date,
            hours = result.TimeEntry?.Hours,
            description = result.TimeEntry?.Description
        });
    }
}
