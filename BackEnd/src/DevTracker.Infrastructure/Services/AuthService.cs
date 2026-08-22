using DevTracker.Application;
using DevTracker.Application.DTOs;
using DevTracker.Application.Interfaces;
using DevTracker.Domain.Entities;
using DevTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DevTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenGenerator _jwt;

    public AuthService(AppDbContext db, IPasswordHasher hasher, IJwtTokenGenerator jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
            throw new ConflictException("Username is already taken.");

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new ConflictException("Email is already registered.");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = _hasher.Hash(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            throw new ValidationException("Invalid username or password.");

        if (!user.IsActive)
            throw new ForbiddenException("This account has been deactivated.");

        return BuildResponse(user);
    }

    private AuthResponse BuildResponse(User user)
    {
        var (token, expiresAt) = _jwt.GenerateToken(user);
        var dto = new UserDto(user.Id, user.Username, user.Email, user.FullName, user.Role);
        return new AuthResponse(token, expiresAt, dto);
    }
}
