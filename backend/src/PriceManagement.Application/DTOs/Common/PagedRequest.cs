namespace PriceManagement.Application.DTOs.Common;

/// <summary>
/// Standard pagination request parameters accepted by list endpoints.
/// </summary>
public class PagedRequest
{
    private int _pageNumber = 1;
    private int _pageSize = 20;
    private const int MaxPageSize = 100;

    /// <summary>
    /// Page number (1-based). Defaults to 1. Minimum is 1.
    /// </summary>
    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    /// <summary>
    /// Number of items per page. Defaults to 20. Maximum is 100.
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 1 : value);
    }

    /// <summary>
    /// Optional search/filter keyword.
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Optional sort field name.
    /// </summary>
    public string? SortBy { get; set; }

    /// <summary>
    /// Sort direction: "asc" or "desc". Defaults to "asc".
    /// </summary>
    public string SortDirection { get; set; } = "asc";
}
