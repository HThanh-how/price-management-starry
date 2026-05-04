namespace PriceManagement.Domain.Exceptions;

/// <summary>
/// Thrown when a business rule violation is detected.
/// Maps to HTTP 422 Unprocessable Entity in the exception handling middleware.
/// </summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}
