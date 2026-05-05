using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using PriceManagement.Application.DTOs.Prices;
using PriceManagement.Application.Services.Implementations;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Enums;
using PriceManagement.Domain.Exceptions;
using PriceManagement.Domain.Interfaces;
using Xunit;

namespace PriceManagement.UnitTests.Services;

/// <summary>
/// Comprehensive unit tests for PriceService covering all CRUD operations,
/// business rules, caching, and edge cases.
/// </summary>
public class PriceServiceTests
{
    private readonly Mock<IPriceRepository> _mockPriceRepo;
    private readonly Mock<IItemRepository> _mockItemRepo;
    private readonly Mock<ISupplierRepository> _mockSupplierRepo;
    private readonly Mock<IDistributedCache> _mockCache;
    private readonly Mock<ILogger<PriceService>> _mockLogger;
    private readonly PriceService _sut;

    // Shared test fixtures để tránh lặp code
    private readonly Guid _testItemId = Guid.NewGuid();
    private readonly Guid _testSupplierId = Guid.NewGuid();
    private readonly Guid _testPriceId = Guid.NewGuid();

    public PriceServiceTests()
    {
        _mockPriceRepo = new Mock<IPriceRepository>();
        _mockItemRepo = new Mock<IItemRepository>();
        _mockSupplierRepo = new Mock<ISupplierRepository>();
        _mockCache = new Mock<IDistributedCache>();
        _mockLogger = new Mock<ILogger<PriceService>>();

        _sut = new PriceService(
            _mockPriceRepo.Object,
            _mockItemRepo.Object,
            _mockSupplierRepo.Object,
            _mockCache.Object,
            _mockLogger.Object);
    }

    // ========================================
    // Helper methods — DRY test fixtures
    // ========================================

    private Item CreateTestItem(Guid? id = null) => new()
    {
        Id = id ?? _testItemId,
        ItemCode = "ITM-001",
        ItemName = "Test Item",
        Unit = "KG",
        Status = EntityStatus.Active
    };

    private Supplier CreateTestSupplier(Guid? id = null) => new()
    {
        Id = id ?? _testSupplierId,
        SupplierCode = "SUP-001",
        SupplierName = "Test Supplier",
        Status = EntityStatus.Active
    };

    private ItemSupplierPrice CreateTestPriceEntity(Guid? id = null) => new()
    {
        Id = id ?? _testPriceId,
        ItemId = _testItemId,
        SupplierId = _testSupplierId,
        Price = 100m,
        Currency = CurrencyCode.USD,
        EffectiveDate = DateTime.UtcNow.Date,
        Remark = "Test price",
        RowVersion = 1,
        Item = CreateTestItem(),
        Supplier = CreateTestSupplier()
    };

