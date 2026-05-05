'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community';
import { useItemDetailQuery, useUpdateItemMutation } from '@/features/items/hooks/useItemDetailQueries';
import { MetadataEditor } from '@/features/items/components/MetadataEditor';
import { AuditHistoryPanel } from '@/features/items/components/AuditHistoryPanel';
import type { ItemSupplierPriceDetailDto } from '@/types';
import { appGridTheme } from '@/lib/gridTheme';

ModuleRegistry.registerModules([AllCommunityModule]);

const CATEGORY_OPTIONS = ['Raw Materials', 'Components', 'Metals', 'Electronics', 'Packaging', 'Chemicals', 'Other'];

/**
 * Item Detail / Edit Page.
 * Full-page layout matching the Figma/HTML design:
 *   - Top: Breadcrumb + Item header
 *   - Middle: Edit form (Name, Category, Unit, BasePrice, Status, Description)
 *   - Below form: MetadataEditor (Dynamic Custom Attributes)
 *   - Bottom: Linked Suppliers & Prices (AG Grid)
 */
export default function ItemEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const gridRef = useRef<AgGridReact>(null);

  const { data: item, isLoading, isError } = useItemDetailQuery(id);
  const updateMutation = useUpdateItemMutation(id);

  // Local form state
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [status, setStatus] = useState(true);
  const [description, setDescription] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  // Populate form when data arrives
  useEffect(() => {
    if (!item) return;
    setItemName(item.itemName);
    setCategory(item.category || '');
    setUnit(item.unit);
    setBasePrice(item.basePrice != null ? String(item.basePrice) : '');
    setStatus(item.status === 'Active');
    setDescription(item.description || '');
    setMetadata(item.metadata || {});
  }, [item]);

  const handleSave = useCallback(() => {
    if (!item) return;
    updateMutation.mutate({
      itemName: itemName.trim(),
      description: description.trim() || undefined,
      unit: unit.trim(),
      category: category.trim() || undefined,
      basePrice: basePrice ? parseFloat(basePrice) : undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      status: status ? 'Active' : 'Inactive',
      rowVersion: item.rowVersion,
    });
  }, [item, itemName, description, unit, category, basePrice, metadata, status, updateMutation]);

  // AG Grid columns for Linked Suppliers & Prices
  const priceColumnDefs: ColDef<ItemSupplierPriceDetailDto>[] = [
    { field: 'supplierCode', headerName: 'Supplier ID', width: 140, filter: 'agTextColumnFilter', sortable: true, pinned: 'left' },
    { field: 'supplierName', headerName: 'Supplier Name', flex: 1, minWidth: 200, filter: 'agTextColumnFilter', sortable: true },
    {
      field: 'price', headerName: 'Current Price', width: 160, sortable: true,
      cellRenderer: (params: { value: number; data: ItemSupplierPriceDetailDto }) => (
        <span className="font-medium">
          {params.data.currency === 'EUR' ? '€' : '$'}{params.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { field: 'currency', headerName: 'Currency', width: 100, filter: 'agTextColumnFilter' },
    {
      field: 'effectiveDate', headerName: 'Last Updated', width: 140, sortable: true,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('en-CA') : '',
    },
    { field: 'remark', headerName: 'Remark', flex: 1, minWidth: 150 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
        <span className="ml-2 text-on-surface-variant">Loading item details...</span>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="material-symbols-outlined text-error text-[48px]">error</span>
        <p className="text-on-surface-variant">Item not found or failed to load.</p>
        <button onClick={() => router.push('/items')} className="px-4 py-2 bg-primary text-on-primary rounded">
          Back to Item List
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-margin-page bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header with Breadcrumb */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 text-outline mb-1">
              <button
                onClick={() => router.push('/items')}
                className="font-label-sm text-label-sm hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Master Item List
              </button>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-label-sm text-label-sm">Edit Item</span>
            </div>
            <h2 className="font-h3 text-h3 text-on-surface">{item.itemCode}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{item.itemName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/items')}
              className="px-4 py-2 border border-outline text-on-surface font-label-md text-label-md rounded hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending && (
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-surface-variant">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 font-label-md text-label-md transition-colors relative ${
              activeTab === 'details'
                ? 'text-primary border-b-2 border-primary -mb-[1px]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] mr-1 align-text-bottom">edit_note</span>
            Item Details
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 font-label-md text-label-md transition-colors relative ${
              activeTab === 'audit'
                ? 'text-primary border-b-2 border-primary -mb-[1px]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] mr-1 align-text-bottom">history</span>
            Audit History
          </button>
        </div>

        {activeTab === 'details' ? (
          <>
            {/* Item Details Form */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 mb-6">
              <h3 className="font-h5 text-h5 mb-4 border-b border-surface-variant pb-2">Item Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Item Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    Item Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-surface transition-colors"
                  />
                </div>
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-surface transition-colors appearance-none"
                  >
                    <option value="">— Select Category —</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {/* Unit */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    Base Unit <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-surface transition-colors"
                  />
                </div>
                {/* Base Price */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    Base Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-surface transition-colors"
                  />
                </div>
                {/* Status Toggle */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Status</label>
                  <div className="flex items-center gap-3 h-[38px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={status}
                        onChange={(e) => setStatus(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      <span className="ml-3 font-body-sm text-body-sm text-on-surface">
                        {status ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
                {/* Description */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-outline-variant rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-surface transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Custom Attributes (Metadata) */}
            <div className="mb-6">
              <MetadataEditor
                metadata={metadata}
                onChange={setMetadata}
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Linked Suppliers & Prices */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg flex flex-col mb-6">
              <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-bright rounded-t-lg">
                <h3 className="font-h5 text-h5 text-on-surface">Linked Suppliers &amp; Prices</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {item.supplierPrices.length} supplier{item.supplierPrices.length !== 1 ? 's' : ''} linked
                </span>
              </div>
              <div className="h-[300px]">
                <AgGridReact
                  ref={gridRef}
                  rowData={item.supplierPrices}
                  columnDefs={priceColumnDefs}
                  defaultColDef={{ resizable: true, floatingFilter: true }}
                  getRowId={(params) => params.data.id}
                  animateRows
                  pagination
                  paginationPageSize={10}
                  theme={appGridTheme}
                />
              </div>
            </div>
          </>
        ) : (
          /* Audit History Tab */
          <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 mb-6">
            <AuditHistoryPanel entityType="Item" entityId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
