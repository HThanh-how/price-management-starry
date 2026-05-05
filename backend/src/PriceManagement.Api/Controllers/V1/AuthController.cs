using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceManagement.Api.Data;
using PriceManagement.Application.DTOs.Auth;

namespace PriceManagement.Api.Controllers.V1;

/// <summary>
/// Authentication controller — handles user login and registration.
/// Uses BCrypt for password hashing (enterprise-grade security).
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext dbContext, ILogger<AuthController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user with email and password.
    /// Returns user profile on success, 401 on failure.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Email and password are required." });
        }

        // Find user by email (case-insensitive)
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("Login failed: user not found for {Email}", request.Email);
            return Unauthorized(new { success = false, message = "Invalid email or password." });
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: account disabled for {Email}", request.Email);
            return Unauthorized(new { success = false, message = "Account is disabled. Contact your administrator." });
        }

        // Verify password against BCrypt hash
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed: invalid password for {Email}", request.Email);
            return Unauthorized(new { success = false, message = "Invalid email or password." });
        }

        // Update last login timestamp
        var trackedUser = await _dbContext.Users.FindAsync(new object[] { user.Id }, cancellationToken);
        if (trackedUser != null)
        {
            trackedUser.LastLoginAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation("Login successful for {Email}", request.Email);

        return Ok(new
        {
            success = true,
            message = "Login successful.",
            data = new LoginResponse
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role
            }
        });
    }

    /// <summary>
    /// Register a new user account (admin use only in production).
    /// Password is hashed with BCrypt before storage.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { success = false, message = "Email, password, and full name are required." });
        }

        // Check if email already exists
        var exists = await _dbContext.Users
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (exists)
        {
            return Conflict(new { success = false, message = "An account with this email already exists." });
        }

        // Create user with BCrypt hashed password
        var user = new Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Role = request.Role ?? "Analyst",
            IsActive = true
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User registered: {Email} with role {Role}", user.Email, user.Role);

        return Created($"/api/v1/auth/{user.Id}", new
        {
            success = true,
            message = "User registered successfully.",
            data = new LoginResponse
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role
            }
        });
    }
}

/// <summary>
/// Registration request payload.
/// </summary>
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Role { get; set; }
}
