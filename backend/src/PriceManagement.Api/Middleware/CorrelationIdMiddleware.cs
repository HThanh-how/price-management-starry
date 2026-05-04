namespace PriceManagement.Api.Middleware;

/// <summary>
/// Middleware that ensures every request has a unique Correlation/Trace ID.
/// If the client sends X-Correlation-Id header, it's reused; otherwise, a new UUID is generated.
/// The ID is stored in HttpContext.Items for use throughout the request pipeline.
/// </summary>
public class CorrelationIdMiddleware
{
    private const string CorrelationIdHeader = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Extract existing Correlation ID from request header, or generate a new one
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        // Store in HttpContext.Items for downstream access (services, controllers, etc.)
        context.Items["CorrelationId"] = correlationId;

        // Add Correlation ID to response headers for client-side tracing
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[CorrelationIdHeader] = correlationId;
            return Task.CompletedTask;
        });

        // Push Correlation ID into Serilog's log context for structured logging
        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
