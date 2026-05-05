import { z } from 'zod';

/**
 * Centralized Zod validation schemas for the Price Management Tool.
 * These schemas enforce business rules on the client side and can be
 * shared with backend validation logic for consistency.
 */

// ========================================
// Item Schemas
// ========================================

/** Schema for creating a new Item via the form */
export const createItemSchema = z.object({
  itemCode: z
    .string()
    .min(1, 'Item code is required')
    .max(50, 'Item code must be 50 characters or fewer')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Item code may only contain letters, numbers, hyphens, and underscores'),
  itemName: z
    .string()
    .min(1, 'Item name is required')
    .max(200, 'Item name must be 200 characters or fewer'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer')
    .optional()
    .or(z.literal('')),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(20, 'Unit must be 20 characters or fewer'),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;

// ========================================
// Supplier Schemas
// ========================================

/** Schema for creating a new Supplier via the form */
export const createSupplierSchema = z.object({
  supplierCode: z
    .string()
    .min(1, 'Supplier code is required')
    .max(50, 'Supplier code must be 50 characters or fewer')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Supplier code may only contain letters, numbers, hyphens, and underscores'),
  supplierName: z
    .string()
    .min(1, 'Supplier name is required')
    .max(200, 'Supplier name must be 200 characters or fewer'),
  contactPerson: z
    .string()
    .max(100, 'Contact person must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .max(200, 'Email must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;

// ========================================
// Price Schemas
// ========================================

/** Supported currencies matching the backend CurrencyCode enum */
export const currencyValues = ['USD', 'VND', 'EUR', 'JPY', 'CNY', 'KRW', 'THB'] as const;

/** Schema for creating a new Price record */
export const createPriceSchema = z.object({
  itemId: z
    .string()
    .min(1, 'Please select an item'),
  supplierId: z
    .string()
    .min(1, 'Please select a supplier'),
  price: z
    .number({ message: 'Price must be a valid number' })
    .positive('Price must be greater than 0')
    .max(999999999999, 'Price is too large'),
  currency: z
    .enum(currencyValues, { message: 'Please select a valid currency' }),
  effectiveDate: z
    .string()
    .min(1, 'Effective date is required'),
  remark: z
    .string()
    .max(500, 'Remark must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export type CreatePriceFormData = z.infer<typeof createPriceSchema>;
