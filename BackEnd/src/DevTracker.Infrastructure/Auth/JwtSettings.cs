namespace DevTracker.Infrastructure.Auth;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "DevTracker";
    public string Audience { get; set; } = "DevTracker.Clients";
    public int ExpiryMinutes { get; set; } = 480;
}
