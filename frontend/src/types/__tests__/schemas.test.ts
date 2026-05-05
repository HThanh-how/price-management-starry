import { describe, it, expect } from 'vitest';
import { createPriceSchema, createItemSchema, createSupplierSchema } from '../schemas';

// ========================================
// Price Schema Tests
// ========================================
describe('createPriceSchema', () => {
  const validPriceData = {
    itemId: '123e4567-e89b-12d3-a456-426614174000',
    supplierId: '123e4567-e89b-12d3-a456-426614174001',
    price: 150.5,
    currency: 'VND' as const,
    effectiveDate: '2026-10-10',
  };

  it('should pass validation with all valid fields', () => {
    const result = createPriceSchema.safeParse(validPriceData);
    expect(result.success).toBe(true);
  });

  it('should pass validation with optional remark', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, remark: 'Test note' });
    expect(result.success).toBe(true);
  });

  it('should fail when itemId is empty', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, itemId: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when supplierId is empty', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, supplierId: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when price is zero', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, price: 0 });
    expect(result.success).toBe(false);
  });

  it('should fail when price is negative', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, price: -10 });
    expect(result.success).toBe(false);
  });

  it('should fail when price exceeds max limit', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, price: 9999999999999 });
    expect(result.success).toBe(false);
  });

  it('should fail when currency is not in the allowed enum', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, currency: 'XYZ' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid currencies: USD, VND, EUR, JPY, CNY, KRW, THB', () => {
    const currencies = ['USD', 'VND', 'EUR', 'JPY', 'CNY', 'KRW', 'THB'] as const;
    currencies.forEach((currency) => {
      const result = createPriceSchema.safeParse({ ...validPriceData, currency });
      expect(result.success, `Expected ${currency} to be valid`).toBe(true);
    });
  });

  it('should fail when effectiveDate is empty', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, effectiveDate: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when price is not a number (string)', () => {
    const result = createPriceSchema.safeParse({ ...validPriceData, price: 'abc' });
    expect(result.success).toBe(false);
  });
});

// ========================================
// Item Schema Tests
// ========================================
describe('createItemSchema', () => {
  const validItemData = {
    itemCode: 'ITM-001',
    itemName: 'Test Item',
    unit: 'KG',
  };

  it('should pass validation with all required fields', () => {
    const result = createItemSchema.safeParse(validItemData);
    expect(result.success).toBe(true);
  });

  it('should pass validation with optional description', () => {
    const result = createItemSchema.safeParse({ ...validItemData, description: 'A test item' });
    expect(result.success).toBe(true);
  });

  it('should pass validation when description is empty string', () => {
    const result = createItemSchema.safeParse({ ...validItemData, description: '' });
    expect(result.success).toBe(true);
  });

  it('should fail when itemCode is empty', () => {
    const result = createItemSchema.safeParse({ ...validItemData, itemCode: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when itemCode contains special characters', () => {
    const result = createItemSchema.safeParse({ ...validItemData, itemCode: 'ITM@001!' });
    expect(result.success).toBe(false);
  });

  it('should allow hyphens and underscores in itemCode', () => {
    const result = createItemSchema.safeParse({ ...validItemData, itemCode: 'ITM-001_v2' });
    expect(result.success).toBe(true);
  });

  it('should fail when itemName is empty', () => {
    const result = createItemSchema.safeParse({ ...validItemData, itemName: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when unit is empty', () => {
    const result = createItemSchema.safeParse({ ...validItemData, unit: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when itemCode exceeds 50 characters', () => {
    const result = createItemSchema.safeParse({ ...validItemData, itemCode: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('should fail when itemName exceeds 200 characters', () => {
    const result = createItemSchema.safeParse({ ...validItemData, itemName: 'X'.repeat(201) });
    expect(result.success).toBe(false);
  });
});

// ========================================
// Supplier Schema Tests
// ========================================
describe('createSupplierSchema', () => {
  const validSupplierData = {
    supplierCode: 'SUP-001',
    supplierName: 'Test Supplier',
  };

  it('should pass validation with required fields only', () => {
    const result = createSupplierSchema.safeParse(validSupplierData);
    expect(result.success).toBe(true);
  });

  it('should pass validation with all optional fields provided', () => {
    const result = createSupplierSchema.safeParse({
      ...validSupplierData,
      contactPerson: 'Nguyen Van A',
      email: 'contact@company.vn',
      phone: '+84 28 3822 1234',
      address: '123 Le Loi St, Dist 1',
    });
    expect(result.success).toBe(true);
  });

  it('should fail when supplierCode is empty', () => {
    const result = createSupplierSchema.safeParse({ ...validSupplierData, supplierCode: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when supplierCode contains special characters', () => {
    const result = createSupplierSchema.safeParse({ ...validSupplierData, supplierCode: 'SUP@001!' });
    expect(result.success).toBe(false);
  });

  it('should fail when supplierName is empty', () => {
    const result = createSupplierSchema.safeParse({ ...validSupplierData, supplierName: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when email format is invalid', () => {
    const result = createSupplierSchema.safeParse({ ...validSupplierData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should pass when email is empty string (optional)', () => {
    const result = createSupplierSchema.safeParse({ ...validSupplierData, email: '' });
    expect(result.success).toBe(true);
  });

  it('should fail when supplierCode exceeds 50 characters', () => {
    const result = createSupplierSchema.safeParse({ ...validSupplierData, supplierCode: 'S'.repeat(51) });
    expect(result.success).toBe(false);
  });
});
