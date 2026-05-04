namespace PriceManagement.Domain.Entities;

/// <summary>
/// Represents a master supplier in the system.
/// Suppliers can provide multiple items through ItemSupplierPrice records.
/// </summary>
public class Supplier : BaseEntity
{
    /// <summary>
    /// Unique business code for the supplier (e.g., "SUP-001").
    /// Must be unique across all active suppliers.
    /// </summary>
    public string SupplierCode { get; set; } = string.Empty;

    /// <summary>
    /// Official name of the supplier company.
    /// </summary>
    public string SupplierName { get; set; } = string.Empty;

    /// <summary>
    /// Name of the primary contact person at the supplier.
    /// </summary>
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Contact email address.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Contact phone number.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Physical address of the supplier.
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Current status of the supplier. Defaults to Active.
    /// </summary>
    public Enums.EntityStatus Status { get; set; } = Enums.EntityStatus.Active;

    // ========================================
    // Navigation properties
    // ========================================

    /// <summary>
    /// Collection of price records linking this supplier to various items.
    /// </summary>
    public ICollection<ItemSupplierPrice> ItemSupplierPrices { get; set; } = new List<ItemSupplierPrice>();
}
