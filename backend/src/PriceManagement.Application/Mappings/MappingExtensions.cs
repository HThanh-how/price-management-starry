using PriceManagement.Application.DTOs.Items;
using PriceManagement.Application.DTOs.Prices;
using PriceManagement.Application.DTOs.Suppliers;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Enums;

namespace PriceManagement.Application.Mappings;

/// <summary>
/// Extension methods for mapping between domain entities and DTOs.
/// Uses manual mapping for explicit control and zero reflection overhead.
/// Each method provides a clear, auditable transformation path.
/// </summary>
public static class MappingExtensions
{
    // ========================================
    // Item mappings
    // ========================================

    /// <summary>
    /// Maps an Item entity to its DTO representation.
    /// </summary>
    public static ItemDto ToDto(this Item entity) => new()
    {
        Id = entity.Id,
        ItemCode = entity.ItemCode,
        ItemName = entity.ItemName,
        Description = entity.Description,
        Unit = entity.Unit,
        Status = entity.Status.ToString(),
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        RowVersion = entity.RowVersion
    };

    /// <summary>
    /// Maps an Item entity to its detail DTO with supplier prices included.
    /// </summary>
    public static ItemDetailDto ToDetailDto(this Item entity) => new()
    {
        Id = entity.Id,
        ItemCode = entity.ItemCode,
        ItemName = entity.ItemName,
        Description = entity.Description,
        Unit = entity.Unit,
        Status = entity.Status.ToString(),
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        RowVersion = entity.RowVersion,
        SupplierPrices = entity.ItemSupplierPrices
            .Where(isp => isp.DeletedAt == null)
            .Select(isp => new ItemSupplierPriceDetailDto
            {
                Id = isp.Id,
                SupplierId = isp.SupplierId,
                SupplierCode = isp.Supplier?.SupplierCode ?? string.Empty,
                SupplierName = isp.Supplier?.SupplierName ?? string.Empty,
                Price = isp.Price,
                Currency = isp.Currency.ToString(),
                EffectiveDate = isp.EffectiveDate,
                Remark = isp.Remark
            })
            .OrderByDescending(sp => sp.EffectiveDate)
            .ToList()
    };

    /// <summary>
    /// Maps a CreateItemRequest DTO to a new Item entity.
    /// </summary>
    public static Item ToEntity(this CreateItemRequest request) => new()
    {
        ItemCode = request.ItemCode.Trim(),
        ItemName = request.ItemName.Trim(),
        Description = request.Description?.Trim(),
        Unit = request.Unit.Trim().ToUpperInvariant(),
        Status = EntityStatus.Active
    };

    // ========================================
    // Supplier mappings
    // ========================================

    /// <summary>
    /// Maps a Supplier entity to its DTO representation.
    /// </summary>
    public static SupplierDto ToDto(this Supplier entity) => new()
    {
        Id = entity.Id,
        SupplierCode = entity.SupplierCode,
        SupplierName = entity.SupplierName,
        ContactPerson = entity.ContactPerson,
        Email = entity.Email,
        Phone = entity.Phone,
        Address = entity.Address,
        Status = entity.Status.ToString(),
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        RowVersion = entity.RowVersion
    };

    /// <summary>
    /// Maps a CreateSupplierRequest DTO to a new Supplier entity.
    /// </summary>
    public static Supplier ToEntity(this CreateSupplierRequest request) => new()
    {
        SupplierCode = request.SupplierCode.Trim(),
        SupplierName = request.SupplierName.Trim(),
        ContactPerson = request.ContactPerson?.Trim(),
        Email = request.Email?.Trim(),
        Phone = request.Phone?.Trim(),
        Address = request.Address?.Trim(),
        Status = EntityStatus.Active
    };

    // ========================================
    // Price mappings
    // ========================================

    /// <summary>
    /// Maps an ItemSupplierPrice entity to its DTO representation.
    /// Includes denormalized Item and Supplier names from navigation properties.
    /// </summary>
    public static PriceDto ToDto(this ItemSupplierPrice entity) => new()
    {
        Id = entity.Id,
        ItemId = entity.ItemId,
        ItemCode = entity.Item?.ItemCode ?? string.Empty,
        ItemName = entity.Item?.ItemName ?? string.Empty,
        SupplierId = entity.SupplierId,
        SupplierCode = entity.Supplier?.SupplierCode ?? string.Empty,
        SupplierName = entity.Supplier?.SupplierName ?? string.Empty,
        Price = entity.Price,
        Currency = entity.Currency.ToString(),
        EffectiveDate = entity.EffectiveDate,
        Remark = entity.Remark,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        RowVersion = entity.RowVersion
    };

    /// <summary>
    /// Maps a CreatePriceRequest DTO to a new ItemSupplierPrice entity.
    /// </summary>
    public static ItemSupplierPrice ToEntity(this CreatePriceRequest request) => new()
    {
        ItemId = request.ItemId,
        SupplierId = request.SupplierId,
        Price = request.Price,
        Currency = Enum.Parse<CurrencyCode>(request.Currency, true),
        EffectiveDate = request.EffectiveDate.Date,
        Remark = request.Remark?.Trim()
    };
}
