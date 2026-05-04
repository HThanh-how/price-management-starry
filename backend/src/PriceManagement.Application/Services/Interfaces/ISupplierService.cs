using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Suppliers;

namespace PriceManagement.Application.Services.Interfaces;

/// <summary>
/// Service interface for supplier business operations.
/// </summary>
public interface ISupplierService
{
    Task<PagedResult<SupplierDto>> GetAllAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
