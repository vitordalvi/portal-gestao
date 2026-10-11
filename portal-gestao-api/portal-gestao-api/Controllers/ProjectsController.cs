using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using portal_gestao_api.Infrastructure.Data;

namespace portal_gestao_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista os projetos calculando a saúde física e saldo em tempo real.
    /// Requisito 1 da Parte 2 do Case Técnico PVT.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        // Usamos Eager Loading para calcular as regras de domínio na memória
        var projects = await _context.Projects
            .Include(p => p.Milestones)
            .Include(p => p.Allocations)
                .ThenInclude(a => a.TimeEntries)
            .ToListAsync();

        var result = projects.Select(p => new
        {
            p.Id,
            p.Name,
            SoldHours = p.SoldHours,
            ConsumedHours = p.GetConsumedHours(),
            HourBalance = p.GetHourBalance(),
            PhysicalProgressPercentage = p.GetPhysicalProgress(),
            HealthStatus = p.GetHealthStatus(),
            FinancialMargin = p.GetFinancialMargin() // RBAC seria checado aqui num cenário real
        });

        return Ok(result);
    }
}
