using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Prices;
using PriceManagement.Application.Services.Interfaces;

namespace PriceManagement.Api.Controllers.V1;

/// <summary>
/// API controller for managing price records (Item + Supplier combinations).
/// Supports creating, updating, and listing price records with full item/supplier details.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class PricesController : ControllerBase
{
    private readonly IPriceService _priceService;
    private readonly IValidator<CreatePriceRequest> _createValidator;
    private readonly IValidator<UpdatePriceRequest> _updateValidator;

    public PricesController(
        IPriceService priceService,
        IValidator<CreatePriceRequest> createValidator,
        IValidator<UpdatePriceRequest> updateValidator)
    {
        _priceService = priceService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>
    /// Retrieves a paginated list of price records with item and supplier details.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<PriceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _priceService.GetAllAsync(request, cancellationToken);
        var response = ApiResponse<PagedResult<PriceDto>>.Ok(result, "Price records retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Retrieves a single price record by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PriceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _priceService.GetByIdAsync(id, cancellationToken);
        var response = ApiResponse<PriceDto>.Ok(result, "Price record retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Retrieves all price records for a specific item (used in item detail panel).
    /// </summary>
    [HttpGet("by-item/{itemId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PriceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByItemId(Guid itemId, CancellationToken cancellationToken)
    {
        var result = await _priceService.GetByItemIdAsync(itemId, cancellationToken);
        var response = ApiResponse<IReadOnlyList<PriceDto>>.Ok(result, "Price records for item retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Creates a new price record for an Item + Supplier combination.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PriceDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreatePriceRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _priceService.CreateAsync(request, cancellationToken);
        var response = ApiResponse<PriceDto>.Created(result, "Price record created successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Updates an existing price record.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PriceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePriceRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _priceService.UpdateAsync(id, request, cancellationToken);
        var response = ApiResponse<PriceDto>.Ok(result, "Price record updated successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Soft-deletes a price record.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _priceService.DeleteAsync(id, cancellationToken);
        var response = ApiResponse<object>.Ok(null!, "Price record deleted successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }
}
