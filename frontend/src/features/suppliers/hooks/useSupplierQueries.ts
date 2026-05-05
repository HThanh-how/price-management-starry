import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { supplierService } from '@/services/api';
import type { CreateSupplierRequest } from '@/types';

/**
 * Query key factory for Supplier feature.
 */
export const supplierKeys = {
  all: (search?: string) => ['suppliers', search] as const,
};

/**
 * Hook chuyên trách: Fetch danh sách Suppliers (có hỗ trợ search).
 */
export function useSupplierListQuery(search: string) {
  return useQuery({
    queryKey: supplierKeys.all(search),
    queryFn: async () => {
      const response = await supplierService.getAll(1, 100, search || undefined);
      if (!response.success) throw new Error(response.message);
      return response.data.items;
    },
  });
}

/**
 * Hook chuyên trách: Create Supplier mutation.
 */
export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSupplierRequest) => supplierService.create(request),
    onSuccess: () => {
      message.success('Supplier created successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) =>
      message.error(error.message || 'Failed to create supplier'),
  });
}

/**
 * Hook chuyên trách: Update + Delete Supplier mutations.
 * Dùng trong SupplierGrid.
 */
export function useSupplierGridMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof supplierService.update>[1] }) =>
      supplierService.update(id, data),
    onSuccess: () => {
      message.success('Supplier updated successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update supplier');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierService.delete(id),
    onSuccess: () => {
      message.success('Supplier deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) =>
      message.error(error.message || 'Failed to delete supplier'),
  });

  return { updateMutation, deleteMutation };
}
