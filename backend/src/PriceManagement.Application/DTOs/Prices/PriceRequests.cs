namespace PriceManagement.Application.DTOs.Prices;

/// <summary>
/// Request DTO for creating a new price record (Item + Supplier combination).
/// </summary>
public class CreatePriceRequest
{
    public Guid ItemId { get; set; }
    public Guid SupplierId { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime EffectiveDate { get; set; }
    public string? Remark { get; set; }
}

/// <summary>
/// Request DTO for updating an existing price record.
/// </summary>
public class UpdatePriceRequest
{
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime EffectiveDate { get; set; }
    public string? Remark { get; set; }
    public uint RowVersion { get; set; }
}
