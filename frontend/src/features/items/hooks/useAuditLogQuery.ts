'use client';

import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '@/services/api';

/**
 * Hook chuyên trách: Fetch audit history cho một entity cụ thể.
 */
export function useAuditLogQuery(entityType: string, entityId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['audit-logs', entityType, entityId, page, pageSize],
    queryFn: async () => {
      const response = await auditLogService.getByEntity(entityType, entityId, page, pageSize);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!entityType && !!entityId,
  });
}
