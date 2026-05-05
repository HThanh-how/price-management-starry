'use client';

import React, { useCallback, useRef } from 'react';
import { Modal } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import type { PriceDto } from '@/types';
import { currencyValues } from '@/types/schemas';
import { usePriceGridData } from '../hooks/usePriceGridData';
import { priceKeys } from '../hooks/usePriceDropdownQueries';
import { useQueryClient } from '@tanstack/react-query';

ModuleRegistry.registerModules([AllCommunityModule]);

export function PriceGrid() {
  const queryClient = useQueryClient();
  const gridRef = useRef<AgGridReact>(null);
  const { pricesQuery, updateMutation, deleteMutation } = usePriceGridData();

  const prices = pricesQuery.data ?? [];

  const onCellValueChanged = useCallback((event: CellValueChangedEvent<PriceDto>) => {
    const { data } = event;
    if (!data) return;
    updateMutation.mutate({
      id: data.id,
      data: {
        price: data.price,
        currency: data.currency,
        effectiveDate: data.effectiveDate,
        remark: data.remark || undefined,
        rowVersion: data.rowVersion,
      },
    });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this price record?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

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
          <button
            className="text-primary hover:text-surface-tint p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDelete(params.data.id)}
            title="Delete Price"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-[#fafafa] rounded-t-lg">
        <h3 className="font-h5 text-h5 text-on-surface">Recent Price Records</h3>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 border border-[#d9d9d9] rounded font-label-sm text-label-sm text-on-surface bg-white hover:border-primary hover:text-primary flex items-center transition-colors"
            onClick={() => queryClient.invalidateQueries({ queryKey: priceKeys.all })}
            disabled={pricesQuery.isFetching}
          >
            <span className={`material-symbols-outlined text-[16px] mr-1 ${pricesQuery.isFetching ? 'animate-spin' : ''}`}>refresh</span> 
            {pricesQuery.isFetching ? 'Refreshing...' : 'Refresh'}
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
          loading={pricesQuery.isLoading}
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
  );
}
