using FluentValidation;
using PriceManagement.Application.DTOs.Prices;
using PriceManagement.Domain.Enums;

namespace PriceManagement.Application.Validators;

/// <summary>
/// Validation rules for creating a new price record.
/// </summary>
public class CreatePriceValidator : AbstractValidator<CreatePriceRequest>
{
    public CreatePriceValidator()
    {
        RuleFor(x => x.ItemId)
            .NotEmpty().WithMessage("Item ID is required.");

        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("Supplier ID is required.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.")
            .PrecisionScale(18, 4, false).WithMessage("Price must not exceed 18 digits with 4 decimal places.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .Must(c => Enum.TryParse<CurrencyCode>(c, true, out _))
            .WithMessage("Currency must be a valid currency code (USD, VND, EUR, JPY, CNY, KRW, THB).");

        RuleFor(x => x.EffectiveDate)
            .NotEmpty().WithMessage("Effective date is required.");

        RuleFor(x => x.Remark)
            .MaximumLength(500).WithMessage("Remark must not exceed 500 characters.");
    }
}

/// <summary>
/// Validation rules for updating an existing price record.
/// </summary>
public class UpdatePriceValidator : AbstractValidator<UpdatePriceRequest>
{
    public UpdatePriceValidator()
    {
        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.")
            .PrecisionScale(18, 4, false).WithMessage("Price must not exceed 18 digits with 4 decimal places.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .Must(c => Enum.TryParse<CurrencyCode>(c, true, out _))
            .WithMessage("Currency must be a valid currency code (USD, VND, EUR, JPY, CNY, KRW, THB).");

        RuleFor(x => x.EffectiveDate)
            .NotEmpty().WithMessage("Effective date is required.");

        RuleFor(x => x.Remark)
            .MaximumLength(500).WithMessage("Remark must not exceed 500 characters.");
    }
}
