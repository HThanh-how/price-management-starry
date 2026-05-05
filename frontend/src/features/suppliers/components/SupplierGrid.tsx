'use client';

import React, { useCallback, useRef } from 'react';
import { Modal } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import type { SupplierDto } from '@/types';
import { useSupplierGridMutations } from '../hooks/useSupplierQueries';
import { appGridTheme } from '@/lib/gridTheme';
import { GRID_DEFAULT_PAGE_SIZE, GRID_PAGE_SIZE_OPTIONS } from '@/lib/constants';

ModuleRegistry.registerModules([AllCommunityModule]);

interface SupplierGridProps {
  suppliers: SupplierDto[];
  isLoading: boolean;
}

/**
 * Presentational component for Supplier AG Grid.
 * Owns its own update/delete mutations via useSupplierGridMutations hook.
 * Receives data from parent (Page container).
 */
export function SupplierGrid({ suppliers, isLoading }: SupplierGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const { updateMutation, deleteMutation } = useSupplierGridMutations();

  const onCellValueChanged = useCallback((event: CellValueChangedEvent<SupplierDto>) => {
    const { data } = event;
    if (!data) return;
    updateMutation.mutate({
      id: data.id,
      data: {
        supplierName: data.supplierName,
        contactPerson: data.contactPerson || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        status: data.status,
        rowVersion: data.rowVersion,
      },
    });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this supplier?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

  const columnDefs: ColDef<SupplierDto>[] = [
    { field: 'supplierCode', headerName: 'Supplier Code', width: 140, filter: 'agTextColumnFilter', sortable: true, pinned: 'left' },
    { field: 'supplierName', headerName: 'Supplier Name', flex: 1, minWidth: 200, editable: true, filter: 'agTextColumnFilter', sortable: true },
    { field: 'contactPerson', headerName: 'Contact Person', width: 160, editable: true, filter: 'agTextColumnFilter' },
    { field: 'email', headerName: 'Email', width: 200, editable: true, filter: 'agTextColumnFilter' },
    { field: 'phone', headerName: 'Phone', width: 150, editable: true, filter: 'agTextColumnFilter' },
    { field: 'address', headerName: 'Address', flex: 1, minWidth: 200, editable: true, filter: 'agTextColumnFilter' },
    {
      field: 'status', headerName: 'Status', width: 110, editable: true,
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
      headerName: 'Act', width: 70, pinned: 'right', sortable: false, filter: false,
      cellRenderer: (params: { data: SupplierDto }) => (
        <div className="flex items-center justify-center h-full">
          <button className="p-1 text-error hover:bg-error-container rounded" onClick={() => handleDelete(params.data.id)} title="Delete">
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 bg-surface-container-lowest border border-surface-container-high rounded-lg overflow-hidden h-[calc(100vh-180px)]">
      <AgGridReact
        ref={gridRef}
        rowData={suppliers}
        columnDefs={columnDefs}
        loading={isLoading}
        defaultColDef={{ resizable: true, floatingFilter: true }}
        getRowId={(params) => params.data.id}
        onCellValueChanged={onCellValueChanged}
        animateRows pagination paginationPageSize={GRID_DEFAULT_PAGE_SIZE}
        paginationPageSizeSelector={[...GRID_PAGE_SIZE_OPTIONS]}
        theme={appGridTheme}
      />
    </div>
  );
}
