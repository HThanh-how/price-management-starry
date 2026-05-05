namespace PriceManagement.Application;

/// <summary>
/// Application-wide constants for the Price Management system.
/// Centralizes all magic numbers, cache TTLs, and configuration values.
/// </summary>
public static class AppConstants
{
    // ========================================
    // Pagination defaults
    // ========================================

    /// <summary>Default page number for list endpoints.</summary>
    public const int DefaultPageNumber = 1;

    /// <summary>Default page size for list endpoints.</summary>
    public const int DefaultPageSize = 100;

    /// <summary>Maximum allowed page size to prevent abuse.</summary>
    public const int MaxPageSize = 500;

    // ========================================
    // SWR (Stale-While-Revalidate) Cache Strategy
    // ========================================

    /// <summary>
    /// Redis absolute TTL for cached data (1 hour).
    /// Data is stored in Redis for this duration.
    /// </summary>
    public const int RedisCacheTtlSeconds = 3600; // 1 hour

    /// <summary>
    /// SWR stale marker TTL (seconds).
    /// After this period, the cached data is considered "stale".
    /// The next request will serve stale data AND trigger a background refresh.
    /// </summary>
    public const int RedisStaleAfterSeconds = 3; // 3 seconds

    // ========================================
    // Cache key prefixes
    // ========================================

    /// <summary>Cache key pattern for paginated item list: items:list:{page}:{size}:{search}</summary>
    public const string CacheKeyItemList = "items:list:{0}:{1}:{2}";

    /// <summary>Cache key pattern for single item by ID: items:id:{id}</summary>
    public const string CacheKeyItemById = "items:id:{0}";

    /// <summary>Cache key pattern for item detail with suppliers: items:detail:{id}</summary>
    public const string CacheKeyItemDetail = "items:detail:{0}";

    /// <summary>Cache key pattern for paginated supplier list: suppliers:list:{page}:{size}:{search}</summary>
    public const string CacheKeySupplierList = "suppliers:list:{0}:{1}:{2}";

    /// <summary>Cache key pattern for single supplier: suppliers:id:{id}</summary>
    public const string CacheKeySupplierById = "suppliers:id:{0}";

    /// <summary>Cache key pattern for paginated price list: prices:list:{page}:{size}</summary>
    public const string CacheKeyPriceList = "prices:list:{0}:{1}";

    /// <summary>Cache key pattern for prices by item: prices:by-item:{itemId}</summary>
    public const string CacheKeyPricesByItem = "prices:by-item:{0}";

    // ========================================
    // SWR stale marker keys
    // ========================================

    /// <summary>
    /// Stale marker key suffix.
    /// When this key expires (after StaleAfterSeconds), the data at the main key is "stale".
    /// </summary>
    public const string StaleMarkerSuffix = ":fresh";

    // ========================================
    // Validation limits
    // ========================================

    public const int MaxCodeLength = 20;
    public const int MaxNameLength = 200;
    public const int MaxDescriptionLength = 1000;
    public const int MaxEmailLength = 255;
    public const int MaxPhoneLength = 50;
    public const int MaxAddressLength = 500;
    public const int MaxRemarkLength = 500;

    // ========================================
    // Slow query threshold
    // ========================================

    /// <summary>Queries slower than this threshold (ms) are logged as warnings.</summary>
    public const int SlowQueryThresholdMs = 200;
}
