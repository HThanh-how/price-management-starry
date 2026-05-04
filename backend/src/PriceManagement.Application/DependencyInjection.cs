using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PriceManagement.Application.Services.Implementations;
using PriceManagement.Application.Services.Interfaces;

namespace PriceManagement.Application;

/// <summary>
/// Extension method for registering Application layer services in the DI container.
/// Follows the "composition root" pattern — each layer registers its own dependencies.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers all Application layer services: business services and FluentValidation validators.
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register business services
        services.AddScoped<IItemService, ItemService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IPriceService, PriceService>();

        // Register all FluentValidation validators from this assembly
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
