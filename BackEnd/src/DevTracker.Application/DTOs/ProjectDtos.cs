using DevTracker.Domain.Enums;

namespace DevTracker.Application.DTOs;

public record CreateProjectRequest(string Name, string Key, string Description);

public record UpdateProjectRequest(string Name, string Description, bool IsArchived);

public record ProjectDto(
    int Id,
    string Name,
    string Key,
    string Description,
    int OwnerId,
    bool IsArchived,
    DateTime CreatedAt,
    int WorkItemCount);

public record AddProjectMemberRequest(int UserId, ProjectRole Role);

public record ProjectMemberDto(int Id, int UserId, string Username, ProjectRole Role);
