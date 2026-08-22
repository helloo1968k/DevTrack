namespace DevTracker.Domain.Enums;

public enum UserRole
{
    Admin = 0,
    Manager = 1,
    Developer = 2,
    Viewer = 3
}

public enum ProjectRole
{
    Owner = 0,
    Maintainer = 1,
    Contributor = 2,
    Viewer = 3
}

public enum WorkItemType
{
    Epic = 0,
    Story = 1,
    Task = 2,
    Bug = 3
}

public enum WorkItemStatus
{
    Backlog = 0,
    ToDo = 1,
    InProgress = 2,
    InReview = 3,
    Done = 4,
    Cancelled = 5
}

public enum WorkItemPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}
