namespace PriceManagement.Application.DTOs.Common;

/// <summary>
/// Represents a single field-level error in the API response.
/// Used in validation error responses to pinpoint exact issues.
/// </summary>
public class ApiError
{
    /// <summary>
    /// The field/property name that caused the error.
    /// </summary>
    public string Field { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable error message for this field.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    public ApiError() { }

    public ApiError(string field, string message)
    {
        Field = field;
        Message = message;
    }
}
