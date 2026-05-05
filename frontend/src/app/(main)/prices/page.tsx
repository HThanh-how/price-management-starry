'use client';

import React, { useCallback, useRef } from 'react';
import { message, Modal } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPriceSchema, type CreatePriceFormData, currencyValues } from '@/types/schemas';
import { priceService, itemService, supplierService } from '@/services/api';
import type { PriceDto, ItemDto, SupplierDto } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Add New Price — Figma 2-column layout (Form + Grid).
 * React Hook Form + Zod for validation. TanStack Query for data.
 */
export default function PricesPage() {
  const queryClient = useQueryClient();
  const gridRef = useRef<AgGridReact>(null);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<CreatePriceFormData>({
    resolver: zodResolver(createPriceSchema),
    defaultValues: {
      itemId: '', supplierId: '', price: undefined, currency: 'USD',
      effectiveDate: new Date().toISOString().split('T')[0], remark: '',
    },
  });

  // ========== Queries ==========
  const { data: pricesData, isLoading: pricesLoading } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const response = await priceService.getAll(1, 100);
      if (response.success) return response.data.items;
      throw new Error(response.message);
    },
  });

  const { data: itemsData } = useQuery({
    queryKey: ['items-dropdown'],
    queryFn: async () => {
      const response = await itemService.getAll(1, 100);
      return response.success ? response.data.items : [] as ItemDto[];
    },
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-dropdown'],
    queryFn: async () => {
      const response = await supplierService.getAll(1, 100);
      return response.success ? response.data.items : [] as SupplierDto[];
    },
  });

  const prices = pricesData ?? [];
  const items = itemsData ?? [];
  const suppliers = suppliersData ?? [];

  // ========== Mutations ==========
  const createMutation = useMutation({
    mutationFn: (data: CreatePriceFormData) =>
      priceService.create({
        itemId: data.itemId, supplierId: data.supplierId, price: data.price,
        currency: data.currency, effectiveDate: new Date(data.effectiveDate).toISOString(),
        remark: data.remark || undefined,
      }),
    onSuccess: () => {
      message.success('Price record created successfully');
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      reset();
    },
    onError: (error: Error) => message.error(error.message || 'Failed to create price'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof priceService.update>[1] }) =>
      priceService.update(id, data),
    onSuccess: () => {
      message.success('Price updated successfully');
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update price');
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => priceService.delete(id),
    onSuccess: () => {
      message.success('Price record deleted');
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
    onError: (error: Error) => message.error(error.message || 'Failed to delete'),
  });

  const onCellValueChanged = useCallback((event: CellValueChangedEvent<PriceDto>) => {
    const { data } = event;
    if (!data) return;
    updateMutation.mutate({
      id: data.id,
      data: { price: data.price, currency: data.currency, effectiveDate: data.effectiveDate, remark: data.remark || undefined, rowVersion: data.rowVersion },
    });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: 'Confirm Delete', content: 'Delete this price record?',
      okText: 'Delete', okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

  const onSubmit = (data: CreatePriceFormData) => createMutation.mutate(data);

  // ========== Columns ==========
  const columnDefs: ColDef<PriceDto>[] = [
    { field: 'itemName', headerName: 'Item', flex: 1, minWidth: 160, filter: 'agTextColumnFilter', sortable: true },
    { field: 'supplierName', headerName: 'Supplier', flex: 1, minWidth: 160, filter: 'agTextColumnFilter', sortable: true },
    {
      field: 'price', headerName: 'Price', width: 140, editable: true, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value?.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'currency', headerName: 'Currency', width: 110, editable: true,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: [...currencyValues] },
      filter: 'agTextColumnFilter', sortable: true,
      cellRenderer: (params: { value: string }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded border border-secondary/30 bg-secondary/10 text-secondary text-[11px] font-medium">{params.value}</span>
      ),
    },
    {
      field: 'effectiveDate', headerName: 'Effective Date', width: 140, sortable: true,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    { field: 'remark', headerName: 'Remark', flex: 1, minWidth: 120, editable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Action', width: 70, pinned: 'right', sortable: false, filter: false,
      cellRenderer: (params: { data: PriceDto }) => (
        <div className="flex items-center justify-center h-full">
          <button className="text-primary hover:text-surface-tint p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(params.data.id)}>
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Page Header — Figma breadcrumb */}
      <div className="mb-xs">
        <h2 className="font-h3 text-h3 text-on-surface">Assign New Price</h2>
        <div className="flex items-center text-sm text-on-surface-variant mt-2">
          <span className="hover:text-primary cursor-pointer">Starry VietNam</span>
          <span className="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
          <span className="hover:text-primary cursor-pointer">Price Management</span>
          <span className="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
          <span className="text-on-surface">Add New Price</span>
        </div>
      </div>

      {/* Figma 2-column: Form (1/3) + Grid (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter flex-1" style={{ minHeight: 'calc(100vh - 220px)' }}>

        {/* ======== Form — React Hook Form + Zod ======== */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Item Select */}
            <div className="flex flex-col space-y-1">
              <label className="font-label-md text-label-md text-on-surface">Select Item <span className="text-error">*</span></label>
              <div className="relative">
                <select className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white ${errors.itemId ? 'border-error' : 'border-[#d9d9d9]'}`} {...register('itemId')}>
                  <option value="">Select an item...</option>
                  {items.map((item) => <option key={item.id} value={item.id}>{item.itemCode} — {item.itemName}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
              {errors.itemId && <p className="text-error text-xs">{errors.itemId.message}</p>}
            </div>

            {/* Supplier Select */}
            <div className="flex flex-col space-y-1">
              <label className="font-label-md text-label-md text-on-surface">Select Supplier <span className="text-error">*</span></label>
              <div className="relative">
                <select className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white ${errors.supplierId ? 'border-error' : 'border-[#d9d9d9]'}`} {...register('supplierId')}>
                  <option value="">Select a supplier...</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplierCode} — {s.supplierName}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
              {errors.supplierId && <p className="text-error text-xs">{errors.supplierId.message}</p>}
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="font-label-md text-label-md text-on-surface">Price <span className="text-error">*</span></label>
                <input type="number" step="0.01" placeholder="0.00" className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.price ? 'border-error' : 'border-[#d9d9d9]'}`} {...register('price', { valueAsNumber: true })} />
                {errors.price && <p className="text-error text-xs">{errors.price.message}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="font-label-md text-label-md text-on-surface">Currency <span className="text-error">*</span></label>
                <div className="relative">
                  <select className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white ${errors.currency ? 'border-error' : 'border-[#d9d9d9]'}`} {...register('currency')}>
                    {currencyValues.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                </div>
                {errors.currency && <p className="text-error text-xs">{errors.currency.message}</p>}
              </div>
            </div>

            {/* Effective Date */}
            <div className="flex flex-col space-y-1">
              <label className="font-label-md text-label-md text-on-surface">Effective Date <span className="text-error">*</span></label>
              <input type="date" className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white ${errors.effectiveDate ? 'border-error' : 'border-[#d9d9d9]'}`} {...register('effectiveDate')} />
              {errors.effectiveDate && <p className="text-error text-xs">{errors.effectiveDate.message}</p>}
            </div>

            {/* Remark */}
            <div className="flex flex-col space-y-1">
              <label className="font-label-md text-label-md text-on-surface">Remark</label>
              <textarea rows={3} placeholder="Enter any additional notes..." className="w-full border border-[#d9d9d9] rounded px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" {...register('remark')} />
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end space-x-2">
              <button type="button" className="px-4 py-1.5 border border-[#d9d9d9] rounded font-label-sm text-label-sm text-on-surface hover:border-primary hover:text-primary transition-colors bg-white" onClick={() => reset()}>Reset</button>
              <button type="submit" disabled={createMutation.isPending} className="px-4 py-1.5 bg-primary text-white rounded font-label-sm text-label-sm hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50">
                {createMutation.isPending ? 'Submitting...' : 'Submit Price'}
              </button>
            </div>
          </form>
        </div>

        {/* ======== Grid — Recent Price Records ======== */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-[#fafafa] rounded-t-lg">
            <h3 className="font-h5 text-h5 text-on-surface">Recent Price Records</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-[#d9d9d9] rounded font-label-sm text-label-sm text-on-surface bg-white hover:border-primary hover:text-primary flex items-center transition-colors" onClick={() => queryClient.invalidateQueries({ queryKey: ['prices'] })}>
                <span className="material-symbols-outlined text-[16px] mr-1">refresh</span> Refresh
              </button>
              <button className="px-3 py-1 border border-[#d9d9d9] rounded font-label-sm text-label-sm text-on-surface bg-white hover:border-primary hover:text-primary flex items-center transition-colors">
                <span className="material-symbols-outlined text-[16px] mr-1">download</span> Export
              </button>
            </div>
          </div>
          <div className="flex-1" style={{ minHeight: '400px' }}>
            <AgGridReact
              ref={gridRef}
              rowData={prices}
              columnDefs={columnDefs}
              loading={pricesLoading}
              defaultColDef={{ resizable: true, floatingFilter: true }}
              getRowId={(params) => params.data.id}
              onCellValueChanged={onCellValueChanged}
              animateRows pagination paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              className="ag-theme-alpine"
              theme="legacy"
            />
          </div>
        </div>
      </div>
    </>
  );
}
