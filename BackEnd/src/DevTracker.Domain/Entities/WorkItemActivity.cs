namespace DevTracker.Domain.Entities;

public class WorkItemActivity : BaseEntity
{
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string FieldChanged { get; set; } = string.Empty; // e.g. "Status"
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}
