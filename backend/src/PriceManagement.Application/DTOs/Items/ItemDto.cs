using PriceManagement.Domain.Enums;

namespace PriceManagement.Application.DTOs.Items;

/// <summary>
/// Data transfer object for Item responses.
/// Maps from Item entity to a client-friendly format.
/// </summary>
public class ItemDto
{
    public Guid Id { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string? Category { get; set; }
    public decimal? BasePrice { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public uint RowVersion { get; set; }
}

/// <summary>
/// Extended item DTO that includes linked supplier price records.
/// Used for the item detail panel.
/// </summary>
public class ItemDetailDto : ItemDto
{
    /// <summary>
    /// List of supplier-price records linked to this item.
    /// </summary>
    public List<ItemSupplierPriceDetailDto> SupplierPrices { get; set; } = new();
}

/// <summary>
/// Supplier price detail shown within an item detail view.
/// </summary>
public class ItemSupplierPriceDetailDto
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime EffectiveDate { get; set; }
    public string? Remark { get; set; }
}
