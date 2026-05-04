namespace PriceManagement.Application.DTOs.Common;

/// <summary>
/// Standard API response envelope used for all endpoints.
/// Ensures consistent response format across the entire API surface.
/// </summary>
/// <typeparam name="T">Type of the data payload.</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the operation completed successfully.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// HTTP status code mirrored in the response body for client convenience.
    /// </summary>
    public int Code { get; set; }

    /// <summary>
    /// Human-readable message describing the result.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The data payload. Null for error responses.
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// List of detailed errors (validation errors, field-level errors).
    /// Null for successful responses.
    /// </summary>
    public List<ApiError>? Errors { get; set; }

    /// <summary>
    /// Correlation/Trace ID for request tracing across logs and systems.
    /// Populated by CorrelationIdMiddleware.
    /// </summary>
    public string TraceId { get; set; } = string.Empty;

    // ========================================
    // Factory methods for consistent creation
    // ========================================

    /// <summary>
    /// Creates a successful response with HTTP 200.
    /// </summary>
    public static ApiResponse<T> Ok(T data, string message = "Request completed successfully.")
        => new() { Success = true, Code = 200, Message = message, Data = data };

    /// <summary>
    /// Creates a successful response with HTTP 201 for resource creation.
    /// </summary>
    public static ApiResponse<T> Created(T data, string message = "Resource created successfully.")
        => new() { Success = true, Code = 201, Message = message, Data = data };

    /// <summary>
    /// Creates a failure response with the specified error details.
    /// </summary>
    public static ApiResponse<T> Fail(int code, string message, List<ApiError>? errors = null)
        => new() { Success = false, Code = code, Message = message, Errors = errors };
}
