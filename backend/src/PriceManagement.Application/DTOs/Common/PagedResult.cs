namespace PriceManagement.Application.DTOs.Common;

/// <summary>
/// Wraps paginated query results with metadata for client-side pagination controls.
/// </summary>
/// <typeparam name="T">Type of items in the page.</typeparam>
public class PagedResult<T>
{
    /// <summary>
    /// The items for the current page.
    /// </summary>
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();

    /// <summary>
    /// Current page number (1-based).
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Number of items per page.
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of records matching the query (across all pages).
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Total number of pages based on TotalCount and PageSize.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    /// <summary>
    /// Whether a next page exists after the current page.
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;

    /// <summary>
    /// Whether a previous page exists before the current page.
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;
}
