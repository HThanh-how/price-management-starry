using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Suppliers;
using PriceManagement.Application.Services.Interfaces;

namespace PriceManagement.Api.Controllers.V1;

/// <summary>
/// API controller for managing master supplier data.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    private readonly IValidator<CreateSupplierRequest> _createValidator;
    private readonly IValidator<UpdateSupplierRequest> _updateValidator;

    public SuppliersController(
        ISupplierService supplierService,
        IValidator<CreateSupplierRequest> createValidator,
        IValidator<UpdateSupplierRequest> updateValidator)
    {
        _supplierService = supplierService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>
    /// Retrieves a paginated list of suppliers.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<SupplierDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetAllAsync(request, cancellationToken);
        var response = ApiResponse<PagedResult<SupplierDto>>.Ok(result, "Suppliers retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Retrieves a single supplier by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SupplierDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetByIdAsync(id, cancellationToken);
        var response = ApiResponse<SupplierDto>.Ok(result, "Supplier retrieved successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Creates a new supplier.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SupplierDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateSupplierRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _supplierService.CreateAsync(request, cancellationToken);
        var response = ApiResponse<SupplierDto>.Created(result, "Supplier created successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Updates an existing supplier.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SupplierDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplierRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _supplierService.UpdateAsync(id, request, cancellationToken);
        var response = ApiResponse<SupplierDto>.Ok(result, "Supplier updated successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }

    /// <summary>
    /// Soft-deletes a supplier.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _supplierService.DeleteAsync(id, cancellationToken);
        var response = ApiResponse<object>.Ok(null!, "Supplier deleted successfully.");
        response.TraceId = HttpContext.Items["CorrelationId"]?.ToString() ?? string.Empty;
        return Ok(response);
    }
}
