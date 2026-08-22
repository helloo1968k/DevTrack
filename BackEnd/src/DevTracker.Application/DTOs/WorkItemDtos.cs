using DevTracker.Domain.Enums;

namespace DevTracker.Application.DTOs;

public record CreateWorkItemRequest(
    string Title,
    string Description,
    WorkItemType Type,
    WorkItemPriority Priority,
    int? AssigneeId,
    int? ParentId,
    DateTime? DueDate,
    double? EstimatedHours);

public record UpdateWorkItemRequest(
    string Title,
    string Description,
    WorkItemType Type,
    WorkItemPriority Priority,
    int? AssigneeId,
    DateTime? DueDate,
    double? EstimatedHours);

public record UpdateWorkItemStatusRequest(WorkItemStatus Status);

public record WorkItemDto(
    int Id,
    string Code,
    int ProjectId,
    string Title,
    string Description,
    WorkItemType Type,
    WorkItemStatus Status,
    WorkItemPriority Priority,
    int? ParentId,
    int ReporterId,
    string ReporterUsername,
    int? AssigneeId,
    string? AssigneeUsername,
    DateTime? DueDate,
    double? EstimatedHours,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record WorkItemFilter(
    WorkItemStatus? Status,
    WorkItemType? Type,
    WorkItemPriority? Priority,
    int? AssigneeId,
    string? Search,
    int Page = 1,
    int PageSize = 25);

public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);

public record WorkItemActivityDto(
    int Id,
    int UserId,
    string Username,
    string FieldChanged,
    string? OldValue,
    string? NewValue,
    DateTime CreatedAt);
