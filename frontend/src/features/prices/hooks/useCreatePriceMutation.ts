import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { priceService } from '@/services/api';
import type { CreatePriceFormData } from '@/types/schemas';
import { priceKeys } from './usePriceDropdownQueries';

/**
 * Hook chuyên trách: Mutation tạo mới Price record.
 * Chỉ dùng trong PriceForm — đảm bảo mỗi mutation chỉ tồn tại 1 instance duy nhất.
 */
export function useCreatePriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceFormData) =>
      priceService.create({
        itemId: data.itemId,
        supplierId: data.supplierId,
        price: data.price,
        currency: data.currency,
        effectiveDate: new Date(data.effectiveDate).toISOString(),
        remark: data.remark || undefined,
      }),
    onSuccess: () => {
      message.success('Price record created successfully');
      queryClient.invalidateQueries({ queryKey: priceKeys.all });
    },
    onError: (error: Error) =>
      message.error(error.message || 'Failed to create price'),
  });
}
