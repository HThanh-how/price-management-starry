using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Items;
using PriceManagement.Application.Services.Interfaces;

namespace PriceManagement.Api.Controllers.V1;

/// <summary>
/// API controller for managing master item data.
/// Provides CRUD operations and detail view with linked supplier prices.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;
    private readonly IValidator<CreateItemRequest> _createValidator;
    private readonly IValidator<UpdateItemRequest> _updateValidator;

    public ItemsController(
        IItemService itemService,
        IValidator<CreateItemRequest> createValidator,
        IValidator<UpdateItemRequest> updateValidator)
    {
        _itemService = itemService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>
    /// Retrieves a paginated list of items with optional search and sorting.
    /// </summary>
    /// <param name="request">Pagination and filter parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of items.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _itemService.GetAllAsync(request, cancellationToken);
        var response = ApiResponse<PagedResult<ItemDto>>.Ok(result, "Items retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Retrieves a single item by its unique identifier.
    /// </summary>
    /// <param name="id">Item UUID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itemService.GetByIdAsync(id, cancellationToken);
        var response = ApiResponse<ItemDto>.Ok(result, "Item retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Retrieves an item with all linked supplier prices.
    /// Used for the item detail panel showing one item with multiple suppliers.
    /// </summary>
    /// <param name="id">Item UUID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:guid}/detail")]
    [ProducesResponseType(typeof(ApiResponse<ItemDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var result = await _itemService.GetDetailAsync(id, cancellationToken);
        var response = ApiResponse<ItemDetailDto>.Ok(result, "Item detail retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Creates a new item.
    /// </summary>
    /// <param name="request">Item creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateItemRequest request, CancellationToken cancellationToken)
    {
        // Validate request using FluentValidation
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _itemService.CreateAsync(request, cancellationToken);
        var response = ApiResponse<ItemDto>.Created(result, "Item created successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Updates an existing item.
    /// </summary>
    /// <param name="id">Item UUID.</param>
    /// <param name="request">Updated item data with RowVersion for concurrency.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateItemRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _itemService.UpdateAsync(id, request, cancellationToken);
        var response = ApiResponse<ItemDto>.Ok(result, "Item updated successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Soft-deletes an item.
    /// </summary>
    /// <param name="id">Item UUID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _itemService.DeleteAsync(id, cancellationToken);
        var response = ApiResponse<object>.Ok(null!, "Item deleted successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }
}
