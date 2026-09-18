using Microsoft.AspNetCore.SignalR;

namespace DevTracker.Api.Hubs;

public class BoardHub : Hub
{
    public async Task JoinProject(int projectId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(projectId));
    }

    public async Task LeaveProject(int projectId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(projectId));
    }

    public static string GroupName(int projectId) => $"project-{projectId}";
}