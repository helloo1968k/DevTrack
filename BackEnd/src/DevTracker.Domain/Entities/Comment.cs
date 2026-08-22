namespace DevTracker.Domain.Entities;

public class Comment : BaseEntity
{
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string Content { get; set; } = string.Empty;
}
