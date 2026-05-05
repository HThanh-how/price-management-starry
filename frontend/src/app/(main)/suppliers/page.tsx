'use client';

import React, { useState, useCallback, useRef } from 'react';
import { message, Modal, Form, Input } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/api';
import type { SupplierDto, CreateSupplierRequest } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Master Supplier List — Figma pixel-perfect with AG Grid.
 */
export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const gridRef = useRef<AgGridReact>(null);

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: async () => {
      const response = await supplierService.getAll(1, 100, search || undefined);
      if (response.success) return response.data.items;
      throw new Error(response.message);
    },
  });
  const suppliers = suppliersData ?? [];

  const createMutation = useMutation({
    mutationFn: (request: CreateSupplierRequest) => supplierService.create(request),
    onSuccess: () => {
      message.success('Supplier created successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsCreateModalOpen(false);
      form.resetFields();
    },
    onError: (error: Error) => message.error(error.message || 'Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof supplierService.update>[1] }) =>
      supplierService.update(id, data),
    onSuccess: () => {
      message.success('Supplier updated successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update supplier');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierService.delete(id),
    onSuccess: () => {
      message.success('Supplier deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: Error) => message.error(error.message || 'Failed to delete supplier'),
  });

  const onCellValueChanged = useCallback((event: CellValueChangedEvent<SupplierDto>) => {
    const { data } = event;
    if (!data) return;
    updateMutation.mutate({
      id: data.id,
      data: {
        supplierName: data.supplierName, contactPerson: data.contactPerson || undefined,
        email: data.email || undefined, phone: data.phone || undefined,
        address: data.address || undefined, status: data.status, rowVersion: data.rowVersion,
      },
    });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: 'Confirm Delete', content: 'Are you sure you want to delete this supplier?',
      okText: 'Delete', okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        supplierCode: values.supplierCode, supplierName: values.supplierName,
        contactPerson: values.contactPerson, email: values.email,
        phone: values.phone, address: values.address,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
    }
  };

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
    <>
      {/* Page Header — Figma design tokens */}
      <div className="flex justify-between items-end bg-surface-container-lowest p-md rounded-lg border border-surface-container-high">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-xs">Master Supplier List</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and update supplier details, contacts, and operational status.</p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-56 transition-colors"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md flex items-center gap-2 shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Supplier
          </button>
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 bg-surface-container-lowest border border-surface-container-high rounded-lg overflow-hidden h-[calc(100vh-180px)]">
        <AgGridReact
          ref={gridRef}
          rowData={suppliers}
          columnDefs={columnDefs}
          loading={isLoading}
          defaultColDef={{ resizable: true, floatingFilter: true }}
          getRowId={(params) => params.data.id}
          onCellValueChanged={onCellValueChanged}
          animateRows pagination paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          className="ag-theme-alpine"
          theme="legacy"
        />
      </div>

      {/* Create Modal */}
      <Modal title="Create New Supplier" open={isCreateModalOpen} onOk={handleCreate}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }} okText="Create" confirmLoading={createMutation.isPending}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="supplierCode" label="Supplier Code" rules={[{ required: true, message: 'Supplier code is required' }]}>
            <Input placeholder="e.g., VNSUP-001" />
          </Form.Item>
          <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true, message: 'Supplier name is required' }]}>
            <Input placeholder="e.g., Mekong Delta Plastics JSC" />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person"><Input placeholder="e.g., Nguyen Van A" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
            <Input placeholder="e.g., contact@company.vn" />
          </Form.Item>
          <Form.Item name="phone" label="Phone"><Input placeholder="e.g., +84 28 3822 1234" /></Form.Item>
          <Form.Item name="address" label="Address"><Input.TextArea rows={2} placeholder="e.g., 123 Le Loi St, Dist 1, HCMC" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
