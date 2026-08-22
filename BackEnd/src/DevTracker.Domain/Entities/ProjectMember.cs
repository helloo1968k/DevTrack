using DevTracker.Domain.Enums;

namespace DevTracker.Domain.Entities;

public class ProjectMember : BaseEntity
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public ProjectRole Role { get; set; } = ProjectRole.Contributor;
}
