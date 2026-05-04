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
