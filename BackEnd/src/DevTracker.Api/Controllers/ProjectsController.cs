using DevTracker.Application.DTOs;
using DevTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DevTracker.Api.Controllers;

[Route("api/projects")]
public class ProjectsController : ApiControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(CreateProjectRequest request)
    {
        var result = await _projectService.CreateAsync(CurrentUserId, request);
        return CreatedAtAction(nameof(GetById), new { projectId = result.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetMine()
    {
        return Ok(await _projectService.GetForUserAsync(CurrentUserId));
    }

    [HttpGet("{projectId:int}")]
    public async Task<ActionResult<ProjectDto>> GetById(int projectId)
    {
        var result = await _projectService.GetByIdAsync(projectId, CurrentUserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{projectId:int}")]
    public async Task<ActionResult<ProjectDto>> Update(int projectId, UpdateProjectRequest request)
    {
        return Ok(await _projectService.UpdateAsync(projectId, CurrentUserId, request));
    }

    [HttpDelete("{projectId:int}")]
    public async Task<IActionResult> Delete(int projectId)
    {
        await _projectService.DeleteAsync(projectId, CurrentUserId);
        return NoContent();
    }

    [HttpGet("{projectId:int}/members")]
    public async Task<ActionResult<List<ProjectMemberDto>>> GetMembers(int projectId)
    {
        return Ok(await _projectService.GetMembersAsync(projectId, CurrentUserId));
    }

    [HttpPost("{projectId:int}/members")]
    public async Task<ActionResult<ProjectMemberDto>> AddMember(int projectId, AddProjectMemberRequest request)
    {
        return Ok(await _projectService.AddMemberAsync(projectId, CurrentUserId, request));
    }

    [HttpDelete("{projectId:int}/members/{memberUserId:int}")]
    public async Task<IActionResult> RemoveMember(int projectId, int memberUserId)
    {
        await _projectService.RemoveMemberAsync(projectId, CurrentUserId, memberUserId);
        return NoContent();
    }
}
