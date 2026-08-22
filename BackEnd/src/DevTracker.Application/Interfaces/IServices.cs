using DevTracker.Application.DTOs;

namespace DevTracker.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IJwtTokenGenerator
{
    (string token, DateTime expiresAt) GenerateToken(Domain.Entities.User user);
}

public interface IProjectService
{
    Task<ProjectDto> CreateAsync(int ownerId, CreateProjectRequest request);
    Task<ProjectDto?> GetByIdAsync(int projectId, int requestingUserId);
    Task<List<ProjectDto>> GetForUserAsync(int userId);
    Task<ProjectDto> UpdateAsync(int projectId, int requestingUserId, UpdateProjectRequest request);
    Task DeleteAsync(int projectId, int requestingUserId);

    Task<ProjectMemberDto> AddMemberAsync(int projectId, int requestingUserId, AddProjectMemberRequest request);
    Task RemoveMemberAsync(int projectId, int requestingUserId, int memberUserId);
    Task<List<ProjectMemberDto>> GetMembersAsync(int projectId, int requestingUserId);
}

public interface IWorkItemService
{
    Task<WorkItemDto> CreateAsync(int projectId, int reporterId, CreateWorkItemRequest request);
    Task<WorkItemDto?> GetByIdAsync(int workItemId, int requestingUserId);
    Task<PagedResult<WorkItemDto>> GetForProjectAsync(int projectId, int requestingUserId, WorkItemFilter filter);
    Task<WorkItemDto> UpdateAsync(int workItemId, int requestingUserId, UpdateWorkItemRequest request);
    Task<WorkItemDto> UpdateStatusAsync(int workItemId, int requestingUserId, UpdateWorkItemStatusRequest request);
    Task DeleteAsync(int workItemId, int requestingUserId);
    Task<List<WorkItemActivityDto>> GetActivityAsync(int workItemId, int requestingUserId);
}

public interface ICommentService
{
    Task<CommentDto> AddAsync(int workItemId, int userId, CreateCommentRequest request);
    Task<List<CommentDto>> GetForWorkItemAsync(int workItemId, int requestingUserId);
    Task DeleteAsync(int commentId, int requestingUserId);
}
