import { useQuery } from '@tanstack/react-query';
import { itemService, supplierService } from '@/services/api';

/**
 * Query key factory for Price feature.
 * Centralized key management prevents cache key drift across components.
 */
export const priceKeys = {
  all: ['prices'] as const,
  itemsDropdown: ['items-dropdown'] as const,
  suppliersDropdown: ['suppliers-dropdown'] as const,
};

/**
 * Hook chuyên trách: Cung cấp dữ liệu dropdown (Items, Suppliers) cho PriceForm.
 * Tách biệt khỏi mutations để tuân thủ Single Responsibility Principle.
 *
 * TanStack Query tự động deduplicate nếu nhiều component cùng dùng queryKey này,
 * nên hook này có thể gọi ở bất kỳ đâu mà không lo duplicate network calls.
 */
export function usePriceDropdownQueries() {
  const itemsQuery = useQuery({
    queryKey: priceKeys.itemsDropdown,
    queryFn: async () => {
      const response = await itemService.getAll(1, 100);
      return response.success ? response.data.items : [];
    },
    staleTime: 5 * 60 * 1000, // Dropdown data hiếm khi thay đổi → cache 5 phút
  });

  const suppliersQuery = useQuery({
    queryKey: priceKeys.suppliersDropdown,
    queryFn: async () => {
      const response = await supplierService.getAll(1, 100);
      return response.success ? response.data.items : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { itemsQuery, suppliersQuery };
}
