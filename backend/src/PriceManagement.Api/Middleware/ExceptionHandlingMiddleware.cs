using System.Text.Json;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Domain.Exceptions;

namespace PriceManagement.Api.Middleware;

/// <summary>
/// Global exception handling middleware that catches all unhandled exceptions
/// and converts them into standardized API response envelopes.
/// Maps domain exceptions to appropriate HTTP status codes.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();

        // Map exception type to HTTP status code and message
        var (statusCode, message) = exception switch
        {
            NotFoundException notFound => (StatusCodes.Status404NotFound, notFound.Message),
            ConflictException conflict => (StatusCodes.Status409Conflict, conflict.Message),
            BusinessRuleException businessRule => (StatusCodes.Status422UnprocessableEntity, businessRule.Message),
            FluentValidation.ValidationException validation => (StatusCodes.Status400BadRequest, "Validation failed."),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred. Please contact support with the trace ID.")
        };

        // Log with appropriate level based on error type
        if (statusCode >= 500)
        {
            // Internal server errors are logged as Error with full stack trace (never exposed to client)
            _logger.LogError(exception,
                "Unhandled exception occurred. TraceId: {CorrelationId}, Path: {Path}, Method: {Method}",
                correlationId, context.Request.Path, context.Request.Method);
        }
        else
        {
            // Client errors are logged as Warning (expected business errors)
            _logger.LogWarning(
                "Client error occurred: {StatusCode} - {Message}. TraceId: {CorrelationId}, Path: {Path}",
                statusCode, message, correlationId, context.Request.Path);
        }

        // Build error response
        var errors = exception is FluentValidation.ValidationException validationEx
            ? validationEx.Errors.Select(e => new ApiError(e.PropertyName, e.ErrorMessage)).ToList()
            : null;

        var response = ApiResponse<object>.Fail(statusCode, message, errors);
        response.TraceId = correlationId;

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }
}
