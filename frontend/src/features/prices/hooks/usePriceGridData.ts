import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { priceService } from '@/services/api';
import { priceKeys } from './usePriceDropdownQueries';

/**
 * Hook chuyên trách: Dữ liệu + Mutations cho PriceGrid.
 * Chứa prices query, update mutation, và delete mutation.
 * Chỉ dùng trong PriceGrid — đảm bảo mỗi mutation chỉ tồn tại 1 instance duy nhất.
 */
export function usePriceGridData() {
  const queryClient = useQueryClient();

  const pricesQuery = useQuery({
    queryKey: priceKeys.all,
    queryFn: async () => {
      const response = await priceService.getAll(1, 100);
      if (!response.success) throw new Error(response.message);
      return response.data.items;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof priceService.update>[1] }) =>
      priceService.update(id, data),
    onSuccess: () => {
      message.success('Price updated successfully');
      queryClient.invalidateQueries({ queryKey: priceKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update price');
      queryClient.invalidateQueries({ queryKey: priceKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => priceService.delete(id),
    onSuccess: () => {
      message.success('Price record deleted');
      queryClient.invalidateQueries({ queryKey: priceKeys.all });
    },
    onError: (error: Error) =>
      message.error(error.message || 'Failed to delete'),
  });

  return { pricesQuery, updateMutation, deleteMutation };
}
