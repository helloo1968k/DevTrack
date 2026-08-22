namespace DevTracker.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty; // short code e.g. "DEV"
    public string Description { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public User? Owner { get; set; }
    public bool IsArchived { get; set; } = false;

    // Used to generate sequential work item codes like DEV-1, DEV-2 ...
    public int WorkItemSequence { get; set; } = 0;

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
}
