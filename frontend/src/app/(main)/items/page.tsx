'use client';

import React, { useState, useCallback, useRef } from 'react';
import { message, Modal, Form, Select, Input } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemService } from '@/services/api';
import type { ItemDto, ItemDetailDto, CreateItemRequest } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Master Item List — Figma pixel-perfect with AG Grid + Detail Panel.
 * Data management powered by TanStack React Query.
 */
export default function ItemsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const gridRef = useRef<AgGridReact>(null);

  // ========== React Query: Items List ==========
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', search],
    queryFn: async () => {
      const response = await itemService.getAll(1, 100, search || undefined);
      if (response.success) return response.data.items;
      throw new Error(response.message);
    },
  });
  const items = itemsData ?? [];

  // ========== React Query: Item Detail ==========
  const { data: selectedItemDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['itemDetail', selectedItemId],
    queryFn: async () => {
      if (!selectedItemId) return null;
      const response = await itemService.getDetail(selectedItemId);
      if (response.success) return response.data;
      throw new Error(response.message);
    },
    enabled: !!selectedItemId,
  });

  // ========== Mutations ==========
  const createMutation = useMutation({
    mutationFn: (request: CreateItemRequest) => itemService.create(request),
    onSuccess: () => {
      message.success('Item created successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setIsCreateModalOpen(false);
      form.resetFields();
    },
    onError: (error: Error) => message.error(error.message || 'Failed to create item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof itemService.update>[1] }) =>
      itemService.update(id, data),
    onSuccess: () => {
      message.success('Item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['itemDetail'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update item');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemService.delete(id),
    onSuccess: () => {
      message.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setSelectedItemId(null);
    },
    onError: (error: Error) => message.error(error.message || 'Failed to delete item'),
  });

  // ========== Handlers ==========
  const onCellValueChanged = useCallback((event: CellValueChangedEvent<ItemDto>) => {
    const { data } = event;
    if (!data) return;
    updateMutation.mutate({
      id: data.id,
      data: { itemName: data.itemName, description: data.description || undefined, unit: data.unit, status: data.status, rowVersion: data.rowVersion },
    });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this item?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        itemCode: values.itemCode,
        itemName: values.itemName,
        description: values.description,
        unit: values.unit,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
    }
  };

  // ========== AG Grid Columns ==========
  const columnDefs: ColDef<ItemDto>[] = [
    { field: 'itemCode', headerName: 'Item Code', width: 140, filter: 'agTextColumnFilter', sortable: true, pinned: 'left' },
    { field: 'itemName', headerName: 'Item Name', flex: 1, minWidth: 200, editable: true, filter: 'agTextColumnFilter', sortable: true },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200, editable: true, filter: 'agTextColumnFilter' },
    { field: 'unit', headerName: 'Unit', width: 100, editable: true, filter: 'agTextColumnFilter', sortable: true },
    {
      field: 'status', headerName: 'Status', width: 120, editable: true,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Active', 'Inactive'] },
      filter: 'agTextColumnFilter', sortable: true,
      cellRenderer: (params: { value: string }) => {
        const active = params.value === 'Active';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${
            active
              ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed-dim'
              : 'bg-surface-container-high text-on-surface border-outline-variant'
          }`}>{params.value}</span>
        );
      },
    },
    {
      headerName: 'Actions', width: 100, pinned: 'right', sortable: false, filter: false,
      cellRenderer: (params: { data: ItemDto }) => (
        <div className="flex items-center gap-1 h-full">
          <button className="p-1 text-primary hover:bg-primary-fixed rounded" onClick={() => setSelectedItemId(params.data.id)} title="View Detail">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          <button className="p-1 text-error hover:bg-error-container rounded" onClick={() => handleDelete(params.data.id)} title="Delete">
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Page Header — Figma: bg-surface-container-lowest p-md rounded-lg border */}
      <div className="flex justify-between items-end bg-surface-container-lowest p-md rounded-lg border border-surface-container-high">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-xs">Master Item List</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage inventory items, specifications, and linked supplier pricing.</p>
        </div>
        <div className="flex gap-sm">
          <button
            className="px-4 py-2 border border-outline-variant rounded text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md flex items-center gap-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['items'] })}
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          <button
            className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md flex items-center gap-2 shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Item
          </button>
        </div>
      </div>

      {/* Grid + Detail Panel — Figma 2-column */}
      <div className="flex-1 flex gap-gutter overflow-hidden h-[calc(100vh-180px)]">
        {/* Main AG Grid */}
        <div className="flex-1 bg-surface-container-lowest border border-surface-container-high rounded-lg flex flex-col overflow-hidden">
          <AgGridReact
            ref={gridRef}
            rowData={items}
            columnDefs={columnDefs}
            loading={isLoading}
            defaultColDef={{ resizable: true, floatingFilter: true }}
            getRowId={(params) => params.data.id}
            onCellValueChanged={onCellValueChanged}
            animateRows
            pagination
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowSelection="single"
            className="ag-theme-alpine"
            theme="legacy"
          />
        </div>

        {/* Detail Panel — Figma: w-[400px] shadow */}
        {selectedItemId && (
          <div className="w-[400px] bg-surface-container-lowest border border-surface-container-high rounded-lg flex flex-col overflow-hidden shadow-[0_6px_16px_0_rgba(0,0,0,0.08)]">
            {/* Panel Header */}
            <div className="p-md border-b border-surface-container-high bg-surface-bright flex justify-between items-start">
              <div>
                {selectedItemDetail && (
                  <>
                    <div className="font-mono-data text-primary text-[11px] mb-1">{selectedItemDetail.itemCode}</div>
                    <h3 className="font-h5 text-h5 text-on-surface">{selectedItemDetail.itemName}</h3>
                  </>
                )}
                {detailLoading && <div className="text-sm text-on-surface-variant">Loading...</div>}
              </div>
              <button className="text-on-surface-variant hover:text-on-surface" onClick={() => setSelectedItemId(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Panel Content */}
            {selectedItemDetail && !detailLoading && (
              <>
                <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-on-surface-variant">Base Unit:</div>
                    <div className="text-on-surface font-medium">{selectedItemDetail.unit}</div>
                    <div className="text-on-surface-variant">Status:</div>
                    <div className="text-on-surface font-medium">{selectedItemDetail.status}</div>
                    <div className="text-on-surface-variant">Description:</div>
                    <div className="text-on-surface font-medium">{selectedItemDetail.description || '-'}</div>
                    <div className="text-on-surface-variant">Last Updated:</div>
                    <div className="text-on-surface font-medium">
                      {selectedItemDetail.updatedAt
                        ? new Date(selectedItemDetail.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(selectedItemDetail.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <hr className="border-surface-container-high" />

                  {/* Supplier Pricing Sub-Table — Figma layout */}
                  <div>
                    <div className="flex justify-between items-center mb-sm">
                      <h4 className="font-label-md text-label-md text-on-surface font-semibold">Linked Suppliers &amp; Prices</h4>
                      <span className="text-on-surface-variant text-xs">{selectedItemDetail.supplierPrices.length} supplier(s)</span>
                    </div>
                    <div className="border border-surface-container-high rounded overflow-hidden">
                      {/* Sub-table header */}
                      <div className="grid grid-cols-12 p-2 bg-surface-container-low border-b border-surface-container-high text-[11px] font-medium text-on-surface-variant uppercase">
                        <div className="col-span-5">Supplier</div>
                        <div className="col-span-4 text-right">Current Price</div>
                        <div className="col-span-3 text-center">Currency</div>
                      </div>
                      {selectedItemDetail.supplierPrices.length === 0 ? (
                        <div className="p-4 text-center text-sm text-on-surface-variant">No supplier prices linked.</div>
                      ) : (
                        selectedItemDetail.supplierPrices.map((sp) => (
                          <div key={sp.id} className="grid grid-cols-12 p-2 border-b border-surface-container-high text-xs items-center hover:bg-surface-container-low last:border-b-0">
                            <div className="col-span-5 truncate text-on-surface font-medium">{sp.supplierName}</div>
                            <div className="col-span-4 text-right font-mono-data">${sp.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="col-span-3 text-center text-on-surface-variant">{sp.currency}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Panel Footer */}
                <div className="p-md border-t border-surface-container-high bg-surface-bright flex gap-sm justify-end">
                  <button className="px-3 py-1.5 border border-outline-variant rounded text-on-surface text-sm hover:bg-surface-container-low" onClick={() => setSelectedItemId(null)}>
                    Close
                  </button>
                  <button className="px-3 py-1.5 bg-primary text-on-primary rounded text-sm hover:bg-on-primary-fixed-variant">
                    Edit Item
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Item Modal */}
      <Modal
        title="Create New Item"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }}
        okText="Create"
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="itemCode" label="Item Code" rules={[{ required: true, message: 'Item code is required' }]}>
            <Input placeholder="e.g., ITM-001" />
          </Form.Item>
          <Form.Item name="itemName" label="Item Name" rules={[{ required: true, message: 'Item name is required' }]}>
            <Input placeholder="e.g., Steel Bolt M10" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true, message: 'Unit is required' }]}>
            <Select placeholder="Select unit">
              <Select.Option value="PCS">PCS (Pieces)</Select.Option>
              <Select.Option value="KG">KG (Kilogram)</Select.Option>
              <Select.Option value="SET">SET</Select.Option>
              <Select.Option value="BOX">BOX</Select.Option>
              <Select.Option value="TON">TON</Select.Option>
              <Select.Option value="M">M (Meter)</Select.Option>
              <Select.Option value="L">L (Liter)</Select.Option>
              <Select.Option value="SPOOL">SPOOL</Select.Option>
              <Select.Option value="SHEET">SHEET</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
