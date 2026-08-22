using DevTracker.Application;
using DevTracker.Application.DTOs;
using DevTracker.Application.Interfaces;
using DevTracker.Domain.Entities;
using DevTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevTracker.Infrastructure.Services;

public class WorkItemService : IWorkItemService
{
    private readonly AppDbContext _db;

    public WorkItemService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<WorkItemDto> CreateAsync(int projectId, int reporterId, CreateWorkItemRequest request)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new NotFoundException($"Project {projectId} not found.");

        await EnsureMember(projectId, reporterId);

        if (request.AssigneeId.HasValue)
            await EnsureMember(projectId, request.AssigneeId.Value);

        project.WorkItemSequence += 1;
        var code = $"{project.Key}-{project.WorkItemSequence}";

        var item = new WorkItem
        {
            ProjectId = projectId,
            Code = code,
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            Priority = request.Priority,
            AssigneeId = request.AssigneeId,
            ParentId = request.ParentId,
            ReporterId = reporterId,
            DueDate = request.DueDate,
            EstimatedHours = request.EstimatedHours
        };

        _db.WorkItems.Add(item);
        await _db.SaveChangesAsync();

        return await ToDtoAsync(item);
    }

    public async Task<WorkItemDto?> GetByIdAsync(int workItemId, int requestingUserId)
    {
        var item = await GetItemOrThrow(workItemId);
        await EnsureMember(item.ProjectId, requestingUserId);
        return await ToDtoAsync(item);
    }

    public async Task<PagedResult<WorkItemDto>> GetForProjectAsync(int projectId, int requestingUserId, WorkItemFilter filter)
    {
        await EnsureMember(projectId, requestingUserId);

        var query = _db.WorkItems.Where(w => w.ProjectId == projectId);

        if (filter.Status.HasValue) query = query.Where(w => w.Status == filter.Status);
        if (filter.Type.HasValue) query = query.Where(w => w.Type == filter.Type);
        if (filter.Priority.HasValue) query = query.Where(w => w.Priority == filter.Priority);
        if (filter.AssigneeId.HasValue) query = query.Where(w => w.AssigneeId == filter.AssigneeId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(w => w.Title.Contains(filter.Search) || w.Description.Contains(filter.Search));

        var total = await query.CountAsync();

        var page = Math.Max(filter.Page, 1);
        var pageSize = Math.Clamp(filter.PageSize, 1, 200);

        var items = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(w => w.Reporter)
            .Include(w => w.Assignee)
            .ToListAsync();

        var dtos = items.Select(MapDto).ToList();
        return new PagedResult<WorkItemDto>(dtos, total, page, pageSize);
    }

    public async Task<WorkItemDto> UpdateAsync(int workItemId, int requestingUserId, UpdateWorkItemRequest request)
    {
        var item = await GetItemOrThrow(workItemId);
        await EnsureMember(item.ProjectId, requestingUserId);

        if (request.AssigneeId.HasValue && request.AssigneeId != item.AssigneeId)
            await EnsureMember(item.ProjectId, request.AssigneeId.Value);

        await LogChange(item.Id, requestingUserId, "Title", item.Title, request.Title);
        await LogChange(item.Id, requestingUserId, "Priority", item.Priority.ToString(), request.Priority.ToString());
        await LogChange(item.Id, requestingUserId, "AssigneeId", item.AssigneeId?.ToString(), request.AssigneeId?.ToString());

        item.Title = request.Title;
        item.Description = request.Description;
        item.Type = request.Type;
        item.Priority = request.Priority;
        item.AssigneeId = request.AssigneeId;
        item.DueDate = request.DueDate;
        item.EstimatedHours = request.EstimatedHours;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await ToDtoAsync(item);
    }

    public async Task<WorkItemDto> UpdateStatusAsync(int workItemId, int requestingUserId, UpdateWorkItemStatusRequest request)
    {
        var item = await GetItemOrThrow(workItemId);
        await EnsureMember(item.ProjectId, requestingUserId);

        await LogChange(item.Id, requestingUserId, "Status", item.Status.ToString(), request.Status.ToString());

        item.Status = request.Status;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await ToDtoAsync(item);
    }

    public async Task DeleteAsync(int workItemId, int requestingUserId)
    {
        var item = await GetItemOrThrow(workItemId);
        await EnsureMember(item.ProjectId, requestingUserId);

        if (item.ReporterId != requestingUserId)
        {
            var member = await _db.ProjectMembers.FirstAsync(pm => pm.ProjectId == item.ProjectId && pm.UserId == requestingUserId);
            if ((int)member.Role > (int)Domain.Enums.ProjectRole.Maintainer)
                throw new ForbiddenException("Only the reporter or a project maintainer can delete this item.");
        }

        _db.WorkItems.Remove(item);
        await _db.SaveChangesAsync();
    }

    public async Task<List<WorkItemActivityDto>> GetActivityAsync(int workItemId, int requestingUserId)
    {
        var item = await GetItemOrThrow(workItemId);
        await EnsureMember(item.ProjectId, requestingUserId);

        return await _db.WorkItemActivities
            .Where(a => a.WorkItemId == workItemId)
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new WorkItemActivityDto(a.Id, a.UserId, a.User!.Username, a.FieldChanged, a.OldValue, a.NewValue, a.CreatedAt))
            .ToListAsync();
    }

    // ---- helpers ----

    private async Task<WorkItem> GetItemOrThrow(int workItemId)
    {
        return await _db.WorkItems.FirstOrDefaultAsync(w => w.Id == workItemId)
            ?? throw new NotFoundException($"Work item {workItemId} not found.");
    }

    private async Task EnsureMember(int projectId, int userId)
    {
        var isMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember) throw new ForbiddenException("You are not a member of this project.");
    }

    private async Task LogChange(int workItemId, int userId, string field, string? oldValue, string? newValue)
    {
        if (oldValue == newValue) return;
        _db.WorkItemActivities.Add(new WorkItemActivity
        {
            WorkItemId = workItemId,
            UserId = userId,
            FieldChanged = field,
            OldValue = oldValue,
            NewValue = newValue
        });
        await Task.CompletedTask;
    }

    private async Task<WorkItemDto> ToDtoAsync(WorkItem item)
    {
        await _db.Entry(item).Reference(w => w.Reporter).LoadAsync();
        if (item.AssigneeId.HasValue)
            await _db.Entry(item).Reference(w => w.Assignee).LoadAsync();

        return MapDto(item);
    }

    private static WorkItemDto MapDto(WorkItem w) => new(
        w.Id, w.Code, w.ProjectId, w.Title, w.Description, w.Type, w.Status, w.Priority,
        w.ParentId, w.ReporterId, w.Reporter?.Username ?? string.Empty,
        w.AssigneeId, w.Assignee?.Username, w.DueDate, w.EstimatedHours, w.CreatedAt, w.UpdatedAt);
}
