namespace PriceManagement.Domain.Entities;

/// <summary>
/// Represents a price record linking an Item to a Supplier.
/// This is the core junction entity that enables the many-to-many relationship
/// between Items and Suppliers, enriched with price, currency, and effective date.
/// </summary>
public class ItemSupplierPrice : BaseEntity
{
    /// <summary>
    /// Foreign key to the associated Item.
    /// </summary>
    public Guid ItemId { get; set; }

    /// <summary>
    /// Foreign key to the associated Supplier.
    /// </summary>
    public Guid SupplierId { get; set; }

    /// <summary>
    /// The quoted price from the supplier for this item.
    /// Uses decimal for financial precision (avoids floating-point rounding issues).
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// ISO 4217 currency code for the price (e.g., "USD", "VND", "EUR").
    /// </summary>
    public Enums.CurrencyCode Currency { get; set; } = Enums.CurrencyCode.USD;

    /// <summary>
    /// Date from which this price is effective (UTC).
    /// </summary>
    public DateTime EffectiveDate { get; set; }

    /// <summary>
    /// Optional notes or remarks about this price record.
    /// </summary>
    public string? Remark { get; set; }

    // ========================================
    // Navigation properties
    // ========================================

    /// <summary>
    /// Navigation property to the associated Item.
    /// </summary>
    public Item Item { get; set; } = null!;

    /// <summary>
    /// Navigation property to the associated Supplier.
    /// </summary>
    public Supplier Supplier { get; set; } = null!;
}
