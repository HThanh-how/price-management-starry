using FluentValidation;
using PriceManagement.Application.DTOs.Items;

namespace PriceManagement.Application.Validators;

/// <summary>
/// Validation rules for creating a new item.
/// Enforces business constraints before data reaches the service layer.
/// </summary>
public class CreateItemValidator : AbstractValidator<CreateItemRequest>
{
    public CreateItemValidator()
    {
        RuleFor(x => x.ItemCode)
            .NotEmpty().WithMessage("Item code is required.")
            .MaximumLength(50).WithMessage("Item code must not exceed 50 characters.")
            .Matches(@"^[A-Za-z0-9\-_]+$").WithMessage("Item code can only contain letters, numbers, hyphens, and underscores.");

        RuleFor(x => x.ItemName)
            .NotEmpty().WithMessage("Item name is required.")
            .Length(2, 200).WithMessage("Item name must be between 2 and 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required.")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters.");
    }
}

/// <summary>
/// Validation rules for updating an existing item.
/// </summary>
public class UpdateItemValidator : AbstractValidator<UpdateItemRequest>
{
    public UpdateItemValidator()
    {
        RuleFor(x => x.ItemName)
            .NotEmpty().WithMessage("Item name is required.")
            .Length(2, 200).WithMessage("Item name must be between 2 and 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required.")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(s => s == "Active" || s == "Inactive")
            .WithMessage("Status must be either 'Active' or 'Inactive'.");
    }
}
