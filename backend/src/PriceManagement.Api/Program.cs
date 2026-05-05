using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using PriceManagement.Api.Data;
using PriceManagement.Api.Data.Repositories;
using PriceManagement.Api.Middleware;
using PriceManagement.Application;
using PriceManagement.Domain.Interfaces;

// ========================================
// Load .env file for local development (secrets not in appsettings)
// ========================================
DotNetEnv.Env.Load();

// ========================================
// Configure Serilog structured logging
// ========================================
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    // Enable EF Core command logging at Information level → logs SQL queries + execution time
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "PriceManagement.Api")
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/log-.json",
        rollingInterval: RollingInterval.Day,
        formatter: new Serilog.Formatting.Json.JsonFormatter(),
        retainedFileCountLimit: 30)
    .CreateLogger();

try
{
    Log.Information("Starting Price Management API...");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog as the logging provider
    builder.Host.UseSerilog();

    // ========================================
    // Database configuration (MySQL via EF Core)
    // ========================================
    var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
    var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "3306";
    var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "price_management";
    var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "root";
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";

    var connectionString = $"Server={dbHost};Port={dbPort};Database={dbName};User={dbUser};Password={dbPassword};";

    // Register the slow query interceptor
    builder.Services.AddSingleton<PriceManagement.Api.Data.Interceptors.SlowQueryInterceptor>();

    // Register IHttpContextAccessor + AuditInterceptor for enterprise audit trail
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<AuditInterceptor>();

    builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    {
        options.UseMySQL(connectionString);
        options.AddInterceptors(sp.GetRequiredService<PriceManagement.Api.Data.Interceptors.SlowQueryInterceptor>());

        // Enable detailed SQL parameter logging in Development
        if (builder.Environment.IsDevelopment())
        {
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
        }
    });
    // ========================================
    // Redis distributed caching
    // ========================================
    var redisHost = Environment.GetEnvironmentVariable("REDIS_HOST") ?? "localhost";
    var redisPort = Environment.GetEnvironmentVariable("REDIS_PORT") ?? "6379";
    var redisConnectionString = $"{redisHost}:{redisPort}";

    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "PriceMgmt:";
    });

    // ========================================
    // Register repositories (Domain interfaces → API implementations)
    // ========================================
    builder.Services.AddScoped<IItemRepository, ItemRepository>();
    builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
    builder.Services.AddScoped<IPriceRepository, PriceRepository>();

    // ========================================
    // Register Application layer services + validators
    // ========================================
    builder.Services.AddApplicationServices();

    // AuditLogService lives in API layer (depends on AppDbContext)
    builder.Services.AddScoped<PriceManagement.Application.Services.Interfaces.IAuditLogService, PriceManagement.Api.Services.AuditLogService>();

    // ========================================
    // CORS configuration for Next.js frontend
    // ========================================
    var allowedOrigins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>()
        ?? new[] { "http://localhost:3000" };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("FrontendPolicy", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    // ========================================
    // Controllers + JSON serialization
    // ========================================
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        });

    // ========================================
    // Swagger / OpenAPI documentation
    // ========================================
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new()
        {
            Title = "Price Management API",
            Version = "v1",
            Description = "Enterprise-grade API for managing items, suppliers, and pricing data."
        });

        // Include XML comments from controllers
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
    });

    // ========================================
    // Health checks (DB + Redis connectivity)
    // ========================================
    builder.Services.AddHealthChecks()
        .AddMySql(connectionString, name: "mysql", tags: new[] { "db", "mysql" })
        .AddRedis(redisConnectionString, name: "redis", tags: new[] { "cache", "redis" });

    var app = builder.Build();

    // ========================================
    // Middleware pipeline (order matters!)
    // ========================================

    // 1. Correlation ID (must be first to tag all downstream logs)
    app.UseMiddleware<CorrelationIdMiddleware>();

    // 2. Global exception handling (catches all unhandled exceptions)
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    // 3. Request logging (logs method, path, status, elapsed time)
    app.UseMiddleware<RequestLoggingMiddleware>();

    // 4. OpenAPI + Scalar (modern API documentation UI)
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Price Management API v1");
        options.RoutePrefix = "swagger";
    });

    // 4b. Scalar — premium API reference UI (accessible at /scalar)
    // The OpenAPI document is generated by Swashbuckle at
    // `/swagger/{documentName}/swagger.json`, so point Scalar at that route
    // (the package default is `/openapi/{documentName}.json`, which would
    // 404 here because we have not registered Microsoft.AspNetCore.OpenApi).
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("Price Management API")
            .WithTheme(ScalarTheme.BluePlanet)
            .WithOpenApiRoutePattern("/swagger/{documentName}/swagger.json")
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });

    // 5. CORS
    app.UseCors("FrontendPolicy");

    // 6. Routing + Controllers
    app.MapControllers();

    // 7. Health check endpoint
    app.MapHealthChecks("/health");

    // ========================================
    // Auto-apply pending migrations on startup (development convenience)
    // ========================================
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Seed default admin user if no users exist
            if (!await dbContext.Users.AnyAsync())
            {
                var adminUser = new PriceManagement.Domain.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Email = "analyst@starry.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("starry2026"),
                    FullName = "Starry Analyst",
                    Role = "Admin",
                    IsActive = true
                };
                dbContext.Users.Add(adminUser);
                await dbContext.SaveChangesAsync();
                Log.Information("Default admin user seeded: analyst@starry.vn");
            }
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Database migration failed. The API will start but database operations may fail. " +
                "Ensure MySQL is running and connection string is correct.");
        }
    }

    Log.Information("Price Management API started successfully on {Urls}", string.Join(", ", app.Urls));
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}
