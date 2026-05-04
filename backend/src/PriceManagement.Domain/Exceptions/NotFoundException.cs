namespace PriceManagement.Domain.Exceptions;

/// <summary>
/// Thrown when a requested entity cannot be found in the data store.
/// Maps to HTTP 404 Not Found in the exception handling middleware.
/// </summary>
public class NotFoundException : Exception
{
    /// <summary>
    /// The type name of the entity that was not found.
    /// </summary>
    public string EntityName { get; }

    /// <summary>
    /// The identifier used in the failed lookup.
    /// </summary>
    public object EntityId { get; }

    public NotFoundException(string entityName, object entityId)
        : base($"{entityName} with id '{entityId}' was not found.")
    {
        EntityName = entityName;
        EntityId = entityId;
    }
}
