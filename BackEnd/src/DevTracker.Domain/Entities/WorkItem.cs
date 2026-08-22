using DevTracker.Domain.Enums;

namespace DevTracker.Domain.Entities;

public class WorkItem : BaseEntity
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Code { get; set; } = string.Empty; // e.g. DEV-42
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public WorkItemType Type { get; set; } = WorkItemType.Task;
    public WorkItemStatus Status { get; set; } = WorkItemStatus.Backlog;
    public WorkItemPriority Priority { get; set; } = WorkItemPriority.Medium;

    public int? ParentId { get; set; } // for sub-tasks under an epic/story
    public WorkItem? Parent { get; set; }
    public ICollection<WorkItem> Children { get; set; } = new List<WorkItem>();

    public int ReporterId { get; set; }
    public User? Reporter { get; set; }

    public int? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public DateTime? DueDate { get; set; }
    public double? EstimatedHours { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<WorkItemActivity> Activities { get; set; } = new List<WorkItemActivity>();
}
