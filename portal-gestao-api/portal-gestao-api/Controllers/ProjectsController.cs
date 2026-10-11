using Microsoft.AspNetCore.Mvc;
using portal_gestao_api.Application.DTOs;
using portal_gestao_api.Application.Services;

namespace portal_gestao_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var result = await _projectService.GetAllProjectsAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        var result = await _projectService.GetProjectByIdAsync(id);
        
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto request)
    {
        var result = await _projectService.CreateProjectAsync(request);
        // The service returns an anonymous type that has an Id. For simplicity we return 201 Created.
        return StatusCode(201, result);
    }

    [HttpPost("{id}/allocations")]
    public async Task<IActionResult> AllocateUser(Guid id, [FromBody] CreateAllocationDto request)
    {
        var result = await _projectService.AllocateUserAsync(id, request);
        return StatusCode(201, result);
    }

    /// <summary>
    /// PUT /api/projects/{id}/allocations/{allocationId}
    /// Atualiza horas alocadas, valor da hora e vigência da alocação de um analista.
    /// </summary>
    [HttpPut("{id}/allocations/{allocationId}")]
    public async Task<IActionResult> UpdateAllocation(Guid id, Guid allocationId, [FromBody] UpdateAllocationDto request)
    {
        if (request.AllocatedHours <= 0)
            return BadRequest(new { message = "As horas alocadas devem ser maiores que zero." });

        if (request.HourlyCost <= 0)
            return BadRequest(new { message = "O custo por hora deve ser maior que zero." });

        var result = await _projectService.UpdateAllocationAsync(id, allocationId, request);
        if (result == null) return NotFound(new { message = "Alocação ou projeto não encontrado." });
        return Ok(result);
    }

    /// <summary>
    /// DELETE /api/projects/{id}/allocations/{allocationId}
    /// Desaloca o analista do projeto. Bloqueia se já houver apontamentos (TimeEntries).
    /// </summary>
    [HttpDelete("{id}/allocations/{allocationId}")]
    public async Task<IActionResult> DeleteAllocation(Guid id, Guid allocationId)
    {
        var result = await _projectService.DeleteAllocationAsync(id, allocationId);
        if (!result.Success)
        {
            if (result.ErrorMessage?.Contains("não encontrado") == true)
                return NotFound(new { message = result.ErrorMessage });

            return BadRequest(new { message = result.ErrorMessage });
        }

        return NoContent();
    }

    /// <summary>
    /// POST /api/projects/{id}/milestones
    /// Cadastra um novo marco de entrega vinculado ao projeto.
    /// </summary>
    [HttpPost("{id}/milestones")]
    public async Task<IActionResult> AddMilestone(Guid id, [FromBody] CreateMilestoneDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "O nome do marco não pode ser vazio." });

        if (request.Weight <= 0)
            return BadRequest(new { message = "O peso do marco deve ser maior que zero." });

        var result = await _projectService.AddMilestoneAsync(id, request);
        return StatusCode(201, result);
    }

    /// <summary>
    /// PUT /api/projects/{id}/milestones/{milestoneId}
    /// Atualiza nome e peso percentual de um marco de entrega.
    /// </summary>
    [HttpPut("{id}/milestones/{milestoneId}")]
    public async Task<IActionResult> UpdateMilestone(Guid id, Guid milestoneId, [FromBody] UpdateMilestoneDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "O nome do marco não pode ser vazio." });

        if (request.Weight <= 0)
            return BadRequest(new { message = "O peso do marco deve ser maior que zero." });

        var result = await _projectService.UpdateMilestoneAsync(id, milestoneId, request);
        if (result == null) return NotFound(new { message = "Marco ou projeto não encontrado." });
        return Ok(result);
    }

    /// <summary>
    /// DELETE /api/projects/{id}/milestones/{milestoneId}
    /// Remove um marco de entrega do projeto.
    /// </summary>
    [HttpDelete("{id}/milestones/{milestoneId}")]
    public async Task<IActionResult> DeleteMilestone(Guid id, Guid milestoneId)
    {
        var success = await _projectService.DeleteMilestoneAsync(id, milestoneId);
        if (!success) return NotFound(new { message = "Marco ou projeto não encontrado." });
        return NoContent();
    }

    /// <summary>
    /// PATCH /api/projects/{id}/milestones/{milestoneId}/toggle
    /// Alterna a situação do marco entre concluído e pendente.
    /// </summary>
    [HttpPatch("{id}/milestones/{milestoneId}/toggle")]
    public async Task<IActionResult> ToggleMilestone(Guid id, Guid milestoneId)
    {
        var result = await _projectService.ToggleMilestoneAsync(id, milestoneId);
        if (result == null) return NotFound(new { message = "Marco ou projeto não encontrado." });
        return Ok(result);
    }
}
