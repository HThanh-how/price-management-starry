'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { itemService } from '@/services/api';
import type { UpdateItemRequest } from '@/types';

/**
 * Hook chuyên trách: Fetch chi tiết Item (bao gồm linked supplier prices).
 */
export function useItemDetailQuery(id: string) {
  return useQuery({
    queryKey: ['items', 'detail', id],
    queryFn: async () => {
      const response = await itemService.getDetail(id);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook chuyên trách: Update Item mutation.
 */
export function useUpdateItemMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateItemRequest) => itemService.update(id, request),
    onSuccess: () => {
      message.success('Item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: Error) =>
      message.error(error.message || 'Failed to update item'),
  });
}
