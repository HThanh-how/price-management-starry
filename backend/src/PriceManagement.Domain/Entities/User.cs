namespace PriceManagement.Domain.Entities;

/// <summary>
/// Represents an application user for authentication and audit tracking.
/// Passwords are stored as BCrypt hashes for enterprise-grade security.
/// </summary>
public class User : BaseEntity
{
    /// <summary>Unique email used for login authentication.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>BCrypt hashed password — never stored in plaintext.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Display name shown in UI and audit logs.</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>User role for authorization (Admin, Analyst, Viewer).</summary>
    public string Role { get; set; } = "Analyst";

    /// <summary>Whether the user account is active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Last successful login timestamp.</summary>
    public DateTime? LastLoginAt { get; set; }
}
