/**
 * TypeScript type definitions for the Price Management API.
 * Mirrors the backend DTOs for type-safe API communication.
 */

// ========================================
// Common types
// ========================================

/** Standard API response envelope from the backend */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors: ApiError[] | null;
  traceId: string;
}

/** Field-level validation error */
export interface ApiError {
  field: string;
  message: string;
}

/** Paginated result wrapper */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ========================================
// Item types
// ========================================

export interface ItemDto {
  id: string;
  itemCode: string;
  itemName: string;
  description: string | null;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  rowVersion: number;
}

export interface ItemDetailDto extends ItemDto {
  supplierPrices: ItemSupplierPriceDetailDto[];
}

export interface ItemSupplierPriceDetailDto {
  id: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  price: number;
  currency: string;
  effectiveDate: string;
  remark: string | null;
}

export interface CreateItemRequest {
  itemCode: string;
  itemName: string;
  description?: string;
  unit: string;
}

export interface UpdateItemRequest {
  itemName: string;
  description?: string;
  unit: string;
  status: string;
  rowVersion: number;
}

// ========================================
// Supplier types
// ========================================

export interface SupplierDto {
  id: string;
  supplierCode: string;
  supplierName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  rowVersion: number;
}

export interface CreateSupplierRequest {
  supplierCode: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  rowVersion: number;
}

// ========================================
// Price types
// ========================================

export interface PriceDto {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  price: number;
  currency: string;
  effectiveDate: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string | null;
  rowVersion: number;
}

export interface CreatePriceRequest {
  itemId: string;
  supplierId: string;
  price: number;
  currency: string;
  effectiveDate: string;
  remark?: string;
}

export interface UpdatePriceRequest {
  price: number;
  currency: string;
  effectiveDate: string;
  remark?: string;
  rowVersion: number;
}
