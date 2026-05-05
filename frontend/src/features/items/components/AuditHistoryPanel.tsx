'use client';

import React, { useState } from 'react';
import { useAuditLogQuery } from '@/features/items/hooks/useAuditLogQuery';

interface AuditHistoryPanelProps {
  entityType: string;
  entityId: string;
}

const ACTION_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Created: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed', icon: 'add_circle' },
  Updated: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', icon: 'edit' },
  Deleted: { bg: 'bg-error-container', text: 'text-on-error-container', icon: 'delete' },
};

/**
 * Enterprise Audit History Panel.
 * Shows a timeline of all changes to an entity with old/new values, who, when, and IP.
 */
export function AuditHistoryPanel({ entityType, entityId }: AuditHistoryPanelProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogQuery(entityType, entityId, page, 20);

  const logs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="material-symbols-outlined animate-spin text-primary text-[24px]">sync</span>
        <span className="ml-2 text-on-surface-variant font-body-sm text-body-sm">Loading audit history...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] block mb-2 text-outline">history</span>
        <p className="font-body-md text-body-md">No audit history found for this record.</p>
      </div>
    );
  }

  // Group logs by TraceId (each API call = 1 group)
  const grouped = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const key = log.traceId || log.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div>
      {/* Timeline */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([traceId, groupLogs]) => {
          const first = groupLogs[0];
          const style = ACTION_COLORS[first.action] || ACTION_COLORS['Updated'];

          return (
            <div key={traceId} className="border border-surface-variant rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-bright border-b border-surface-variant">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                    <span className="material-symbols-outlined text-[14px]">{style.icon}</span>
                    {first.action}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    by <strong>{first.changedBy}</strong>
                  </span>
                  {first.ipAddress && (
                    <span className="font-body-sm text-body-sm text-outline">
                      from {first.ipAddress}
                    </span>
                  )}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {new Date(first.changedAt).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                </span>
              </div>

              {/* Changed Fields */}
              {first.action === 'Updated' && groupLogs.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                      <th className="text-left px-4 py-2 w-[200px]">Field</th>
                      <th className="text-left px-4 py-2">Previous Value</th>
                      <th className="text-left px-4 py-2">New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupLogs.map((log) => (
                      <tr key={log.id} className="border-t border-surface-variant hover:bg-surface-container-lowest transition-colors">
                        <td className="px-4 py-2 font-label-sm text-label-sm text-on-surface font-medium">{log.fieldName}</td>
                        <td className="px-4 py-2 font-body-sm text-body-sm text-error line-through">
                          {log.oldValue || '—'}
                        </td>
                        <td className="px-4 py-2 font-body-sm text-body-sm text-primary font-medium">
                          {log.newValue || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                  {first.action === 'Created' && (first.newValue || 'Record created')}
                  {first.action === 'Deleted' && 'Record was soft-deleted'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-outline-variant rounded text-on-surface font-label-sm text-label-sm hover:bg-surface-variant transition-colors disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 border border-outline-variant rounded text-on-surface font-label-sm text-label-sm hover:bg-surface-variant transition-colors disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
