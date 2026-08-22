using DevTracker.Application;
using DevTracker.Application.DTOs;
using DevTracker.Application.Interfaces;
using DevTracker.Domain.Entities;
using DevTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevTracker.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly AppDbContext _db;

    public CommentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CommentDto> AddAsync(int workItemId, int userId, CreateCommentRequest request)
    {
        var item = await _db.WorkItems.FirstOrDefaultAsync(w => w.Id == workItemId)
            ?? throw new NotFoundException($"Work item {workItemId} not found.");

        await EnsureMember(item.ProjectId, userId);

        var comment = new Comment { WorkItemId = workItemId, UserId = userId, Content = request.Content };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        return new CommentDto(comment.Id, workItemId, userId, user!.Username, comment.Content, comment.CreatedAt);
    }

    public async Task<List<CommentDto>> GetForWorkItemAsync(int workItemId, int requestingUserId)
    {
        var item = await _db.WorkItems.FirstOrDefaultAsync(w => w.Id == workItemId)
            ?? throw new NotFoundException($"Work item {workItemId} not found.");

        await EnsureMember(item.ProjectId, requestingUserId);

        return await _db.Comments
            .Where(c => c.WorkItemId == workItemId)
            .Include(c => c.User)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto(c.Id, c.WorkItemId, c.UserId, c.User!.Username, c.Content, c.CreatedAt))
            .ToListAsync();
    }

    public async Task DeleteAsync(int commentId, int requestingUserId)
    {
        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId)
            ?? throw new NotFoundException($"Comment {commentId} not found.");

        if (comment.UserId != requestingUserId)
            throw new ForbiddenException("You can only delete your own comments.");

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
    }

    private async Task EnsureMember(int projectId, int userId)
    {
        var isMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember) throw new ForbiddenException("You are not a member of this project.");
    }
}
