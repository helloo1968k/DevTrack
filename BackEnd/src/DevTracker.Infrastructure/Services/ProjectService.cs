using DevTracker.Application;
using DevTracker.Application.DTOs;
using DevTracker.Application.Interfaces;
using DevTracker.Domain.Entities;
using DevTracker.Domain.Enums;
using DevTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevTracker.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;

    public ProjectService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProjectDto> CreateAsync(int ownerId, CreateProjectRequest request)
    {
        if (await _db.Projects.AnyAsync(p => p.Key == request.Key))
            throw new ConflictException($"Project key '{request.Key}' is already in use.");

        var project = new Project
        {
            Name = request.Name,
            Key = request.Key.ToUpperInvariant(),
            Description = request.Description,
            OwnerId = ownerId
        };

        project.Members.Add(new ProjectMember { UserId = ownerId, Role = ProjectRole.Owner });

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        return ToDto(project, 0);
    }

    public async Task<ProjectDto?> GetByIdAsync(int projectId, int requestingUserId)
    {
        var project = await GetProjectOrThrow(projectId);
        await EnsureMember(projectId, requestingUserId);

        var count = await _db.WorkItems.CountAsync(w => w.ProjectId == projectId);
        return ToDto(project, count);
    }

    public async Task<List<ProjectDto>> GetForUserAsync(int userId)
    {
        var projectIds = await _db.ProjectMembers
            .Where(pm => pm.UserId == userId)
            .Select(pm => pm.ProjectId)
            .ToListAsync();

        var projects = await _db.Projects
            .Where(p => projectIds.Contains(p.Id))
            .ToListAsync();

        var counts = await _db.WorkItems
            .Where(w => projectIds.Contains(w.ProjectId))
            .GroupBy(w => w.ProjectId)
            .Select(g => new { ProjectId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProjectId, x => x.Count);

        return projects.Select(p => ToDto(p, counts.GetValueOrDefault(p.Id, 0))).ToList();
    }

    public async Task<ProjectDto> UpdateAsync(int projectId, int requestingUserId, UpdateProjectRequest request)
    {
        var project = await GetProjectOrThrow(projectId);
        await EnsureRole(projectId, requestingUserId, ProjectRole.Maintainer);

        project.Name = request.Name;
        project.Description = request.Description;
        project.IsArchived = request.IsArchived;
        project.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var count = await _db.WorkItems.CountAsync(w => w.ProjectId == projectId);
        return ToDto(project, count);
    }

    public async Task DeleteAsync(int projectId, int requestingUserId)
    {
        var project = await GetProjectOrThrow(projectId);
        if (project.OwnerId != requestingUserId)
            throw new ForbiddenException("Only the project owner can delete this project.");

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
    }

    public async Task<ProjectMemberDto> AddMemberAsync(int projectId, int requestingUserId, AddProjectMemberRequest request)
    {
        await GetProjectOrThrow(projectId);
        await EnsureRole(projectId, requestingUserId, ProjectRole.Maintainer);

        var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists) throw new NotFoundException("User not found.");

        if (await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == request.UserId))
            throw new ConflictException("User is already a member of this project.");

        var member = new ProjectMember { ProjectId = projectId, UserId = request.UserId, Role = request.Role };
        _db.ProjectMembers.Add(member);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(request.UserId);
        return new ProjectMemberDto(member.Id, member.UserId, user!.Username, member.Role);
    }

    public async Task RemoveMemberAsync(int projectId, int requestingUserId, int memberUserId)
    {
        var project = await GetProjectOrThrow(projectId);
        await EnsureRole(projectId, requestingUserId, ProjectRole.Maintainer);

        if (memberUserId == project.OwnerId)
            throw new ValidationException("Cannot remove the project owner.");

        var member = await _db.ProjectMembers.FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == memberUserId)
            ?? throw new NotFoundException("Member not found.");

        _db.ProjectMembers.Remove(member);
        await _db.SaveChangesAsync();
    }

    public async Task<List<ProjectMemberDto>> GetMembersAsync(int projectId, int requestingUserId)
    {
        await GetProjectOrThrow(projectId);
        await EnsureMember(projectId, requestingUserId);

        return await _db.ProjectMembers
            .Where(pm => pm.ProjectId == projectId)
            .Include(pm => pm.User)
            .Select(pm => new ProjectMemberDto(pm.Id, pm.UserId, pm.User!.Username, pm.Role))
            .ToListAsync();
    }

    // ---- helpers ----

    private async Task<Project> GetProjectOrThrow(int projectId)
    {
        return await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new NotFoundException($"Project {projectId} not found.");
    }

    private async Task EnsureMember(int projectId, int userId)
    {
        var isMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember) throw new ForbiddenException("You are not a member of this project.");
    }

    private async Task EnsureRole(int projectId, int userId, ProjectRole minimumRole)
    {
        var member = await _db.ProjectMembers.FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId)
            ?? throw new ForbiddenException("You are not a member of this project.");

        // lower enum value = higher privilege (Owner=0 ... Viewer=3)
        if ((int)member.Role > (int)minimumRole)
            throw new ForbiddenException("You do not have sufficient permissions for this action.");
    }

    private static ProjectDto ToDto(Project p, int workItemCount) =>
        new(p.Id, p.Name, p.Key, p.Description, p.OwnerId, p.IsArchived, p.CreatedAt, workItemCount);
}
