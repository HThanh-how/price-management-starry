import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import type { ItemDto } from '@/types';

interface ItemGridProps {
  items: ItemDto[];
  isLoading: boolean;
  onCellValueChanged: (event: CellValueChangedEvent<ItemDto>) => void;
  onViewDetail: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ItemGrid({ items, isLoading, onCellValueChanged, onViewDetail, onDelete }: ItemGridProps) {
  const gridRef = React.useRef<AgGridReact>(null);

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
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${active
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
          <button className="p-1 text-primary hover:bg-primary-fixed rounded" onClick={() => onViewDetail(params.data.id)} title="View Detail">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          <button className="p-1 text-error hover:bg-error-container rounded" onClick={() => onDelete(params.data.id)} title="Delete">
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
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
  );
}
