import apiClient from '@/lib/apiClient';
import type {
  ApiResponse, PagedResult,
  ItemDto, ItemDetailDto, CreateItemRequest, UpdateItemRequest,
  SupplierDto, CreateSupplierRequest, UpdateSupplierRequest,
  PriceDto, CreatePriceRequest, UpdatePriceRequest,
  AuditLogDto,
} from '@/types';

// ========================================
// Item API service
// ========================================

export const itemService = {
  /** Retrieve paginated list of items */
  getAll: async (page = 1, pageSize = 100, search?: string) => {
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: String(pageSize) });
    if (search) params.append('search', search);
    const { data } = await apiClient.get<ApiResponse<PagedResult<ItemDto>>>(`/items?${params}`);
    return data;
  },

  /** Retrieve single item by ID */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ItemDto>>(`/items/${id}`);
    return data;
  },

  /** Retrieve item detail with supplier prices */
  getDetail: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ItemDetailDto>>(`/items/${id}/detail`);
    return data;
  },

  /** Create a new item */
  create: async (request: CreateItemRequest) => {
    const { data } = await apiClient.post<ApiResponse<ItemDto>>('/items', request);
    return data;
  },

  /** Update an existing item */
  update: async (id: string, request: UpdateItemRequest) => {
    const { data } = await apiClient.put<ApiResponse<ItemDto>>(`/items/${id}`, request);
    return data;
  },

  /** Soft-delete an item */
  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<object>>(`/items/${id}`);
    return data;
  },
};

// ========================================
// Supplier API service
// ========================================

export const supplierService = {
  getAll: async (page = 1, pageSize = 100, search?: string) => {
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: String(pageSize) });
    if (search) params.append('search', search);
    const { data } = await apiClient.get<ApiResponse<PagedResult<SupplierDto>>>(`/suppliers?${params}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<SupplierDto>>(`/suppliers/${id}`);
    return data;
  },

  create: async (request: CreateSupplierRequest) => {
    const { data } = await apiClient.post<ApiResponse<SupplierDto>>('/suppliers', request);
    return data;
  },

  update: async (id: string, request: UpdateSupplierRequest) => {
    const { data } = await apiClient.put<ApiResponse<SupplierDto>>(`/suppliers/${id}`, request);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<object>>(`/suppliers/${id}`);
    return data;
  },
};

// ========================================
// Price API service
// ========================================

export const priceService = {
  getAll: async (page = 1, pageSize = 100) => {
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: String(pageSize) });
    const { data } = await apiClient.get<ApiResponse<PagedResult<PriceDto>>>(`/prices?${params}`);
    return data;
  },

  getByItemId: async (itemId: string) => {
    const { data } = await apiClient.get<ApiResponse<PriceDto[]>>(`/prices/by-item/${itemId}`);
    return data;
  },

  create: async (request: CreatePriceRequest) => {
    const { data } = await apiClient.post<ApiResponse<PriceDto>>('/prices', request);
    return data;
  },

  update: async (id: string, request: UpdatePriceRequest) => {
    const { data } = await apiClient.put<ApiResponse<PriceDto>>(`/prices/${id}`, request);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<object>>(`/prices/${id}`);
    return data;
  },
};

// ========================================
// Audit Log API service
// ========================================

export const auditLogService = {
  /** Retrieve audit history for a specific entity */
  getByEntity: async (entityType: string, entityId: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      pageNumber: String(page),
      pageSize: String(pageSize),
    });
    const { data } = await apiClient.get<ApiResponse<PagedResult<AuditLogDto>>>(
      `/audit-logs/${entityType}/${entityId}?${params}`
    );
    return data;
  },
};
