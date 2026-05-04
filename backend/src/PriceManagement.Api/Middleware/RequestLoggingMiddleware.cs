using System.Diagnostics;

namespace PriceManagement.Api.Middleware;

/// <summary>
/// Middleware for structured HTTP request/response logging.
/// Logs request method, path, status code, and elapsed time for every request.
/// Useful for monitoring API performance and debugging slow endpoints.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? "unknown";

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            var statusCode = context.Response.StatusCode;
            var method = context.Request.Method;
            var path = context.Request.Path;
            var elapsed = stopwatch.ElapsedMilliseconds;

            // Use appropriate log level based on response status
            if (statusCode >= 500)
            {
                _logger.LogError(
                    "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms [TraceId: {CorrelationId}]",
                    method, path, statusCode, elapsed, correlationId);
            }
            else if (statusCode >= 400)
            {
                _logger.LogWarning(
                    "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms [TraceId: {CorrelationId}]",
                    method, path, statusCode, elapsed, correlationId);
            }
            else
            {
                _logger.LogInformation(
                    "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms [TraceId: {CorrelationId}]",
                    method, path, statusCode, elapsed, correlationId);
            }
        }
    }
}
