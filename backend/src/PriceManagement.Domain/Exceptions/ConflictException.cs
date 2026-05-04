namespace PriceManagement.Domain.Exceptions;

/// <summary>
/// Thrown when a data conflict is detected (e.g., duplicate business code,
/// optimistic concurrency violation).
/// Maps to HTTP 409 Conflict in the exception handling middleware.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