    private void SetupItemExists(Guid? itemId = null)
    {
        var id = itemId ?? _testItemId;
        _mockItemRepo.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CreateTestItem(id));
    }

    private void SetupSupplierExists(Guid? supplierId = null)
    {
        var id = supplierId ?? _testSupplierId;
        _mockSupplierRepo.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CreateTestSupplier(id));
    }

    private void SetupNoDuplicate(Guid itemId, Guid supplierId, DateTime effectiveDate)
    {
        _mockPriceRepo.Setup(x => x.ExistsByItemSupplierDateAsync(
                itemId, supplierId, effectiveDate, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
    }

    // ========================================
    // CreateAsync Tests
    // ========================================

    [Fact]
    public async Task CreateAsync_ShouldReturnPriceDto_WhenAllInputsAreValid()
    {
        // Arrange
        var request = new CreatePriceRequest
        {
            ItemId = _testItemId,
            SupplierId = _testSupplierId,
            Price = 250.50m,
            Currency = "USD",
            EffectiveDate = DateTime.UtcNow.Date,
            Remark = "Initial pricing"
        };

        SetupItemExists();
        SetupSupplierExists();
        SetupNoDuplicate(_testItemId, _testSupplierId, request.EffectiveDate.Date);

        // Act
        var result = await _sut.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Price.Should().Be(250.50m);
        result.Currency.Should().Be("USD");
        result.ItemName.Should().Be("Test Item");
        result.SupplierName.Should().Be("Test Supplier");

        _mockPriceRepo.Verify(x => x.AddAsync(
            It.Is<ItemSupplierPrice>(e =>
                e.Price == 250.50m &&
                e.Currency == CurrencyCode.USD &&
                e.ItemId == _testItemId &&
                e.SupplierId == _testSupplierId),
            It.IsAny<CancellationToken>()), Times.Once);

        _mockPriceRepo.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowNotFoundException_WhenItemDoesNotExist()
    {
        // Arrange
        var nonExistentItemId = Guid.NewGuid();
        var request = new CreatePriceRequest
        {
            ItemId = nonExistentItemId,
            SupplierId = _testSupplierId
        };

        _mockItemRepo.Setup(x => x.GetByIdAsync(nonExistentItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Item)null!);

        // Act
        Func<Task> act = () => _sut.CreateAsync(request);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nonExistentItemId}*");

        // Verify: không gọi supplier check, không add, không save
        _mockSupplierRepo.Verify(
            x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockPriceRepo.Verify(
            x => x.AddAsync(It.IsAny<ItemSupplierPrice>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowNotFoundException_WhenSupplierDoesNotExist()
    {
        // Arrange
        var nonExistentSupplierId = Guid.NewGuid();
        var request = new CreatePriceRequest
        {
            ItemId = _testItemId,
            SupplierId = nonExistentSupplierId
        };

        SetupItemExists();
        _mockSupplierRepo.Setup(x => x.GetByIdAsync(nonExistentSupplierId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Supplier)null!);

        // Act
        Func<Task> act = () => _sut.CreateAsync(request);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nonExistentSupplierId}*");

        _mockPriceRepo.Verify(
            x => x.AddAsync(It.IsAny<ItemSupplierPrice>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowConflictException_WhenDuplicateItemSupplierDateExists()
    {
        // Arrange
        var effectiveDate = new DateTime(2026, 6, 15);
        var request = new CreatePriceRequest
        {
            ItemId = _testItemId,
            SupplierId = _testSupplierId,
            Price = 100m,
            Currency = "VND",
            EffectiveDate = effectiveDate
        };

        SetupItemExists();
        SetupSupplierExists();

        _mockPriceRepo.Setup(x => x.ExistsByItemSupplierDateAsync(
                _testItemId, _testSupplierId, effectiveDate.Date, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true); // Trùng lặp!

        // Act
        Func<Task> act = () => _sut.CreateAsync(request);

        // Assert
        await act.Should().ThrowAsync<ConflictException>();
        _mockPriceRepo.Verify(
            x => x.AddAsync(It.IsAny<ItemSupplierPrice>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockPriceRepo.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    // ========================================
    // GetByIdAsync Tests
    // ========================================

    [Fact]
    public async Task GetByIdAsync_ShouldReturnPriceDto_WhenRecordExists()
    {
        // Arrange
        var entity = CreateTestPriceEntity();
        _mockPriceRepo.Setup(x => x.GetByIdAsync(_testPriceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        // Act
        var result = await _sut.GetByIdAsync(_testPriceId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(_testPriceId);
        result.Price.Should().Be(100m);
        result.ItemName.Should().Be("Test Item");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrowNotFoundException_WhenRecordDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        _mockPriceRepo.Setup(x => x.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ItemSupplierPrice)null!);

        // Act
        Func<Task> act = () => _sut.GetByIdAsync(nonExistentId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nonExistentId}*");
    }

    // ========================================
    // UpdateAsync Tests
    // ========================================

    [Fact]
    public async Task UpdateAsync_ShouldUpdateAndReturnDto_WhenValidAndRowVersionMatches()
    {
        // Arrange
        var entity = CreateTestPriceEntity();
        var request = new UpdatePriceRequest
        {
            Price = 300m,
            Currency = "VND",
            EffectiveDate = DateTime.UtcNow.Date.AddDays(7),
            Remark = "Updated price",
            RowVersion = 1 // Khớp với entity.RowVersion
        };

        _mockPriceRepo.Setup(x => x.GetByIdAsync(_testPriceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);
        _mockPriceRepo.Setup(x => x.ExistsByItemSupplierDateAsync(
                entity.ItemId, entity.SupplierId, request.EffectiveDate.Date, _testPriceId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _sut.UpdateAsync(_testPriceId, request);

        // Assert
        result.Should().NotBeNull();
        result.Price.Should().Be(300m);
        entity.Price.Should().Be(300m); // Verify entity was mutated
        entity.Currency.Should().Be(CurrencyCode.VND);
        entity.Remark.Should().Be("Updated price");

        _mockPriceRepo.Verify(x => x.Update(entity), Times.Once);
        _mockPriceRepo.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowConflictException_WhenRowVersionMismatch()
    {
        // Arrange — Entity có RowVersion=1, request gửi RowVersion=99 (stale)
        var entity = CreateTestPriceEntity();
        entity.RowVersion = 1;

        var request = new UpdatePriceRequest
        {
            Price = 500m,
            Currency = "USD",
            EffectiveDate = DateTime.UtcNow.Date,
            RowVersion = 99 // Stale!
        };

        _mockPriceRepo.Setup(x => x.GetByIdAsync(_testPriceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        // Act
        Func<Task> act = () => _sut.UpdateAsync(_testPriceId, request);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*modified by another user*");

        _mockPriceRepo.Verify(x => x.Update(It.IsAny<ItemSupplierPrice>()), Times.Never);
        _mockPriceRepo.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowNotFoundException_WhenRecordDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var request = new UpdatePriceRequest { Price = 100m, Currency = "USD", EffectiveDate = DateTime.UtcNow.Date };

        _mockPriceRepo.Setup(x => x.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ItemSupplierPrice)null!);

        // Act
        Func<Task> act = () => _sut.UpdateAsync(nonExistentId, request);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nonExistentId}*");
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowConflictException_WhenNewDateCausesDuplicate()
    {
        // Arrange — Đổi ngày hiệu lực nhưng ngày mới trùng với record khác
        var entity = CreateTestPriceEntity();
        var newDate = new DateTime(2026, 12, 25);
        var request = new UpdatePriceRequest
        {
            Price = 100m,
            Currency = "USD",
            EffectiveDate = newDate,
            RowVersion = entity.RowVersion
        };

        _mockPriceRepo.Setup(x => x.GetByIdAsync(_testPriceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);
        _mockPriceRepo.Setup(x => x.ExistsByItemSupplierDateAsync(
                entity.ItemId, entity.SupplierId, newDate.Date, _testPriceId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true); // Trùng!

        // Act
        Func<Task> act = () => _sut.UpdateAsync(_testPriceId, request);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*already exists*");

        _mockPriceRepo.Verify(x => x.Update(It.IsAny<ItemSupplierPrice>()), Times.Never);
    }

    // ========================================
    // DeleteAsync Tests
    // ========================================

    [Fact]
    public async Task DeleteAsync_ShouldSoftDeleteAndSave_WhenRecordExists()
    {
        // Arrange
        var entity = CreateTestPriceEntity();
        _mockPriceRepo.Setup(x => x.GetByIdAsync(_testPriceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(entity);

        // Act
        await _sut.DeleteAsync(_testPriceId);

        // Assert
        _mockPriceRepo.Verify(x => x.SoftDelete(entity), Times.Once);
        _mockPriceRepo.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowNotFoundException_WhenRecordDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        _mockPriceRepo.Setup(x => x.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ItemSupplierPrice)null!);

        // Act
        Func<Task> act = () => _sut.DeleteAsync(nonExistentId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nonExistentId}*");

        _mockPriceRepo.Verify(
            x => x.SoftDelete(It.IsAny<ItemSupplierPrice>()), Times.Never);
    }
}
