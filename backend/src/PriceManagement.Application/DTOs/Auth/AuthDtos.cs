namespace PriceManagement.Application.DTOs.Auth;

/// <summary>
/// Login request payload — email + password.
/// </summary>
public class LoginRequest
{
    /// <summary>User email address for authentication.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Plaintext password to verify against BCrypt hash.</summary>
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Login response containing user profile data.
/// Returned after successful authentication.
/// </summary>
public class LoginResponse
{
    /// <summary>Unique user identifier.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>User email.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Display name for UI and audit logs.</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>User role (Admin, Analyst, Viewer).</summary>
    public string Role { get; set; } = string.Empty;
}
