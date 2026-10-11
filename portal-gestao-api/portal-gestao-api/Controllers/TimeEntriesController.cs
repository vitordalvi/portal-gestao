using Microsoft.AspNetCore.Mvc;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Infrastructure.Data;

namespace portal_gestao_api.Controllers;

[ApiController]
[Route("api/time-entries")]
public class TimeEntriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TimeEntriesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Adiciona um novo apontamento de horas a uma alocação.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTimeEntry([FromBody] CreateTimeEntryRequest request)
    {
        if (request.Hours <= 0)
        {
            return BadRequest("As horas apontadas devem ser maiores que zero.");
        }

        var allocationExists = _context.Allocations.Any(a => a.Id == request.AllocationId);
        if (!allocationExists)
        {
            return NotFound("Alocação não encontrada.");
        }

        var timeEntry = new TimeEntry
        {
            Id = Guid.NewGuid(),
            AllocationId = request.AllocationId,
            Date = request.Date,
            Hours = request.Hours,
            Description = request.Description
        };

        _context.TimeEntries.Add(timeEntry);
        await _context.SaveChangesAsync();

        return Created($"/api/time-entries/{timeEntry.Id}", timeEntry);
    }
}

public class CreateTimeEntryRequest
{
    public Guid AllocationId { get; set; }
    public DateTime Date { get; set; }
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
}
