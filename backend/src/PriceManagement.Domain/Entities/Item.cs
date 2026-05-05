namespace PriceManagement.Domain.Entities;

/// <summary>
/// Represents a master item in the system.
/// Items can be linked to multiple suppliers through ItemSupplierPrice records.
/// </summary>
public class Item : BaseEntity
{
    /// <summary>
    /// Unique business code for the item (e.g., "ITM-001").
    /// Must be unique across all active items.
    /// </summary>
    public string ItemCode { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable name of the item.
    /// </summary>
    public string ItemName { get; set; } = string.Empty;

    /// <summary>
    /// Optional detailed description of the item.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Unit of measurement for the item (e.g., "PCS", "KG", "SET", "BOX").
    /// </summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>
    /// Category classification (e.g., "Raw Materials", "Components", "Metals").
    /// Used for grouping and filtering items.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Base/reference price for the item before supplier-specific pricing.
    /// </summary>
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Flexible JSON metadata for dynamic attributes (barcode, weight, dimensions, etc.).
    /// Stored as JSON in MySQL. Users can add custom fields without schema changes.
    /// Example: {"barcode": "8934567890123", "weight": "10kg", "length": "5m", "width": "2m", "height": "1m"}
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Current status of the item. Defaults to Active.
    /// </summary>
    public Enums.EntityStatus Status { get; set; } = Enums.EntityStatus.Active;

    // ========================================
    // Navigation properties
    // ========================================

    /// <summary>
    /// Collection of price records linking this item to various suppliers.
    /// Supports the "one item → many suppliers with prices" relationship.
    /// </summary>
    public ICollection<ItemSupplierPrice> ItemSupplierPrices { get; set; } = new List<ItemSupplierPrice>();
}
