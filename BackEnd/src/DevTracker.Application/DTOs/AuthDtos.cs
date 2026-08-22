using DevTracker.Domain.Enums;

namespace DevTracker.Application.DTOs;

public record RegisterRequest(string Username, string Email, string Password, string FullName);

public record LoginRequest(string Username, string Password);

public record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);

public record UserDto(int Id, string Username, string Email, string FullName, UserRole Role);
