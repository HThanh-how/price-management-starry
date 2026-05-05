'use client';

import React from 'react';

interface MetadataEditorProps {
  metadata: Record<string, string>;
  onChange: (metadata: Record<string, string>) => void;
  disabled?: boolean;
}

/**
 * Dynamic Key-Value editor cho Item Metadata.
 * Cho phép user thêm/xóa/sửa bất kỳ trường nào (barcode, weight, dimensions...)
 * mà không cần thay đổi DB schema.
 */
export function MetadataEditor({ metadata, onChange, disabled }: MetadataEditorProps) {
  const entries = Object.entries(metadata);

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (newKey === oldKey) return;
    const updated = { ...metadata };
    const value = updated[oldKey];
    delete updated[oldKey];
    updated[newKey] = value;
    onChange(updated);
  };

  const handleValueChange = (key: string, value: string) => {
    onChange({ ...metadata, [key]: value });
  };

  const handleAdd = () => {
    // Generate unique default key
    let counter = 1;
    let newKey = 'new_field';
    while (metadata[newKey] !== undefined) {
      newKey = `new_field_${counter++}`;
    }
    onChange({ ...metadata, [newKey]: '' });
  };

  const handleRemove = (key: string) => {
    const updated = { ...metadata };
    delete updated[key];
    onChange(updated);
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 border-b border-surface-variant pb-2">
        <h3 className="font-h5 text-h5 text-on-surface">Custom Attributes</h3>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="flex items-center gap-1 px-3 py-1.5 border border-primary text-primary font-label-sm text-label-sm rounded hover:bg-primary-fixed transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Field
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[32px] block mb-2 text-outline">data_object</span>
          No custom attributes. Click &quot;Add Field&quot; to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_40px] gap-3 px-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Attribute Name</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Value</span>
            <span />
          </div>
          {/* Rows */}
          {entries.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center">
              <input
                type="text"
                value={key}
                onChange={(e) => handleKeyChange(key, e.target.value)}
                disabled={disabled}
                placeholder="e.g., barcode"
                className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-sm text-body-sm text-on-surface transition-colors disabled:opacity-50"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(key, e.target.value)}
                disabled={disabled}
                placeholder="e.g., 8934567890123"
                className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-sm text-body-sm text-on-surface transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleRemove(key)}
                disabled={disabled}
                className="p-1.5 text-error hover:bg-error-container rounded transition-colors disabled:opacity-50"
                title="Remove attribute"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
