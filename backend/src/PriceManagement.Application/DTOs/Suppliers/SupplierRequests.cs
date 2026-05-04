namespace PriceManagement.Application.DTOs.Suppliers;

/// <summary>
/// Request DTO for creating a new supplier.
/// </summary>
public class CreateSupplierRequest
{
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

/// <summary>
/// Request DTO for updating an existing supplier.
/// </summary>
public class UpdateSupplierRequest
{
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string Status { get; set; } = "Active";
    public uint RowVersion { get; set; }
}
