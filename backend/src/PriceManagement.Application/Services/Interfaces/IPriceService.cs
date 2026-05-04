using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Prices;

namespace PriceManagement.Application.Services.Interfaces;

/// <summary>
/// Service interface for price record business operations.
/// </summary>
public interface IPriceService
{
    Task<PagedResult<PriceDto>> GetAllAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<PriceDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PriceDto>> GetByItemIdAsync(Guid itemId, CancellationToken cancellationToken = default);
    Task<PriceDto> CreateAsync(CreatePriceRequest request, CancellationToken cancellationToken = default);
    Task<PriceDto> UpdateAsync(Guid id, UpdatePriceRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
