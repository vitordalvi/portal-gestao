using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Domain.Entities;
using portal_gestao_api.Infrastructure.Data;
using portal_gestao_api.Application.DTOs;

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
    /// Lança horas trabalhadas (TimeEntry) para um usuário em um projeto específico.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTimeEntry([FromBody] CreateTimeEntryDto request)
    {   
        if (request.Hours <= 0)
        {
            return BadRequest("As horas apontadas devem ser maiores que zero.");
        }

        // O apontamento de horas é feito na interface em cima do "Projeto", 
        // mas no banco de dados amarramos à "Alocação". 
        // Para a demonstração (já que os GUIDs do Seed mudam toda hora), vamos pegar a 1ª alocação deste projeto.
        var allocation = await _context.Allocations
            .FirstOrDefaultAsync(a => a.ProjectId == request.ProjectId);

        if (allocation == null)
        {
            return NotFound("Usuário não está alocado neste projeto.");
        }

        var timeEntry = new TimeEntry
        {
            Id = Guid.NewGuid(),
            AllocationId = allocation.Id,
            Date = request.Date,
            Hours = request.Hours,
            Description = request.Description
        };

        _context.TimeEntries.Add(timeEntry);
        await _context.SaveChangesAsync();

        return Created($"/api/time-entries/{timeEntry.Id}", timeEntry);
    }
}
