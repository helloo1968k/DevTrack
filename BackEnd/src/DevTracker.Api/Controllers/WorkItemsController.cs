using DevTracker.Api.Hubs;
using DevTracker.Application.DTOs;
using DevTracker.Application.Interfaces;
using DevTracker.Domain.Enums;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DevTracker.Api.Controllers;

[Route("api/projects/{projectId:int}/workitems")]
public class WorkItemsController : ApiControllerBase
{
    private readonly IWorkItemService _workItemService;
    private readonly ICommentService _commentService;

    private readonly IHubContext<BoardHub> _hub;
    public WorkItemsController(IWorkItemService workItemService, ICommentService commentService , IHubContext<BoardHub> hub)
    {
        _workItemService = workItemService;
        _commentService = commentService;
        _hub = hub;
    }

    [HttpPost]
    public async Task<ActionResult<WorkItemDto>> Create(int projectId, CreateWorkItemRequest request)
    {
        var result = await _workItemService.CreateAsync(projectId, CurrentUserId, request);
        await _hub.Clients.Group(BoardHub.GroupName(projectId)).SendAsync("WorkItemCreated", result);
        return CreatedAtAction(nameof(GetById), new { projectId, workItemId = result.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkItemDto>>> GetForProject(
        int projectId,
        [FromQuery] WorkItemStatus? status,
        [FromQuery] WorkItemType? type,
        [FromQuery] WorkItemPriority? priority,
        [FromQuery] int? assigneeId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var filter = new WorkItemFilter(status, type, priority, assigneeId, search, page, pageSize);
        return Ok(await _workItemService.GetForProjectAsync(projectId, CurrentUserId, filter));
    }

    [HttpGet("{workItemId:int}")]
    public async Task<ActionResult<WorkItemDto>> GetById(int projectId, int workItemId)
    {
        var result = await _workItemService.GetByIdAsync(workItemId, CurrentUserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{workItemId:int}")]
    public async Task<ActionResult<WorkItemDto>> Update(int projectId, int workItemId, UpdateWorkItemRequest request)
    {
        var result = await _workItemService.UpdateAsync(workItemId, CurrentUserId, request);
        await _hub.Clients.Group(BoardHub.GroupName(projectId)).SendAsync("WorkItemUpdated", result);
        return Ok(result);
    }

    [HttpPatch("{workItemId:int}/status")]
    public async Task<ActionResult<WorkItemDto>> UpdateStatus(int projectId, int workItemId, UpdateWorkItemStatusRequest request)
    {
        var result = await _workItemService.UpdateStatusAsync(workItemId, CurrentUserId, request);
        await _hub.Clients.Group(BoardHub.GroupName(projectId)).SendAsync("WorkItemUpdated", result);
        return Ok(result);
    }

    [HttpDelete("{workItemId:int}")]
    public async Task<IActionResult> Delete(int projectId, int workItemId)
    {
        await _workItemService.DeleteAsync(workItemId, CurrentUserId);
        await _hub.Clients.Group(BoardHub.GroupName(projectId)).SendAsync("WorkItemDeleted", workItemId);
        return NoContent();
    }   

    [HttpGet("{workItemId:int}/activity")]
    public async Task<ActionResult<List<WorkItemActivityDto>>> GetActivity(int projectId, int workItemId)
    {
        return Ok(await _workItemService.GetActivityAsync(workItemId, CurrentUserId));
    }

    [HttpGet("{workItemId:int}/comments")]
    public async Task<ActionResult<List<CommentDto>>> GetComments(int projectId, int workItemId)
    {
        return Ok(await _commentService.GetForWorkItemAsync(workItemId, CurrentUserId));
    }

    [HttpPost("{workItemId:int}/comments")]
    public async Task<ActionResult<CommentDto>> AddComment(int projectId, int workItemId, CreateCommentRequest request)
    {
        return Ok(await _commentService.AddAsync(workItemId, CurrentUserId, request));
    }
}
