using DevTracker.Application.DTOs;
using DevTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTracker.Api.Controllers;

[Route("api/users")]
public class UsersController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/users/search?q=alice
    [HttpGet("search")]
    public async Task<ActionResult<List<UserDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new List<UserDto>());

        var users = await _db.Users
            .Where(u => u.Username.Contains(q) || u.Email.Contains(q))
            .OrderBy(u => u.Username)
            .Take(10)
            .Select(u => new UserDto(u.Id, u.Username, u.Email, u.FullName, u.Role))
            .ToListAsync();

        return Ok(users);
    }
}