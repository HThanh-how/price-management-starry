namespace PriceManagement.Domain.Enums;

/// <summary>
/// Represents the active/inactive status of master data entities.
/// </summary>
public enum EntityStatus
{
    /// <summary>
    /// Entity is active and available for use in business operations.
    /// </summary>
    Active = 1,

    /// <summary>
    /// Entity is inactive and should not appear in active selection lists.
    /// </summary>
    Inactive = 0
}
