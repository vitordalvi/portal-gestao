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

    [HttpPost("{id}/milestones")]
    public async Task<IActionResult> AddMilestone(Guid id, [FromBody] CreateMilestoneDto request)
    {
        var result = await _projectService.AddMilestoneAsync(id, request);
        return StatusCode(201, result);
    }

    [HttpPatch("{id}/milestones/{milestoneId}/toggle")]
    public async Task<IActionResult> ToggleMilestone(Guid id, Guid milestoneId)
    {
        var result = await _projectService.ToggleMilestoneAsync(id, milestoneId);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
