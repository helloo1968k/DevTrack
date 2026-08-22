namespace DevTracker.Application.DTOs;

public record CreateCommentRequest(string Content);

public record CommentDto(int Id, int WorkItemId, int UserId, string Username, string Content, DateTime CreatedAt);
