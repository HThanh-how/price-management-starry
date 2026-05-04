namespace PriceManagement.Application.DTOs.Items;

/// <summary>
/// Request DTO for creating a new item.
/// Validated by CreateItemValidator before processing.
/// </summary>
public class CreateItemRequest
{
    /// <summary>
    /// Unique business code (e.g., "ITM-001"). Required, max 50 chars.
    /// </summary>
    public string ItemCode { get; set; } = string.Empty;

    /// <summary>
    /// Name of the item. Required, 3-200 chars.
    /// </summary>
    public string ItemName { get; set; } = string.Empty;

    /// <summary>
    /// Optional description, max 1000 chars.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Unit of measurement. Required, max 20 chars.
    /// </summary>
    public string Unit { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating an existing item.
/// Includes RowVersion for optimistic concurrency control.
/// </summary>
public class UpdateItemRequest
{
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";

    /// <summary>
    /// Required for optimistic concurrency. Must match the current RowVersion in the database.
    /// </summary>
    public uint RowVersion { get; set; }
}
